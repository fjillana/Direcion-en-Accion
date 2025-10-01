
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

export interface Game {
  id: string;
  name: string;
  round: number;
  teams: number;
  status: "En curso" | "Finalizado";
  numRounds: number;
}

interface GamesContextType {
  games: Game[];
  addGame: (game: Game) => void;
  removeGame: (gameId: string) => void;
  getGameById: (gameId: string) => Game | undefined;
  setActiveGameId: (gameId: string | null) => void;
  activeGameId: string | null;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

const initialGames: Game[] = [
  {
    id: "1",
    name: "Simulación de Negocios 101",
    round: 3,
    teams: 5,
    status: "En curso",
    numRounds: 8,
  },
  {
    id: "2",
    name: "Marketing Avanzado",
    round: 5,
    teams: 4,
    status: "En curso",
    numRounds: 10,
  },
  {
    id: "3",
    name: "Gestión Financiera",
    round: 8,
    teams: 6,
    status: "Finalizado",
    numRounds: 8,
  },
];

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
    // This effect runs when 'games' state changes, and persists it to localStorage.
    // It is guarded to only run on the client side after the initial state has been set.
    if (games.length > 0) {
        try {
            window.localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
        } catch (error) {
            console.error("Failed to save games to localStorage:", error);
        }
    }
  }, [games]);

  const addGame = useCallback((game: Game) => {
    setGames((prevGames) => [...prevGames, game]);
  }, []);

  const removeGame = useCallback((gameId: string) => {
    setGames((prevGames) => prevGames.filter(game => game.id !== gameId));
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
    <GamesContext.Provider value={{ games, addGame, removeGame, getGameById, activeGameId, setActiveGameId }}>
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
