
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useGames, type RoundSettings, type GameMessage, TeamPerformanceData, InvestmentDecision, TeamDecision } from "./use-games";
import { useRouter } from "next/navigation";
import { StrategicPlan, TeamKPIs } from "@/lib/game-logic/types";

// This would be the current logged-in user ID
const CURRENT_USER_ID = "user-student-01"; 

type StudentGameStatus = "no-game" | "pending" | "joined";

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

export interface StudentGameState {
  userId: string;
  status: StudentGameStatus;
  gameId: string | null;
  gameName: string | null;
  teamName: string | null;
  round?: number;
  decisions: RoundDecisions;
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
  round: 0,
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

const deepMerge = (target: any, source: any) => {
    const output = { ...target };
    if (target && typeof target === 'object' && source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && key in target && target[key] !== null && !Array.isArray(source[key])) {
                output[key] = deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        });
    }
    // Ensure nested structures in initial state are preserved if missing from source
    Object.keys(target).forEach(key => {
        if (!source.hasOwnProperty(key)) {
            output[key] = target[key];
        }
    });

    return output;
};


export function StudentGameProvider({ children }: { children: ReactNode }) {
  const [studentGame, setStudentGame] = useState<StudentGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { games, updateGame } = useGames();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    let storedState;
    try {
      const item = window.localStorage.getItem(getStorageKey());
      storedState = item ? JSON.parse(item) : { ...initialStudentState };
    } catch (error) {
      console.error(error);
      storedState = { ...initialStudentState };
    }
    
    // Deep merge to ensure all properties from the initial state are present, especially nested ones.
    const hydratedState = deepMerge(initialStudentState, storedState);
    
    // Explicitly ensure decision arrays are arrays. This is a critical safeguard.
    if (!hydratedState.decisions) {
        hydratedState.decisions = { ...initialStudentState.decisions };
    }
    hydratedState.decisions.selectedInvestments = Array.isArray(hydratedState.decisions.selectedInvestments) ? hydratedState.decisions.selectedInvestments : [];
    hydratedState.decisions.selectedCenterActions = Array.isArray(hydratedState.decisions.selectedCenterActions) ? hydratedState.decisions.selectedCenterActions : [];
    
    setStudentGame(hydratedState);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (isLoading || !studentGame || !studentGame.gameId || !studentGame.teamName) return;

    const gameData = games.find(g => g.id === studentGame.gameId);
    if (!gameData) return;

    const serverRound = gameData.round;
    const clientRound = studentGame.round;
    const hasRoundChanged = clientRound !== serverRound;

    let newState = { ...studentGame };

    if (hasRoundChanged) {
        // New round, so reset confirmation, but keep existing decisions as a base.
        const currentDecisions = newState.decisions || initialStudentState.decisions;
        newState.decisions = { 
            ...currentDecisions, // Keep tuition price and center actions
            selectedInvestments: [], // Reset only investments
            crisisResponse: null, // Reset crisis
            roundConfirmed: false
        };
    }
    
    const performanceHistory: TeamPerformanceData[] = [];
    let currentKpis: StudentGameState['kpis'] | undefined = undefined;

    if (gameData.performance) {
        Object.keys(gameData.performance).forEach(roundKey => {
            const roundNum = parseInt(roundKey, 10);
            if(roundNum < serverRound) {
                const roundPerformance = gameData.performance?.[roundNum];
                const teamPerformance = roundPerformance?.find(p => p.name === studentGame.teamName);
                if(teamPerformance) {
                    performanceHistory.push(teamPerformance);
                }
            }
        });

        if (serverRound > 0) {
            const lastCompletedRoundPerformance = gameData.performance?.[serverRound - 1];
            currentKpis = lastCompletedRoundPerformance?.find(p => p.name === studentGame.teamName)?.kpis;
        }
    }
    
    if (serverRound === 0 && !currentKpis) { 
        const performanceForRoundZero = gameData.performance?.[0];
        const teamPerformanceRoundZero = performanceForRoundZero?.find(p => p.name === studentGame.teamName);
        if (teamPerformanceRoundZero) {
            currentKpis = teamPerformanceRoundZero.kpis;
        } else {
             const humanTeamsCount = gameData.teamNames.length || 1;
             const numIaTeams = humanTeamsCount;
             currentKpis = {
                 cash: gameData.initialFunds,
                 personnelCost: 240000,
                 income: 320000,
                 privateIncome: 0,
                 publicIncome: 0,
                 nma: 7.5,
                 marketShare: 100 / (humanTeamsCount + numIaTeams),
                 morale: 80,
                 studentTeacherRatio: 25.0,
                 numStudents: 800, 
                 numTeachers: 32,
             }
        }
    }
    
    newState = {
      ...newState,
      round: serverRound,
      roundSettings: gameData.roundSettings?.[serverRound],
      messages: gameData.messages?.filter(m => m.to === 'all' || m.to === studentGame.teamName || m.from === studentGame.teamName),
      performanceHistory: performanceHistory.sort((a,b) => a.round - b.round),
      kpis: currentKpis,
    };
    
    if(JSON.stringify(newState) !== JSON.stringify(studentGame)){
      setStudentGame(newState);
       if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(), JSON.stringify(newState));
       }
    }
  }, [games, studentGame, isLoading]);

  
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
      const existingDecisions = prev.decisions || initialStudentState.decisions!;
      const newDecisions = { 
        ...existingDecisions, 
        ...decisions,
      };
      // Ensure array properties are always arrays
      newDecisions.selectedCenterActions = Array.isArray(newDecisions.selectedCenterActions) ? newDecisions.selectedCenterActions : [];
      newDecisions.selectedInvestments = Array.isArray(newDecisions.selectedInvestments) ? newDecisions.selectedInvestments : [];
      
      const newState = { ...prev, decisions: newDecisions };
      localStorage.setItem(getStorageKey(), JSON.stringify(newState));
      return newState;
    });
  };

   const setStrategicPlan = (plan: Partial<StrategicPlan>) => {
    setStudentGame(prev => {
        if (!prev) return null;
        const newPlan = { ...(prev.strategicPlan || initialStudentState.strategicPlan!), ...plan };
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
    if (studentGame?.status === 'pending' && studentGame.gameId && studentGame.teamName) {
        const game = games.find(g => g.id === studentGame.gameId);
        if(game && game.teamNames.includes(studentGame.teamName)) {
            const newState = { ...studentGame, status: 'joined' as StudentGameStatus, round: game.round };
            setStudentGame(newState);
            localStorage.setItem(getStorageKey(), JSON.stringify(newState));
        }
    }
  }, [studentGame, games]);

  const abandonGame = () => {
    if (!studentGame) return;

    if (studentGame.gameId && studentGame.teamName) {
      const game = games.find(g => g.id === studentGame.gameId);
      if (game) {
        const updatedTeamNames = game.teamNames.filter(name => name !== studentGame.teamName);
        updateGame(game.id, { teamNames: updatedTeamNames });
      }
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
    setStrategicPlan,
  }), [studentGame, isLoading, requestToJoinGame, abandonGame, checkGameStatus, updateStudentGame, getStudentGameByGameId, setRoundDecisions, setStrategicPlan]);

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
