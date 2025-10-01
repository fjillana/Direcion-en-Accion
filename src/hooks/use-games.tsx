
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

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

const initialGames: Game[] = [];

const GAMES_STORAGE_KEY = 'games';
const ACTIVE_GAME_ID_STORAGE_KEY = 'activeGameId';


export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGameId, setActiveGameIdState] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(GAMES_STORAGE_KEY);
      setGames(item ? JSON.parse(item) : initialGames);
      const activeId = window.localStorage.getItem(ACTIVE_GAME_ID_STORAGE_KEY);
      setActiveGameIdState(activeId ? JSON.parse(activeId) : null);
    } catch (error) {
      console.error(error);
      setGames(initialGames);
    }
  }, []);

  useEffect(() => {
    try {
        window.localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
        console.error("Failed to save games to localStorage:", error);
    }
  }, [games]);

  const addGame = useCallback((game: Game) => {
    setGames((prevGames) => [...prevGames, game]);
  }, []);

  const removeGame = useCallback((gameId: string) => {
    setGames((prevGames) => prevGames.filter(game => game.id !== gameId));
  }, []);

  const updateGame = useCallback((gameId: string, updatedGame: Partial<Game>) => {
    setGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId ? { ...game, ...updatedGame } : game
      )
    );
  }, []);

  const updateReport = useCallback((gameId: string, round: number, teamName: string, reportData: any) => {
    setGames(prevGames => 
      prevGames.map(game => {
        if (game.id === gameId) {
          const newReports = { ...game.reports };
          if (!newReports[round]) {
            newReports[round] = {};
          }
          newReports[round][teamName] = reportData;
          return { ...game, reports: newReports };
        }
        return game;
      })
    );
  }, []);

  const getGameById = useCallback((gameId: string) => {
    return games.find(g => g.id === gameId);
  }, [games]);

  const setActiveGameId = useCallback((gameId: string | null) => {
    try {
      if (gameId) {
        window.localStorage.setItem(ACTIVE_GAME_ID_STORAGE_KEY, JSON.stringify(gameId));
      } else {
        window.localStorage.removeItem(ACTIVE_GAME_ID_STORAGE_KEY);
      }
      setActiveGameIdState(gameId);
    } catch (error) {
       console.error("Failed to set active game in localStorage:", error);
    }
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
