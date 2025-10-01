
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useGames, type RoundSettings, type GameMessage, TeamPerformanceData } from "./use-games";
import { useRouter } from "next/navigation";
import { StrategicPlan, TeamKPIs } from "@/lib/game-logic/types";

// This would be the current logged-in user ID
const CURRENT_USER_ID = "student-beta"; 

type StudentGameStatus = "no-game" | "pending" | "joined";

export interface RoundDecisions {
  selectedInvestments: string[];
  selectedCenterActions: string[];
  tuitionPrice: number;
  crisisResponse: {
      crisisId: string;
      optionId: string;
      justification: string;
  } | null;
  roundConfirmed: boolean;
}

export interface StudentGameState {
  userId: string;
  status: StudentGameStatus;
  gameId: string | null;
  gameName: string | null;
  teamName: string | null;
  round?: number;
  decisions?: RoundDecisions;
  roundSettings?: RoundSettings;
  messages?: GameMessage[];
  performanceHistory?: TeamPerformanceData[];
  kpis?: TeamKPIs;
  strategicPlan?: StrategicPlan;
  planConfirmed: boolean;
}

interface StudentGameContextType {
  studentGame: StudentGameState | null;
  isLoading: boolean;
  requestToJoinGame: (gameId: string, gameName: string, teamName: string) => void;
  abandonGame: () => void;
  checkGameStatus: () => void;
  updateStudentGame: (userId: string, updatedState: Partial<StudentGameState>) => void;
  getStudentGameByGameId: (gameId: string) => StudentGameState | null;
  setRoundDecisions: (decisions: Partial<RoundDecisions>) => void;
  getDecisionsByRound: (round: number) => RoundDecisions | null;
  setStrategicPlan: (plan: Partial<StrategicPlan>) => void;
}

const StudentGameContext = createContext<StudentGameContextType | undefined>(undefined);

const STUDENT_GAME_STORAGE_KEY_PREFIX = 'studentGameState_';

const getStorageKey = () => `${STUDENT_GAME_STORAGE_KEY_PREFIX}${CURRENT_USER_ID}`;

const initialStudentState: StudentGameState = {
  userId: CURRENT_USER_ID,
  status: "no-game",
  gameId: null,
  gameName: null,
  teamName: null,
  decisions: {
    selectedInvestments: [],
    selectedCenterActions: [],
    tuitionPrice: 120,
    crisisResponse: null,
    roundConfirmed: false,
  },
  planConfirmed: false,
  strategicPlan: {
    confirmed: false,
    rankingGoal: "",
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

export function StudentGameProvider({ children }: { children: ReactNode }) {
  const [studentGame, setStudentGame] = useState<StudentGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { games, updateGame, getGameById } = useGames();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    let storedState: StudentGameState;
    try {
      const item = window.localStorage.getItem(getStorageKey());
      storedState = item ? JSON.parse(item) : { ...initialStudentState };
    } catch (error) {
      console.error(error);
      storedState = { ...initialStudentState };
    }
    
    // Ensure critical nested objects exist
    if (!storedState.decisions || typeof storedState.decisions.roundConfirmed === 'undefined') {
        storedState.decisions = { ...initialStudentState.decisions };
    }
    if(!storedState.strategicPlan || !storedState.strategicPlan.targets?.cash){
        storedState.strategicPlan = initialStudentState.strategicPlan;
        storedState.planConfirmed = false;
    }
    
    setStudentGame(storedState);
    setIsLoading(false);
  }, []);
  
  // This effect syncs the student's game state with the global game state from useGames
  useEffect(() => {
    if (isLoading || !studentGame || !studentGame.gameId || !studentGame.teamName) return;

    const gameData = getGameById(studentGame.gameId);
    if (!gameData) return;

    let updatedState = { ...studentGame };
    
    const round = gameData.round;
    const hasRoundChanged = updatedState.round !== round;
    
    if(hasRoundChanged){
        // New round has started, reset confirmation status
        updatedState.decisions = { ...initialStudentState.decisions, tuitionPrice: updatedState.decisions?.tuitionPrice || 120 };
    }

    const performanceHistory: TeamPerformanceData[] = [];
    let currentKpis: StudentGameState['kpis'] | undefined = undefined;

    if(gameData.performance){
        // History includes all rounds up to the one before the current one
        for(let r=0; r < round; r++){ 
            const roundPerformance = gameData.performance[r];
            const teamPerformance = roundPerformance?.find(p => p.name === studentGame.teamName);
            if(teamPerformance) {
                performanceHistory.push(teamPerformance);
            }
        }

        const lastRoundPerformance = performanceHistory[performanceHistory.length - 1];
        if(lastRoundPerformance){
           currentKpis = lastRoundPerformance.kpis;
        }
    }

    if (!currentKpis) { // This happens in Round 0 or if there's no history
       const humanTeamsCount = gameData.teamNames.length || 1;
       const numIaTeams = humanTeamsCount;
       currentKpis = {
          cash: gameData.initialFunds,
          personnelCost: 240000,
          income: 320000,
          nma: 7.5,
          marketShare: 100 / (humanTeamsCount + numIaTeams),
          morale: 80,
          studentTeacherRatio: 25.0,
          numStudents: 800, 
          numTeachers: 32,
       }
    }
    
    updatedState = {
      ...updatedState,
      round,
      roundSettings: gameData.roundSettings?.[round],
      messages: gameData.messages?.filter(m => m.to === 'all' || m.to === studentGame.teamName || m.from === studentGame.teamName),
      performanceHistory,
      kpis: currentKpis,
    };
    
    // Only update state if there are actual changes to avoid loops
    if(JSON.stringify(updatedState) !== JSON.stringify(studentGame)){
      setStudentGame(updatedState);
      localStorage.setItem(getStorageKey(), JSON.stringify(updatedState));
    }
  }, [games, getGameById, studentGame, isLoading]);

  
  // This function simulates how another user (teacher) would update this student's state
  const updateStudentGame = useCallback((userId: string, updatedState: Partial<StudentGameState>) => {
    const key = `${STUDENT_GAME_STORAGE_KEY_PREFIX}${userId}`;
    const currentData = JSON.parse(localStorage.getItem(key) || '{}');
    const newState = { ...currentData, ...updatedState };
    localStorage.setItem(key, JSON.stringify(newState));

    if (userId === CURRENT_USER_ID) {
      setStudentGame(newState);
    }
  }, []);

  const getStudentGameByGameId = useCallback((gameId: string): StudentGameState | null => {
      if (typeof window === 'undefined') return null;
      // This is a simplification. In a real app, you'd query a backend.
      const allKeys = Object.keys(localStorage);
      const studentKeys = allKeys.filter(k => k.startsWith(STUDENT_GAME_STORAGE_KEY_PREFIX));
      
      for(const key of studentKeys){
          const item = localStorage.getItem(key);
          if(item){
            try {
              const state: StudentGameState = JSON.parse(item);
              if (state.gameId === gameId) {
                  return state;
              }
            } catch (e) {
                console.error("Failed to parse student game state for key", key, e);
            }
          }
      }
      return null;
  }, []);

  const setRoundDecisions = (decisions: Partial<RoundDecisions>) => {
    setStudentGame(prev => {
      if (!prev) return null;
      const newDecisions = { ...(prev.decisions || initialStudentState.decisions), ...decisions };
      const newState = { ...prev, decisions: newDecisions };
      localStorage.setItem(getStorageKey(), JSON.stringify(newState));
      return newState;
    });
  };

  const getDecisionsByRound = useCallback((round: number): RoundDecisions | null => {
    if (typeof window === 'undefined' || !studentGame?.gameId) return null;
    const key = `decisions_${studentGame.gameId}_${studentGame.teamName}_${round}`;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, [studentGame]);

   const setStrategicPlan = (plan: Partial<StrategicPlan>) => {
    setStudentGame(prev => {
        if (!prev) return null;
        const newPlan = { ...(prev.strategicPlan || initialStudentState.strategicPlan), ...plan };
        const newState = { ...prev, strategicPlan: newPlan, planConfirmed: newPlan.confirmed };
        localStorage.setItem(getStorageKey(), JSON.stringify(newState));
        return newState;
    });
   };


  const requestToJoinGame = (gameId: string, gameName: string, teamName: string) => {
    const newState: StudentGameState = {
      ...initialStudentState,
      userId: CURRENT_USER_ID,
      status: 'pending',
      gameId,
      gameName,
      teamName,
    };
    setStudentGame(newState);
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
  };
  
  const checkGameStatus = useCallback(() => {
    if (studentGame?.status === 'pending' && studentGame.gameId) {
        const game = games.find(g => g.id === studentGame.gameId);
        if(game && game.teamNames.includes(studentGame.teamName!)) {
            const newState = { ...studentGame, status: 'joined' as StudentGameStatus, round: game.round };
            setStudentGame(newState);
            localStorage.setItem(getStorageKey(), JSON.stringify(newState));
        }
    }
  }, [studentGame, games]);

  const abandonGame = () => {
    if (!studentGame || !studentGame.gameId || !studentGame.teamName) return;

    const game = games.find(g => g.id === studentGame.gameId);
    if (game) {
      const updatedTeamNames = game.teamNames.filter(name => name !== studentGame.teamName);
      updateGame(game.id, { teamNames: updatedTeamNames });
    }

    const newState = { ...initialStudentState };
    setStudentGame(newState);
    localStorage.setItem(getStorageKey(), JSON.stringify(newState));
    router.push('/student/join-game');
  };

  const value = useMemo(() => ({
    studentGame,
    isLoading,
    requestToJoinGame,
    abandonGame,
    checkGameStatus,
    updateStudentGame,
    getStudentGameByGameId,
    setRoundDecisions,
    getDecisionsByRound,
    setStrategicPlan,
  }), [studentGame, isLoading, abandonGame, checkGameStatus, getStudentGameByGameId, setRoundDecisions, updateStudentGame, getDecisionsByRound, setStrategicPlan, requestToJoinGame]);

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
