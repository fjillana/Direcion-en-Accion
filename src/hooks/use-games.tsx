
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import type { Investment, Crisis } from "@/components/teacher/catalog-editor";
import type { AIArchetype, StrategicPlan } from "@/lib/game-logic/types";
import { TeamKPIs } from "@/lib/game-logic/types";

export interface InvestmentDecision {
  id: string;
  name: string;
  cost: number;
  effect: string;
}

export interface CrisisDecision {
  crisisName: string;
  option: string;
  justification: string;
}

export interface TeamDecision {
  investments: InvestmentDecision[];
  tuitionPrice: number;
  crisisResponse: CrisisDecision | null;
  selectedCenterActions: string[];
}

export interface TeamPerformanceData {
  name: string;
  type: 'H' | 'IA';
  finances: { peb: number; xp: number; pebBreakdown: string[] };
  reputation: { peb: number; xp: number; pebBreakdown: string[] };
  morale: { peb: number; xp: number; pebBreakdown: string[] };
  totalXp: number;
  decisions: TeamDecision;
  kpis: TeamKPIs;
  archetype?: AIArchetype;
}

export type RoundSettings = {
  investments: Investment[];
  teamCrises: { teamName: string; crisisIds: string[] }[];
};

export type GameMessage = {
  id: string;
  from: 'teacher' | 'system' | string; // teamName for student messages
  to: 'all' | string; // teamName or 'teacher'
  content: string;
  timestamp: number;
  readBy: string[];
  type?: 'crisis' | 'report' | 'message';
  title?: string;
};


export interface Game {
  id: string;
  name: string;
  round: number;
  teams: number; // Number of human teams
  teamNames: string[]; // Names of the accepted teams
  status: "En curso" | "Finalizado";
  numRounds: number;
  initialFunds: number;
  newStudentsPerRound: number;
  aiDifficulty: number;
  reports?: Record<string, Record<string, any>>; // round -> teamName -> reportData
  performance?: Record<string, TeamPerformanceData[]>; // round -> teamPerformances
  roundSettings?: Record<number, RoundSettings>;
  messages?: GameMessage[];
}

interface GamesContextType {
  games: Game[];
  addGame: (game: Game) => void;
  removeGame: (gameId: string) => void;
  updateGame: (gameId: string, updatedGame: Partial<Omit<Game, 'reports' | 'performance' | 'roundSettings' | 'messages'>>) => void;
  updateReport: (gameId: string, round: number, teamName: string, reportData: any) => void;
  updateTeamPerformance: (gameId: string, round: number, performanceData: TeamPerformanceData[]) => void;
  updateRoundSettings: (gameId: string, round: number, settings: RoundSettings) => void;
  addMessage: (gameId: string, message: Omit<GameMessage, 'id' | 'timestamp'>) => void;
  markMessageAsRead: (gameId: string, messageId: string, userId: string) => void;
  getGameById: (gameId: string) => Game | undefined;
  setActiveGameId: (gameId: string | null) => void;
  activeGameId: string | null;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

const GAMES_STORAGE_KEY = 'games';
const ACTIVE_GAME_ID_STORAGE_KEY = 'activeGameId';

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGameId, setActiveGameIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedGames = localStorage.getItem(GAMES_STORAGE_KEY);
      if (storedGames) {
        setGames(JSON.parse(storedGames));
      }
      const storedActiveId = localStorage.getItem(ACTIVE_GAME_ID_STORAGE_KEY);
      if (storedActiveId) {
        setActiveGameIdState(JSON.parse(storedActiveId));
      }
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
    }
  }, []);


  const updateLocalStorage = <T,>(key: string, value: T) => {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing to localStorage key “${key}”:`, error);
        }
    }
  }

  const addGame = useCallback((game: Game) => {
    setGames((prevGames) => {
        const newGames = [...prevGames, game];
        updateLocalStorage(GAMES_STORAGE_KEY, newGames);
        return newGames;
    });
  }, []);

  const removeGame = useCallback((gameId: string) => {
    setGames((prevGames) => {
        const newGames = prevGames.filter(game => game.id !== gameId);
        updateLocalStorage(GAMES_STORAGE_KEY, newGames);
        return newGames;
    });
  }, []);

  const updateGame = useCallback((gameId: string, updatedGame: Partial<Game>) => {
    setGames(prevGames => {
      const newGames = prevGames.map(game => 
        game.id === gameId ? { ...game, ...updatedGame } : game
      );
      updateLocalStorage(GAMES_STORAGE_KEY, newGames);
      return newGames;
    });
  }, []);

  const updateReport = useCallback((gameId: string, round: number, teamName: string, reportData: any) => {
    setGames(prevGames => {
      const newGames = prevGames.map(game => {
        if (game.id === gameId) {
          const newReports = { ...game.reports };
          if (!newReports[round]) {
            newReports[round] = {};
          }
          newReports[round][teamName] = reportData;
          return { ...game, reports: newReports };
        }
        return game;
      });
      updateLocalStorage(GAMES_STORAGE_KEY, newGames);
      return newGames;
    });
  }, []);
  
  const updateTeamPerformance = useCallback((gameId: string, round: number, performanceData: TeamPerformanceData[]) => {
    setGames(prevGames => {
        const newGames = prevGames.map(game => {
            if (game.id === gameId) {
                const newPerformance = { ...(game.performance || {}) };
                newPerformance[round] = performanceData;
                return { ...game, performance: newPerformance };
            }
            return game;
        });
        updateLocalStorage(GAMES_STORAGE_KEY, newGames);
        return newGames;
    });
  }, []);

  const updateRoundSettings = useCallback((gameId: string, round: number, settings: RoundSettings) => {
    setGames(prevGames => {
      const newGames = prevGames.map(game => {
        if (game.id === gameId) {
          const newSettings = { ...(game.roundSettings || {}) };
          newSettings[round] = settings;
          return { ...game, roundSettings: newSettings };
        }
        return game;
      });
      updateLocalStorage(GAMES_STORAGE_KEY, newGames);
      return newGames;
    });
  }, []);

  const addMessage = useCallback((gameId: string, message: Omit<GameMessage, 'id' | 'timestamp'>) => {
    setGames(prevGames => {
      const newGames = prevGames.map(game => {
        if (game.id === gameId) {
          const newMessage: GameMessage = {
            ...message,
            id: `msg-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            readBy: [],
          };
          const newMessages = [...(game.messages || []), newMessage];
          return { ...game, messages: newMessages };
        }
        return game;
      });
      updateLocalStorage(GAMES_STORAGE_KEY, newGames);
      return newGames;
    });
  }, []);

  const markMessageAsRead = useCallback((gameId: string, messageId: string, userId: string) => {
     setGames(prevGames => {
      const newGames = prevGames.map(game => {
        if (game.id === gameId) {
          const newMessages = (game.messages || []).map(msg => {
            if (msg.id === messageId && !msg.readBy.includes(userId)) {
              return { ...msg, readBy: [...msg.readBy, userId] };
            }
            return msg;
          });
          return { ...game, messages: newMessages };
        }
        return game;
      });
      updateLocalStorage(GAMES_STORAGE_KEY, newGames);
      return newGames;
    });
  }, []);


  const getGameById = useCallback((gameId: string) => {
    return games.find(g => g.id === gameId);
  }, [games]);

  const setActiveGameId = useCallback((gameId: string | null) => {
    updateLocalStorage(ACTIVE_GAME_ID_STORAGE_KEY, gameId);
    setActiveGameIdState(gameId);
  }, []);

  return (
    <GamesContext.Provider value={{ 
        games, 
        addGame, 
        removeGame, 
        updateGame, 
        updateReport, 
        getGameById, 
        activeGameId, 
        setActiveGameId, 
        updateTeamPerformance,
        updateRoundSettings,
        addMessage,
        markMessageAsRead
    }}>
      {children}
    </GamesContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error("useGames must be used within a GamesProvider");
  }
  return context;
}
