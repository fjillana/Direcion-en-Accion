

"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useGames, type RoundSettings, type GameMessage, TeamPerformanceData, type Game } from "./use-games";
import { StrategicPlan, TeamKPIs } from "@/lib/game-logic/types";
import { useAuth } from "./use-auth";
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
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
  const { games, confirmStudentDecisions, updateGame } = useGames();
  const { user, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();

  const [studentGameState, setStudentGameState] = useState<StudentGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugStatus, setDebugStatus] = useState("Initializing Hook...");

  useEffect(() => {
    if (isAuthLoading) {
      setDebugStatus("Waiting for authentication...");
      setIsLoading(true);
      return;
    }
  
    if (!user) {
      setDebugStatus("Auth ready. No user.");
      setIsLoading(false);
      setStudentGameState(null);
      return;
    }
  
    if (!firestore) {
      setDebugStatus("Auth ready. Waiting for Firestore...");
      setIsLoading(true);
      return;
    }
  
    setIsLoading(true);
    setDebugStatus(`User detected (${user.id}). Subscribing to studentGames...`);
    const studentGameRef = doc(firestore, "studentGames", user.id);
  
    const studentUnsubscribe = onSnapshot(studentGameRef, (studentDoc) => {
      if (studentDoc.exists()) {
        setStudentGameState(studentDoc.data() as StudentGameState);
        setDebugStatus("Student state loaded.");
      } else {
        const newStudentState = { ...initialStudentState, userId: user.id };
        setDoc(studentGameRef, newStudentState); // Create if not exists
        setStudentGameState(newStudentState);
        setDebugStatus("Student document did not exist. Creating new one.");
      }
      setIsLoading(false);
    }, (error) => {
      setDebugStatus(`ERROR in studentGames subscription: ${error.message}`);
      setIsLoading(false);
    });
  
    return () => { studentUnsubscribe() };
  }, [firestore, user, isAuthLoading]);

  const fullStudentState: FullStudentState | null = useMemo(() => {
    if (!studentGameState || !studentGameState.gameId) {
        return studentGameState ? { ...studentGameState, decisions: initialRoundDecisions } : null;
    }

    const game = games.find(g => g.id === studentGameState.gameId);
    if (!game) {
        return { ...studentGameState, decisions: initialRoundDecisions };
    }

    const { teamName } = studentGameState;
    const serverRound = game.round;
    const decisionsForRound = game.decisions?.[serverRound]?.[teamName!] || initialRoundDecisions;
    const isBlindRound = !!game.roundSettings?.[serverRound]?.isBlind;
    
    const internalPerformanceHistory: TeamPerformanceData[] = [];
    if (game.performance) {
        Object.keys(game.performance).sort((a, b) => parseInt(a) - parseInt(b)).forEach(roundKey => {
            const roundNum = parseInt(roundKey, 10);
            const teamPerformance = game.performance![roundNum].find(p => p.name === teamName);
            if (teamPerformance) {
                internalPerformanceHistory.push(teamPerformance);
            }
        });
    }

    const lastCompletedRoundPerformance = internalPerformanceHistory.length > 0
        ? internalPerformanceHistory.reduce((latest, current) => current.round > latest.round ? current : latest)
        : undefined;

    let kpisForCurrentRound: TeamKPIs | undefined;
    if (lastCompletedRoundPerformance) {
        kpisForCurrentRound = lastCompletedRoundPerformance.kpis;
    } else if (serverRound === 0) {
        const numTotalTeams = (game.teamNames.length || 1) * 2;
        kpisForCurrentRound = {
            cash: game.initialFunds,
            personnelCost: 240000, income: 0, privateIncome: 0, publicIncome: 0,
            nma: 7.5, marketShare: 100 / numTotalTeams, morale: 80,
            studentTeacherRatio: 25.0, numStudents: 800, numTeachers: 32,
            capacity: 810,
        };
    }

    return {
        ...studentGameState,
        round: serverRound,
        decisions: decisionsForRound,
        roundSettings: game.roundSettings,
        messages: game.messages?.filter(m => m.to === 'all' || m.to === teamName || m.from === teamName),
        performanceHistory: isBlindRound ? [] : internalPerformanceHistory,
        kpis: isBlindRound ? undefined : kpisForCurrentRound,
        isBlindRound,
    };
  }, [studentGameState, games]);

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
  };
  

  const abandonGame = async () => {
    if (!firestore || !user || !fullStudentState) return;
    
    const { gameId, teamName } = fullStudentState;

    const studentGameRef = doc(firestore, "studentGames", user.id);
    await setDoc(studentGameRef, {
        ...initialStudentState,
        userId: user.id,
    }, { merge: true });

    if (gameId && teamName) {
        const gameDoc = await getDoc(doc(firestore, "games", gameId));
        if (gameDoc.exists()) {
            const currentGameData = gameDoc.data() as Game;
            const updatedTeamNames = currentGameData.teamNames.filter(name => name !== teamName);
            await updateGame(gameId, { teamNames: updatedTeamNames });
        }
    }
  };
  
  const setRoundDecisions = (newDecisions: Partial<RoundDecisions>) => {
    if (!fullStudentState) return;
    
    const currentDecisions = fullStudentState.decisions || initialRoundDecisions;

    const updatedDecisions: RoundDecisions = {
        ...currentDecisions,
        ...newDecisions,
        actions: newDecisions.actions !== undefined ? newDecisions.actions : currentDecisions.actions,
        investmentCosts: { ...(currentDecisions.investmentCosts || {}), ...newDecisions.investmentCosts },
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
    if (!firestore || !user || !fullStudentState) return;

    const newPlan = JSON.parse(JSON.stringify(fullStudentState.strategicPlan || initialStudentState.strategicPlan));

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
