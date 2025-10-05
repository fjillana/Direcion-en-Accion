

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

  const [fullStudentState, setFullStudentState] = useState<FullStudentState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This single, robust useEffect now handles all state updates for the student.
  useEffect(() => {
    if (!firestore || !user?.id) {
      setIsLoading(isAuthLoading);
      if(!isAuthLoading && !user) {
        setFullStudentState(null);
      }
      return;
    }

    setIsLoading(true);

    const studentGameRef = doc(firestore, "studentGames", user.id);
    
    // Listen to student's personal game state document
    const unsubscribeStudent = onSnapshot(studentGameRef, (studentDoc) => {
      let studentGameState: StudentGameState;
      if (studentDoc.exists()) {
        studentGameState = studentDoc.data() as StudentGameState;
      } else {
        // Create the doc if it doesn't exist for the logged-in user
        studentGameState = { ...initialStudentState, userId: user.id };
        setDoc(studentGameRef, studentGameState).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: `studentGames/${user.id}`, operation: 'create', requestResourceData: studentGameState,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      }

      // If student is not in a game, state is simple.
      if (studentGameState.status !== 'joined' || !studentGameState.gameId) {
        setFullStudentState({ ...studentGameState, decisions: initialRoundDecisions });
        setIsLoading(false);
        // Stop listening to any active game listener if they are no longer in a game
        return; 
      }
      
      // If student IS in a game, start listening to that specific game document
      const gameRef = doc(firestore, "games", studentGameState.gameId);
      const unsubscribeGame = onSnapshot(gameRef, (gameDoc) => {
        if (!gameDoc.exists()) {
          // The game they were in was deleted. Reset their state.
          const resetState: StudentGameState = { ...initialStudentState, userId: user.id };
          setDoc(studentGameRef, resetState);
          return;
        }

        // --- Combine Student and Game Data into a Full State ---
        const gameData = gameDoc.data();
        const teamName = studentGameState.teamName!;

        // Determine current decisions
        const serverRound = gameData.round;
        const currentDecisions = gameData.decisions?.[serverRound]?.[teamName] || 
                               (fullStudentState?.round !== serverRound ? 
                               { ...initialRoundDecisions, tuitionPrice: fullStudentState?.decisions.tuitionPrice || 120 } 
                               : fullStudentState?.decisions || initialRoundDecisions);
        
        // Compile performance history and current KPIs
        const performanceHistory: TeamPerformanceData[] = [];
        let currentKpis: TeamKPIs | undefined = undefined;

        if (gameData.performance) {
            Object.keys(gameData.performance).sort((a, b) => parseInt(a) - parseInt(b)).forEach(roundKey => {
                const roundNum = parseInt(roundKey, 10);
                const teamPerformance = gameData.performance![roundNum].find((p: TeamPerformanceData) => p.name === teamName);
                if (teamPerformance) {
                    performanceHistory.push(teamPerformance);
                    if (roundNum === serverRound - 1) { // KPIs are from the last completed round
                        currentKpis = teamPerformance.kpis;
                    }
                }
            });
        }
        
        // Special case for round 0 display
        if (serverRound === 0 && !currentKpis && gameData.performance?.[0]) {
          currentKpis = gameData.performance[0].find((p: TeamPerformanceData) => p.name === teamName)?.kpis;
        }

        // Build the final, full state object
        setFullStudentState({
          ...studentGameState,
          round: serverRound,
          decisions: currentDecisions,
          roundSettings: gameData.roundSettings?.[serverRound],
          messages: gameData.messages?.filter((m: GameMessage) => m.to === 'all' || m.to === teamName || m.from === teamName),
          performanceHistory,
          kpis: currentKpis
        });
        setIsLoading(false);

      }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: gameRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsLoading(false);
      });

      // Return cleanup for the game listener
      return () => unsubscribeGame();

    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: studentGameRef.path,
        operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      setIsLoading(false);
    });

    // Return cleanup for the student doc listener
    return () => unsubscribeStudent();
  }, [firestore, user, isAuthLoading]);


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
    await updateDoc(gameRef, joinRequestData);
    
    router.push('/student/dashboard');
  };
  

  const abandonGame = async () => {
    if (!firestore || !user || !fullStudentState?.gameId || !fullStudentState?.teamName) return;
    
    const game = games.find(g => g.id === fullStudentState.gameId);
    if (game) {
      const updatedTeamNames = game.teamNames.filter(name => name !== fullStudentState.teamName);
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
    if (!firestore || !user || !fullStudentState) return;
    const studentGameRef = doc(firestore, "studentGames", user.id);
    const newPlan = { ...(fullStudentState.strategicPlan || {}), ...plan };
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
    setStrategicPlan,
  }), [fullStudentState, isLoading]);

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

