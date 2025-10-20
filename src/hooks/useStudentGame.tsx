

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
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
}

interface FullStudentState extends StudentGameState {
  round?: number;
  decisions: RoundDecisions;
  roundSettings?: Record<string, RoundSettings>;
  messages?: GameMessage[];
  performanceHistory?: TeamPerformanceData[];
  kpis?: TeamKPIs;
}

interface StudentGameContextType {
  studentGame: FullStudentState | null;
  isLoading: boolean;
  requestToJoinGame: (gameId: string, gameName: string, teamName: string) => Promise<void>;
  abandonGame: () => Promise<void>;
  setRoundDecisions: (decisions: Partial<RoundDecisions>) => void;
  saveStudentDecisions: () => Promise<void>;
  setStrategicPlan: (plan: Partial<StrategicPlan>) => Promise<void>;
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

  
  // Effect to listen to the current student's game state document in Firestore
  useEffect(() => {
    if (!firestore || !user?.id) {
      setIsLoading(isAuthLoading);
      return;
    }
    
    setIsLoading(true);
    const studentGameRef = doc(firestore, "studentGames", user.id);

    const unsubscribe = onSnapshot(studentGameRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudentGameState(docSnap.data() as StudentGameState);
      } else {
        // If no document exists, create one with the initial state
        const initialData = { ...initialStudentState, userId: user.id };
        setDoc(studentGameRef, initialData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: `studentGames/${user.id}`,
            operation: 'create',
            requestResourceData: initialData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
        setStudentGameState(initialData);
      }
      setIsLoading(false);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: `studentGames/${user.id}`,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching student game state:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, user, isAuthLoading]);

  // Effect to derive the full student state by combining studentGameState and the global game data
  useEffect(() => {
    if (!studentGameState || !user) {
      setFullStudentState(null);
      return;
    }
    
    if ((studentGameState.status === 'pending' || studentGameState.status === 'joined') && studentGameState.gameId && !gamesLoading) {
        const gameExists = games.some(g => g.id === studentGameState.gameId);
        if (!gameExists) {
            const resetState: StudentGameState = { ...initialStudentState, userId: user.id };
            if(firestore) {
              setDoc(doc(firestore, "studentGames", user.id), resetState);
            }
            setStudentGameState(resetState); 
            return;
        }
    }

    if (!studentGameState.gameId || studentGameState.status !== 'joined') {
      setFullStudentState(studentGameState ? { ...studentGameState, decisions: initialRoundDecisions } : null);
      return;
    }
    
    const gameData = games.find(g => g.id === studentGameState.gameId);
    if (!gameData) {
      setFullStudentState(studentGameState ? { ...studentGameState, decisions: initialRoundDecisions } : null);
      return;
    }

    const serverRound = gameData.round;
    const clientRound = fullStudentState?.round;

    // BUG FIX: Check if the round has advanced. If so, reset local decisions.
    if (clientRound !== undefined && serverRound > clientRound) {
        setFullStudentState(prev => prev ? { ...prev, decisions: initialRoundDecisions } : null);
    }
    
    const serverDecisions = gameData.decisions?.[serverRound]?.[studentGameState.teamName!];
    
    let currentDecisions = serverDecisions || fullStudentState?.decisions || initialRoundDecisions;
    
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
        const perfR0 = gameData.performance?.[0]?.find(p => p.name === studentGameState.teamName);
        if (perfR0) {
            currentKpis = perfR0.kpis;
        } else {
             // A human team always has an AI rival, so total participants = num human teams * 2
            const totalParticipants = gameData.teams * 2;
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


    setFullStudentState({
      ...studentGameState,
      round: serverRound,
      decisions: currentDecisions,
      roundSettings: gameData.roundSettings,
      messages: gameData.messages?.filter(m => m.to === 'all' || m.to === studentGameState.teamName || m.from === studentGameState.teamName),
      performanceHistory,
      kpis: currentKpis
    });

  }, [studentGameState, games, gamesLoading, user, firestore]);


  const requestToJoinGame = async (gameId: string, gameName: string, teamName: string) => {
    if (!firestore || !user) return;
  
    const studentGameRef = doc(firestore, "studentGames", user.id);
    const studentState: StudentGameState = {
      ...initialStudentState,
      userId: user.id,
      status: 'pending',
      gameId, gameName, teamName
    };
  
    setDoc(studentGameRef, studentState, { merge: true }).catch(async (serverError) => {
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
  
    updateDoc(gameRef, joinRequestData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `games/${gameId}`,
        operation: 'update',
        requestResourceData: { teamName, userId: user.id },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
    
    router.push('/student/dashboard');
  };
  

  const abandonGame = async () => {
    if (!firestore || !user || !studentGameState?.gameId || !studentGameState?.teamName) return;
    
    const game = games.find(g => g.id === studentGameState.gameId);
    if (game) {
      const updatedTeamNames = game.teamNames.filter(name => name !== studentGameState.teamName);
      await updateGame(game.id, { teamNames: updatedTeamNames });
    }

    await setDoc(doc(firestore, "studentGames", user.id), {
        ...initialStudentState,
        userId: user.id,
    }, { merge: true });

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
            crisisResponse: updatedDecisions.crisisResponse ? { ...updatedDecisions.crisisResponse, cost: updatedDecisions.crisisResponse.cost || 0 } : null,
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
    
    try {
      // READ: Get the current game document
      const gameDoc = await getDoc(gameRef);
      if (!gameDoc.exists()) {
        throw new Error("Game document not found, cannot save decisions.");
      }
      const gameData = gameDoc.data();
      const round = fullStudentState.round;
      const teamName = fullStudentState.teamName;
      
      const decisionsToSave = { ...fullStudentState.decisions };

      // Firestore does not support `undefined` values.
      // If `poachingTarget` is not set, remove it from the object.
      if (decisionsToSave.poachingTarget === undefined) {
        delete decisionsToSave.poachingTarget;
      }
  
      // MODIFY: Create the new, merged decisions object in memory
      const newDecisions = {
        ...(gameData.decisions || {}), // Start with existing decisions object
        [round]: {
          ...(gameData.decisions?.[round] || {}), // Keep other teams' decisions for the round
          [teamName]: decisionsToSave, // Overwrite or add this team's decisions
        }
      };
      
      const updateData = { decisions: newDecisions };
  
      // WRITE: Update the document with the complete, merged decisions object
      await updateDoc(gameRef, updateData);
    } catch (error: any) {
        // This will now properly catch permission errors if they occur
        const permissionError = new FirestorePermissionError({
            path: gameRef.path,
            operation: 'update',
            requestResourceData: { decisions: '...' }, // Can't send the full object, but can provide context
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error saving student decisions:", error);
        throw error; // Re-throw the error to be caught by the component's try/catch
    }
  }

  const setStrategicPlan = async (plan: Partial<StrategicPlan>) => {
    if (!firestore || !user || !studentGameState) return;
    const studentGameRef = doc(firestore, "studentGames", user.id);
    const newPlan = { ...(studentGameState.strategicPlan || {}), ...plan };
    const updateData = {
      strategicPlan: newPlan,
      planConfirmed: newPlan.confirmed
    };
    
    setDoc(studentGameRef, updateData, { merge: true }).catch(async (serverError) => {
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
    isLoading: isLoading || isAuthLoading || gamesLoading,
    requestToJoinGame,
    abandonGame,
    setRoundDecisions,
    saveStudentDecisions,
    setStrategicPlan,
  }), [fullStudentState, isLoading, isAuthLoading, gamesLoading, requestToJoinGame, abandonGame, setRoundDecisions, saveStudentDecisions, setStrategicPlan]);

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

