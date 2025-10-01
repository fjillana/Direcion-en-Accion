
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export interface Game {
  id: string;
  name: string;
  round: number;
  teams: number; // Number of human teams
  teamNames: string[]; // Names of the accepted teams
  status: "En curso" | "Finalizado";
  numRounds: number;
  aiDifficulty: number;
  reports?: Record<string, Record<string, any>>; // round -> teamName -> reportData
}

interface GamesContextType {
  games: Game[];
  addGame: (game: Game) => void;
  removeGame: (gameId: string) => void;
  updateGame: (gameId: string, updatedGame: Partial<Omit<Game, 'reports'>>) => void;
  updateReport: (gameId: string, round: number, teamName: string, reportData: any) => void;
  getGameById: (gameId: string) => Game | undefined;
  setActiveGameId: (gameId: string | null) => void;
  activeGameId: string | null;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

const GAMES_STORAGE_KEY = 'games';
const ACTIVE_GAME_ID_STORAGE_KEY = 'activeGameId';

// Helper function to safely get item from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};


export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>(() => getInitialState<Game[]>(GAMES_STORAGE_KEY, []));
  const [activeGameId, setActiveGameIdState] = useState<string | null>(() => getInitialState<string | null>(ACTIVE_GAME_ID_STORAGE_KEY, null));

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

  const getGameById = useCallback((gameId: string) => {
    return games.find(g => g.id === gameId);
  }, [games]);

  const setActiveGameId = useCallback((gameId: string | null) => {
    updateLocalStorage(ACTIVE_GAME_ID_STORAGE_KEY, gameId);
    setActiveGameIdState(gameId);
  }, []);

  return (
    <GamesContext.Provider value={{ games, addGame, removeGame, updateGame, updateReport, getGameById, activeGameId, setActiveGameId }}>
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
