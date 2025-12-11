
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from "react";
import { useGames, type RoundSettings, type GameMessage, TeamPerformanceData } from "./use-games";
import { useRouter } from "next/navigation";
import { StrategicPlan, TeamKPIs } from "@/lib/game-logic/types";
import { useAuth } from "./use-auth";
import { doc, onSnapshot, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { TeamDecision, CrisisDecision } from "@/hooks/use-games";


type StudentGameStatus = "no-game" | "pending" | "joined";

export interface StudentGameState {
  userId: string;
  status: StudentGameStatus;
  gameId: string | null;
  gameName: string | null;
  teamName: string | null;
  planConfirmed?: boolean;
  strategicPlan?: StrategicPlan;
  unlockedAchievements?: string[];
}

export interface RoundDecisions extends Omit<TeamDecision, 'crisisResponse'> {
    crisisResponse: (Omit<CrisisDecision, 'cost'> & { cost?: number }) | null;
    poachingTarget?: string;
    poachingSuccess?: boolean;
}

interface FullStudentState extends StudentGameState {
  round?: number;
  decisions: RoundDecisions;
  roundSettings?: Record<string, RoundSettings>;
  messages?: GameMessage[];
  performanceHistory?: TeamPerformanceData[];
  kpis?: TeamKPIs;
  isBlindRound?: boolean;
}

interface StudentGameContextType {
  studentGame: FullStudentState | null;
  isLoading: boolean;
  requestToJoinGame: (gameId: string, gameName: string, teamName: string) => Promise<void>;
  abandonGame: () => Promise<void>;
  setRoundDecisions: (decisions: Partial<RoundDecisions>) => void;
  saveStudentDecisions: () => Promise<void>;
  setStrategicPlan: (plan: Partial<StrategicPlan>) => Promise<void>;
  debugStatus: string; // For debugging purposes
}

const StudentGameContext = createContext<StudentGameContextType | undefined>(undefined);

const initialStudentState: Omit<StudentGameState, 'userId'> = {
  status: "no-game",
  gameId: null,
  gameName: null,
  teamName: null,
  planConfirmed: false,
  strategicPlan: {
    confirmed: false, rankingGoal: "",
    targets: {
      cash: { target: 50000, operator: "min" },
      personnelCost: { target: 75, operator: "max" },
      nma: { target: 8.5, operator: "min" },
      marketShare: { target: 18, operator: "min" },
      morale: { target: 85, operator: "min" },
      studentTeacherRatio: { target: 23, operator: "max" },
    }
  },
  unlockedAchievements: []
};

const initialRoundDecisions: RoundDecisions = {
  actions: [],
  investmentCosts: {},
  tuitionPrice: 120,
  crisisResponse: null,
  roundConfirmed: false,
  poachingTarget: undefined,
};


export function StudentGameProvider({ children }: { children: ReactNode }) {
  const { games, confirmStudentDecisions, updateGame, loading: gamesLoading } = useGames();
  const { user, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [studentGameState, setStudentGameState] = useState<StudentGameState | null>(null);
  const [fullStudentState, setFullStudentState] = useState<FullStudentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugStatus, setDebugStatus] = useState("Iniciando Hook...");


  useEffect(() => {
    if (isAuthLoading) {
      setDebugStatus("Esperando autenticación...");
      setIsLoading(true);
      return;
    }

    if (!user) {
      setDebugStatus("Auth OK, no hay usuario. Carga finalizada.");
      setIsLoading(false);
      setStudentGameState(null);
      setFullStudentState(null);
      return;
    }

    if (!firestore) {
      setDebugStatus("Usuario OK, esperando Firestore...");
      setIsLoading(true);
      return;
    }

    setDebugStatus(`Usuario y Firestore OK. Suscribiendo a /studentGames/${user.id}`);
    const studentGameRef = doc(firestore, "studentGames", user.id);
    const unsubscribe = onSnapshot(studentGameRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudentGameState(docSnap.data() as StudentGameState);
        setDebugStatus("Datos del estudiante recibidos.");
      } else {
        const initialData = { ...initialStudentState, userId: user.id };
        setDoc(studentGameRef, initialData);
        setStudentGameState(initialData);
        setDebugStatus("Documento de estudiante no encontrado, creando uno nuevo.");
      }
    }, (error) => {
      console.error("Error en onSnapshot de studentGames:", error);
      setDebugStatus(`ERROR al leer studentGames: ${error.message}`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthLoading, user, firestore]);

  useEffect(() => {
    if (gamesLoading) {
      setDebugStatus("Cargando lista de partidas...");
      setIsLoading(true);
      return;
    }
    
    if (!studentGameState) {
      // If auth is done but we have no studentGameState, the user is new/logged out.
      // We can consider loading finished.
      if(!isAuthLoading){
        setIsLoading(false);
        setDebugStatus("Estado del estudiante es nulo. Carga finalizada.");
      }
      return;
    }

    const { gameId, teamName, status } = studentGameState;
    
    if (status !== 'joined' || !gameId) {
      setFullStudentState({ ...studentGameState, decisions: initialRoundDecisions });
      setIsLoading(false);
      setDebugStatus(`Estudiante no está en partida. Estado: ${status}. Carga finalizada.`);
      return;
    }

    const gameData = games.find(g => g.id === gameId);

    if (!gameData) {
      // The student thinks they are in a game, but it's not in the 'games' list.
      // This could be a race condition or the game was deleted.
      // We wait a bit, but if it persists, we should probably reset the student state.
      setDebugStatus(`Partida ${gameId} no encontrada en la lista de juegos. Esperando...`);
      return; // Wait for games list to potentially update.
    }
    
    setDebugStatus(`Partida ${gameId} encontrada. Componiendo estado completo...`);
    const serverRound = gameData.round;
    const decisionsForRound = gameData.decisions?.[serverRound]?.[teamName!] || initialRoundDecisions;
    
    const performanceHistory: TeamPerformanceData[] = [];
    let currentKpis: TeamKPIs | undefined = undefined;

    if (gameData.performance) {
        Object.keys(gameData.performance).sort((a, b) => parseInt(a) - parseInt(b)).forEach(roundKey => {
            const roundNum = parseInt(roundKey, 10);
            const teamPerformance = gameData.performance![roundNum].find(p => p.name === studentGameState.teamName);
            if (teamPerformance) {
                performanceHistory.push(teamPerformance);
                if (roundNum === serverRound - 1) { 
                    currentKpis = teamPerformance.kpis;
                }
            }
        });
    }
    
    if (serverRound === 0 && !currentKpis) {
        const perfR0 = gameData.performance?.[0]?.find(p => p.name === teamName);
        if (perfR0) {
            currentKpis = perfR0.kpis;
        } else {
            const totalParticipants = gameData.teamNames.length * 2;
             currentKpis = {
                cash: gameData.initialFunds,
                personnelCost: 240000, 
                income: 0,
                privateIncome: 0,
                publicIncome: 0,
                nma: 7.5,
                marketShare: totalParticipants > 0 ? 100 / totalParticipants : 100,
                morale: 80,
                studentTeacherRatio: 25.0,
                numStudents: 800,
                numTeachers: 32,
                capacity: 810,
            };
        }
    }
    
    const isBlindRound = !!gameData.roundSettings?.[serverRound]?.isBlind;

    setFullStudentState({
      ...studentGameState,
      round: serverRound,
      decisions: decisionsForRound,
      roundSettings: gameData.roundSettings,
      messages: gameData.messages?.filter(m => m.to === 'all' || m.to === studentGameState.teamName || m.from === studentGameState.teamName),
      performanceHistory,
      kpis: currentKpis,
      isBlindRound,
    });
    
    setIsLoading(false);
    setDebugStatus(`✅ Carga completa.`);

  }, [studentGameState, games, gamesLoading, isAuthLoading]);


  const requestToJoinGame = async (gameId: string, gameName: string, teamName: string) => {
    if (!firestore || !user) return;
  
    const studentGameRef = doc(firestore, "studentGames", user.id);
    const studentState: StudentGameState = {
      ...initialStudentState,
      userId: user.id,
      status: 'pending',
      gameId, gameName, teamName
    };
  
    await setDoc(studentGameRef, studentState, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `studentGames/${user.id}`,
        operation: 'update',
        requestResourceData: studentState,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  
    const gameRef = doc(firestore, "games", gameId);
    const joinRequestData = {
      pendingJoinRequests: arrayUnion({ userId: user.id, teamName: teamName, requestedAt: Date.now() })
    };
  
    await updateDoc(gameRef, joinRequestData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `games/${gameId}`,
        operation: 'update',
        requestResourceData: { teamName, userId: user.id },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  

  const abandonGame = async () => {
    if (!firestore || !user || !studentGameState) return;
    
    const { gameId, teamName } = studentGameState;

    const studentGameRef = doc(firestore, "studentGames", user.id);
    await setDoc(studentGameRef, {
        ...initialStudentState,
        userId: user.id,
    }, { merge: true });

    if (gameId && teamName) {
        const game = games.find(g => g.id === gameId);
        if (game) {
            const updatedTeamNames = game.teamNames.filter(name => name !== teamName);
            await updateGame(gameId, { teamNames: updatedTeamNames });
        }
    }

    router.push('/student/join-game');
  };
  
  const setRoundDecisions = (newDecisions: Partial<RoundDecisions>) => {
    if (!fullStudentState) return;

    setFullStudentState(prev => {
        if (!prev) return null;
        
        const updatedDecisions: RoundDecisions = {
            ...prev.decisions,
            ...newDecisions,
            actions: newDecisions.actions !== undefined ? newDecisions.actions : prev.decisions.actions,
            investmentCosts: { ...(prev.decisions.investmentCosts || {}), ...newDecisions.investmentCosts },
        };

        if (newDecisions.roundConfirmed) {
          const finalDecisions: TeamDecision = {
            ...updatedDecisions,
            crisisResponse: updatedDecisions.crisisResponse ? { ...updatedDecisions.crisisResponse, cost: updatedDecisions.crisisResponse.cost || 0, outcomeDescription: "" } : null,
          };
          confirmStudentDecisions(prev.gameId!, prev.teamName!, prev.round!, finalDecisions);
        }

        return { ...prev, decisions: updatedDecisions };
    });
  };

  const saveStudentDecisions = async () => {
    if (!firestore || !user || !fullStudentState || !fullStudentState.gameId || !fullStudentState.teamName || fullStudentState.round === undefined) {
      throw new Error("Cannot save decisions: missing game or user state.");
    }
  
    const gameRef = doc(firestore, "games", fullStudentState.gameId);
    
    const round = fullStudentState.round;
    const teamName = fullStudentState.teamName;
    
    const decisionsToSave: Partial<RoundDecisions> = { ...fullStudentState.decisions };

    if (decisionsToSave.poachingTarget === undefined) {
      delete decisionsToSave.poachingTarget;
    }
    if (decisionsToSave.poachingSuccess === undefined) {
      delete decisionsToSave.poachingSuccess;
    }

    const updateData = {
      [`decisions.${round}.${teamName}`]: decisionsToSave
    };

    await updateDoc(gameRef, updateData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: gameRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
  }

  const setStrategicPlan = async (plan: Partial<StrategicPlan>) => {
    if (!firestore || !user || !studentGameState) return;

    const newPlan = JSON.parse(JSON.stringify(studentGameState.strategicPlan || initialStudentState.strategicPlan));

    if (plan.targets) {
        for (const key in plan.targets) {
            const k = key as keyof StrategicPlan['targets'];
            if (newPlan.targets[k]) {
                newPlan.targets[k] = {
                    ...newPlan.targets[k],
                    target: (plan.targets as any)[k].target
                };
            }
        }
    }

    if (plan.rankingGoal !== undefined) {
        newPlan.rankingGoal = plan.rankingGoal;
    }
    if (plan.confirmed !== undefined) {
        newPlan.confirmed = plan.confirmed;
    }

    const studentGameRef = doc(firestore, "studentGames", user.id);
    const updateData = {
        strategicPlan: newPlan,
        planConfirmed: newPlan.confirmed
    };

    await setDoc(studentGameRef, updateData, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: `studentGames/${user.id}`,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const value = useMemo(() => ({
    studentGame: fullStudentState,
    isLoading: isLoading,
    requestToJoinGame,
    abandonGame,
    setRoundDecisions,
    saveStudentDecisions,
    setStrategicPlan,
    debugStatus,
  }), [fullStudentState, isLoading, requestToJoinGame, abandonGame, setRoundDecisions, saveStudentDecisions, setStrategicPlan, debugStatus]);

  return (
    <StudentGameContext.Provider value={value}>
      {children}
    </StudentGameContext.Provider>
  );
}

export function useStudentGame() {
  const context = useContext(StudentGameContext);
  if (context === undefined) {
    throw new Error("useStudentGame must be used within a StudentGameProvider");
  }
  return context;
}
