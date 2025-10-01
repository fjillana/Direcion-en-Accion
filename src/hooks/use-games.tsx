
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

export function GamesProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>(() => {
    if (typeof window === 'undefined') {
      return initialGames;
    }
    try {
      const item = window.localStorage.getItem('games');
      return item ? JSON.parse(item) : initialGames;
    } catch (error) {
      console.error(error);
      return initialGames;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('games', JSON.stringify(games));
    } catch (error) {
      console.error(error);
    }
  }, [games]);

  const addGame = (game: Game) => {
    setGames((prevGames) => [...prevGames, game]);
  };

  return (
    <GamesContext.Provider value={{ games, addGame }}>
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

    