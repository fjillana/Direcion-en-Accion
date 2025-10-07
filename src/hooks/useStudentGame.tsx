

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useGames, type RoundSettings, type GameMessage, TeamPerformanceData, InvestmentDecision, TeamDecision } from "./use-games";
import { useRouter } from "next/navigation";
import { StrategicPlan, TeamKPIs } from "@/lib/game-logic/types";
import { useAuth } from "./use-auth";
import { doc, onSnapshot, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


type StudentGameStatus = "no-game" | "pending" | "joined";

export interface StudentGameState {
  userId: string;
  status: StudentGameStatus;
  gameId: string | null;
  gameName: string | null;
  teamName: string | null;
  planConfirmed?: boolean;
  strategicPlan?: StrategicPlan;
}

export interface RoundDecisions {
  selectedInvestments: InvestmentDecision[];
  selectedCenterActions: string[];
  tuitionPrice: number;
  crisisResponse: {
      crisisId: string;
      optionId: string;
      justification: string;
      crisisName: string;
      option: string;
  } | null;
  roundConfirmed: boolean;
}

interface FullStudentState extends StudentGameState {
  round?: number;
  decisions: RoundDecisions;
  roundSettings?: RoundSettings;
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
  }
};

const initialRoundDecisions: RoundDecisions = {
  selectedInvestments: [],
  selectedCenterActions: [],
  tuitionPrice: 120,
  crisisResponse: null,
  roundConfirmed: false,
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
    
    // If student is pending/joined but game list is loaded and game doesn't exist, reset state.
    if ((studentGameState.status === 'pending' || studentGameState.status === 'joined') && studentGameState.gameId && !gamesLoading) {
        const gameExists = games.some(g => g.id === studentGameState.gameId);
        if (!gameExists) {
            const resetState: StudentGameState = { ...initialStudentState, userId: user.id };
            if(firestore) {
              setDoc(doc(firestore, "studentGames", user.id), resetState);
            }
            // Directly update the local state to trigger UI changes immediately
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
    const hasRoundChanged = clientRound !== serverRound;

    let currentDecisions = gameData.decisions?.[serverRound]?.[studentGameState.teamName!] || 
                           (hasRoundChanged ? { ...initialRoundDecisions, tuitionPrice: fullStudentState?.decisions.tuitionPrice || 120 } : fullStudentState?.decisions || initialRoundDecisions);
    
    const performanceHistory: TeamPerformanceData[] = [];
    let currentKpis: TeamKPIs | undefined = undefined;

    if (gameData.performance) {
        Object.keys(gameData.performance).sort((a, b) => parseInt(a) - parseInt(b)).forEach(roundKey => {
            const roundNum = parseInt(roundKey, 10);
            const teamPerformance = gameData.performance![roundNum].find(p => p.name === studentGameState.teamName);
            if (teamPerformance) {
                performanceHistory.push(teamPerformance);
                if (roundNum === serverRound - 1) { // KPIs for current round are from last round's performance
                    currentKpis = teamPerformance.kpis;
                }
            }
        });
    }
    
    // For Round 0, initialize KPIs with game's initial funds
    if (serverRound === 0 && !currentKpis) {
        const perfR0 = gameData.performance?.[0]?.find(p => p.name === studentGameState.teamName);
        if (perfR0) {
            currentKpis = perfR0.kpis;
        } else {
             currentKpis = {
                cash: gameData.initialFunds,
                personnelCost: 240000, 
                income: 0,
                privateIncome: 0,
                publicIncome: 0,
                nma: 7.5,
                marketShare: 100 / (gameData.teamNames.length + (gameData.teams - gameData.teamNames.length)),
                morale: 80,
                studentTeacherRatio: 25.0,
                numStudents: 800,
                numTeachers: 32,
            };
        }
    }


    setFullStudentState({
      ...studentGameState,
      round: serverRound,
      decisions: currentDecisions,
      roundSettings: gameData.roundSettings?.[serverRound],
      messages: gameData.messages?.filter(m => m.to === 'all' || m.to === studentGameState.teamName || m.from === studentGameState.teamName),
      performanceHistory,
      kpis: currentKpis
    });

  }, [studentGameState, games, gamesLoading, user, firestore, fullStudentState?.round, fullStudentState?.decisions]);


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
        operation: 'update', // or 'create'
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
        requestResourceData: { teamName, userId: user.id }, // Just showing what we're trying to add
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
    if (!fullStudentState || !fullStudentState.gameId || !fullStudentState.teamName || fullStudentState.round === undefined) return;
    const updatedDecisions = { ...fullStudentState.decisions, ...newDecisions };
    
    setFullStudentState(prev => prev ? ({ ...prev, decisions: updatedDecisions }) : null);

    if (newDecisions.roundConfirmed) {
      confirmStudentDecisions(fullStudentState.gameId, fullStudentState.teamName, fullStudentState.round, updatedDecisions);
    }
  };

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
    setStrategicPlan,
  }), [fullStudentState, isLoading, isAuthLoading, gamesLoading]);

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
