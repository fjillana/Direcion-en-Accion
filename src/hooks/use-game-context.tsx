
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import type { Game } from "./use-games";
import { useGames } from "./use-games";

interface GameContextType {
  activeGame: Game | null;
  setActiveGameId: (gameId: string | null) => void;
  clearActiveGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { games, activeGameId, setActiveGameId: setGlobalActiveGameId } = useGames();
  const [activeGame, setActiveGame] = useState<Game | null>(null);

  useEffect(() => {
    if (activeGameId) {
      const game = games.find(g => g.id === activeGameId);
      setActiveGame(game || null);
    } else {
      setActiveGame(null);
    }
  }, [activeGameId, games]);
  
  const setActiveGameId = (gameId: string | null) => {
    setGlobalActiveGameId(gameId);
  };

  const clearActiveGame = () => {
    setGlobalActiveGameId(null);
  };

  const value = useMemo(() => ({
    activeGame,
    setActiveGameId,
    clearActiveGame
  }), [activeGame, setActiveGameId]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
