
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useGames, type RoundSettings, type GameMessage, TeamPerformanceData } from "./use-games";
import { useRouter } from "next/navigation";

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

export type StrategicPlan = {
  confirmed: boolean;
  rankingGoal: string;
  targets: {
    [key: string]: {
      target: number;
      operator: 'min' | 'max' | 'range';
      range_max?: number;
    }
  }
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
  kpis?: TeamPerformanceData['kpis'];
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
        nma: { target: 8.5, operator: "min" },
        marketShare: { target: 18, operator: "min" },
        studentTeacherRatio: { target: 23, operator: "max" },
    }
  }
};

export function StudentGameProvider({ children }: { children: ReactNode }) {
  const [studentGame, setStudentGame] = useState<StudentGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { games, updateGame, getGameById } = useGames();
  const router = useRouter();
  
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
      // Here, we can only find the current user's state.
      // A real implementation would loop through all localStorage keys with the prefix.
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

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(getStorageKey());
      let storedState: StudentGameState = item ? JSON.parse(item) : { ...initialStudentState };

      if (!storedState.decisions || typeof storedState.decisions.roundConfirmed === 'undefined') {
          storedState.decisions = { ...initialStudentState.decisions };
      }
      if(!storedState.strategicPlan){
          storedState.strategicPlan = initialStudentState.strategicPlan;
          storedState.planConfirmed = false;
      }
      
      if (storedState.gameId && storedState.teamName) {
          const gameData = getGameById(storedState.gameId);
          if (gameData) {
              const round = gameData.round;
              
              if(storedState.round !== round){
                  // New round has started, reset confirmation
                   storedState.decisions = { ...initialStudentState.decisions, tuitionPrice: storedState.decisions?.tuitionPrice || 120 };
              }

              const performanceHistory: TeamPerformanceData[] = [];
              let currentKpis: StudentGameState['kpis'] | undefined = undefined;

              if(gameData.performance){
                  for(let r=1; r < round; r++){
                      const roundPerformance = gameData.performance[r];
                      const teamPerformance = roundPerformance?.find(p => p.name === storedState.teamName);
                      if(teamPerformance) {
                          performanceHistory.push(teamPerformance);
                      }
                  }

                  const lastRoundPerformance = performanceHistory[performanceHistory.length - 1];
                  if(lastRoundPerformance){
                     currentKpis = lastRoundPerformance.kpis;
                  }
              }

              if (!currentKpis) {
                 const initialTeamData = gameData.performance?.[0]?.find(p => p.name === storedState.teamName);
                 currentKpis = {
                    cash: gameData.initialFunds,
                    personnelCost: 240000,
                    income: 320000,
                    nma: 7.5,
                    marketShare: 100 / (gameData.teams * 2),
                    morale: 80,
                    studentTeacherRatio: 25.0,
                    numStudents: 800, 
                    numTeachers: 32,
                 }
              }

              storedState = {
                ...storedState,
                round,
                roundSettings: gameData.roundSettings?.[round],
                messages: gameData.messages?.filter(m => m.to === 'all' || m.to === storedState.teamName || m.from === storedState.teamName),
                performanceHistory,
                kpis: currentKpis,
              };
          }
      }
      setStudentGame(storedState);
      if(item !== JSON.stringify(storedState)) {
        localStorage.setItem(getStorageKey(), JSON.stringify(storedState));
      }
    } catch (error) {
      console.error(error);
      setStudentGame(initialStudentState);
    } finally {
      setIsLoading(false);
    }
  }, [games, getGameById]);


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

    setStudentGame(initialStudentState);
    localStorage.removeItem(getStorageKey());
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
  }), [studentGame, isLoading, abandonGame, checkGameStatus, getStudentGameByGameId, setRoundDecisions, updateStudentGame, getDecisionsByRound, setStrategicPlan]);

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
