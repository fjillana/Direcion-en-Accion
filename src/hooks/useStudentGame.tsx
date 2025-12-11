
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useGames, type RoundSettings, type GameMessage, TeamPerformanceData, type Game } from "./use-games";
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
  debugStatus: string;
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
  const { confirmStudentDecisions, updateGame } = useGames();
  const { user, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const [studentGameState, setStudentGameState] = useState<StudentGameState | null>(null);
  const [gameData, setGameData] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugStatus, setDebugStatus] = useState("Iniciando Hook...");

  // Effect 1: Listen to the student's personal game state document
  useEffect(() => {
    if (isAuthLoading) {
      setDebugStatus("Esperando autenticación...");
      return;
    }
    
    if (!user) {
      setDebugStatus("Auth lista. No hay usuario.");
      setIsLoading(false);
      setStudentGameState(null);
      setGameData(null);
      return;
    }

    if (!firestore) {
      setDebugStatus("Auth lista. Esperando Firestore...");
      return;
    }
    
    setIsLoading(true);
    setDebugStatus(`Usuario detectado (${user.id}). Suscribiendo a studentGames...`);
    const studentGameRef = doc(firestore, "studentGames", user.id);

    const unsubscribe = onSnapshot(studentGameRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudentGameState(docSnap.data() as StudentGameState);
        setDebugStatus("Estado del estudiante cargado.");
      } else {
        const initialData = { ...initialStudentState, userId: user.id };
        setDoc(studentGameRef, initialData); // Create the doc if it doesn't exist
        setStudentGameState(initialData);
        setDebugStatus("Documento de estudiante no existía. Creando uno nuevo.");
      }
    }, (error) => {
        setDebugStatus(`ERROR en studentGames: ${error.message}`);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user, isAuthLoading]);

  // Effect 2: Once we know the student's gameId, listen to that specific game document
  useEffect(() => {
    if (!firestore || !studentGameState) {
        return;
    }

    const { gameId, status } = studentGameState;

    if (!gameId || status !== 'joined') {
        // If no gameId or not 'joined', we don't need to fetch game data.
        // We consider the loading process "finished" for now.
        setGameData(null);
        setIsLoading(false);
        setDebugStatus(status === 'pending' ? 'Estado: Pendiente de aprobación' : 'Estado: Sin partida');
        return;
    }

    setIsLoading(true);
    setDebugStatus(`Detectado Game ID: ${gameId}. Suscribiendo a la partida...`);
    const gameRef = doc(firestore, "games", gameId);

    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameData({ id: docSnap.id, ...docSnap.data() } as Game);
        setDebugStatus("Datos de la partida cargados.");
      } else {
        setDebugStatus("La partida del estudiante no existe. Reseteando estado.");
        // If the game doc doesn't exist, reset the student's state
        const studentGameRef = doc(firestore, "studentGames", studentGameState.userId);
        setDoc(studentGameRef, { ...initialStudentState, userId: studentGameState.userId }, { merge: true });
      }
      setIsLoading(false); // Loading is false once we get a response
    }, (error) => {
      setDebugStatus(`ERROR en games: ${error.message}`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, studentGameState]);


  // Effect 3: Create the final combined state object for the context
  const fullStudentState = useMemo<FullStudentState | null>(() => {
    if (!studentGameState) return null;

    if (!gameData || studentGameState.status !== 'joined') {
      return { ...studentGameState, decisions: initialRoundDecisions };
    }

    const { teamName } = studentGameState;
    const serverRound = gameData.round;
    const decisionsForRound = gameData.decisions?.[serverRound]?.[teamName!] || initialRoundDecisions;
    
    const performanceHistory: TeamPerformanceData[] = [];
    let currentKpis: TeamKPIs | undefined = undefined;

    if (gameData.performance) {
      Object.keys(gameData.performance).sort((a, b) => parseInt(a) - parseInt(b)).forEach(roundKey => {
        const roundNum = parseInt(roundKey, 10);
        const teamPerformance = gameData.performance![roundNum].find(p => p.name === teamName);
        if (teamPerformance) {
          performanceHistory.push(teamPerformance);
          if (roundNum === serverRound - 1) { 
            currentKpis = teamPerformance.kpis;
          }
        }
      });
    }

    if (serverRound === 0 && !currentKpis) {
        currentKpis = {
            cash: gameData.initialFunds,
            personnelCost: 240000, income: 0, privateIncome: 0, publicIncome: 0,
            nma: 7.5, marketShare: 100 / (gameData.teams * 2 || 1), morale: 80,
            studentTeacherRatio: 25.0, numStudents: 800, numTeachers: 32, capacity: 810,
        };
    }
    
    const isBlindRound = !!gameData.roundSettings?.[serverRound]?.isBlind;

    return {
      ...studentGameState,
      round: serverRound,
      decisions: decisionsForRound,
      roundSettings: gameData.roundSettings,
      messages: gameData.messages?.filter(m => m.to === 'all' || m.to === teamName || m.from === teamName),
      performanceHistory,
      kpis: currentKpis,
      isBlindRound,
    };
  }, [studentGameState, gameData]);


  const requestToJoinGame = async (gameId: string, gameName: string, teamName: string) => {
    if (!firestore || !user) return;
  
    const studentGameRef = doc(firestore, "studentGames", user.id);
    const studentState: StudentGameState = {
      ...initialStudentState,
      userId: user.id,
      status: 'pending',
      gameId, gameName, teamName
    };
  
    await setDoc(studentGameRef, studentState, { merge: true });
  
    const gameRef = doc(firestore, "games", gameId);
    const joinRequestData = {
      pendingJoinRequests: arrayUnion({ userId: user.id, teamName: teamName, requestedAt: Date.now() })
    };
  
    await updateDoc(gameRef, joinRequestData, { merge: true });
    // No navigation here, useEffect in page.tsx will handle it
  };
  

  const abandonGame = async () => {
    if (!firestore || !user || !studentGameState) return;
    
    const { gameId, teamName } = studentGameState;

    // First, always reset the student's own state.
    const studentGameRef = doc(firestore, "studentGames", user.id);
    await setDoc(studentGameRef, {
        ...initialStudentState,
        userId: user.id,
    }, { merge: true });

    if (gameId && teamName) {
        const gameDoc = await getDoc(doc(firestore, "games", gameId));
        if (gameDoc.exists()) {
            const gameData = gameDoc.data() as Game;
            const updatedTeamNames = gameData.teamNames.filter(name => name !== teamName);
            await updateGame(gameId, { teamNames: updatedTeamNames });
        }
    }
    // No navigation here, useEffect in page.tsx will handle it
  };
  
  const setRoundDecisions = (newDecisions: Partial<RoundDecisions>) => {
    if (!fullStudentState) return;

    const updatedDecisions: RoundDecisions = {
        ...(fullStudentState.decisions || initialRoundDecisions),
        ...newDecisions,
        actions: newDecisions.actions !== undefined ? newDecisions.actions : (fullStudentState.decisions?.actions || []),
        investmentCosts: { ...(fullStudentState.decisions?.investmentCosts || {}), ...newDecisions.investmentCosts },
    };

    if (newDecisions.roundConfirmed) {
      const finalDecisions: TeamDecision = {
        ...updatedDecisions,
        crisisResponse: updatedDecisions.crisisResponse ? { ...updatedDecisions.crisisResponse, cost: updatedDecisions.crisisResponse.cost || 0, outcomeDescription: "" } : null,
      };
      confirmStudentDecisions(fullStudentState.gameId!, fullStudentState.teamName!, fullStudentState.round!, finalDecisions);
    }
  };

  const saveStudentDecisions = async () => {
    if (!firestore || !user || !fullStudentState || !fullStudentState.gameId || !fullStudentState.teamName || fullStudentState.round === undefined) {
      throw new Error("Cannot save decisions: missing game or user state.");
    }
  
    const gameRef = doc(firestore, "games", fullStudentState.gameId);
    
    const decisionsToSave: Partial<RoundDecisions> = { ...(fullStudentState.decisions || {}) };

    if (decisionsToSave.poachingTarget === undefined) {
      delete decisionsToSave.poachingTarget;
    }
    if (decisionsToSave.poachingSuccess === undefined) {
      delete decisionsToSave.poachingSuccess;
    }

    const updateData = {
      [`decisions.${fullStudentState.round}.${fullStudentState.teamName}`]: decisionsToSave
    };

    await updateDoc(gameRef, updateData, { merge: true });
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

    await setDoc(studentGameRef, updateData, { merge: true });
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
  }), [fullStudentState, isLoading, debugStatus]);

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
