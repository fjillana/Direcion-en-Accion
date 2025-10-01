
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useGames } from "./use-games";
import { useRouter } from "next/navigation";

// This would be the current logged-in user ID
const CURRENT_USER_ID = "student-beta"; 

type StudentGameStatus = "no-game" | "pending" | "joined";

export interface StudentGameState {
  userId: string;
  status: StudentGameStatus;
  gameId: string | null;
  gameName: string | null;
  teamName: string | null;
  round?: number;
}

interface StudentGameContextType {
  studentGame: StudentGameState | null;
  isLoading: boolean;
  requestToJoinGame: (gameId: string, gameName: string, teamName: string) => void;
  abandonGame: () => void;
  checkGameStatus: () => void;
  updateStudentGame: (userId: string, updatedState: Partial<StudentGameState>) => void;
  getStudentGameByGameId: (gameId: string) => StudentGameState | null;
}

const StudentGameContext = createContext<StudentGameContextType | undefined>(undefined);

const STUDENT_GAME_STORAGE_KEY = 'studentGameState';

const initialStudentState: StudentGameState = {
  userId: CURRENT_USER_ID,
  status: "no-game",
  gameId: null,
  gameName: null,
  teamName: null,
};

export function StudentGameProvider({ children }: { children: ReactNode }) {
  const [studentGame, setStudentGame] = useState<StudentGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { games, updateGame } = useGames();
  const router = useRouter();
  
  // This function simulates how another user (teacher) would update this student's state
  const updateStudentGame = useCallback((userId: string, updatedState: Partial<StudentGameState>) => {
    if (userId === CURRENT_USER_ID) {
      setStudentGame(prev => {
        const newState = prev ? { ...prev, ...updatedState } : null;
        if(newState) localStorage.setItem(STUDENT_GAME_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
    }
  }, []);

  const getStudentGameByGameId = useCallback((gameId: string): StudentGameState | null => {
      const item = localStorage.getItem(STUDENT_GAME_STORAGE_KEY);
      if (item) {
        const state: StudentGameState = JSON.parse(item);
        if (state.gameId === gameId) {
            return state;
        }
      }
      return null;
  }, []);


  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STUDENT_GAME_STORAGE_KEY);
      setStudentGame(item ? JSON.parse(item) : initialStudentState);
    } catch (error) {
      console.error(error);
      setStudentGame(initialStudentState);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestToJoinGame = (gameId: string, gameName: string, teamName: string) => {
    const newState: StudentGameState = {
      userId: CURRENT_USER_ID,
      status: 'pending',
      gameId,
      gameName,
      teamName,
    };
    setStudentGame(newState);
    localStorage.setItem(STUDENT_GAME_STORAGE_KEY, JSON.stringify(newState));
  };
  
  const checkGameStatus = useCallback(() => {
    if (studentGame?.status === 'pending' && studentGame.gameId) {
        const game = games.find(g => g.id === studentGame.gameId);
        if(game && game.teamNames.includes(studentGame.teamName!)) {
            const newState = { ...studentGame, status: 'joined' as StudentGameStatus, round: game.round };
            setStudentGame(newState);
            localStorage.setItem(STUDENT_GAME_STORAGE_KEY, JSON.stringify(newState));
        }
    }
  }, [studentGame, games]);

  const abandonGame = () => {
    if (!studentGame || !studentGame.gameId || !studentGame.teamName) return;

    // Remove team from the game
    const game = games.find(g => g.id === studentGame.gameId);
    if (game) {
      const updatedTeamNames = game.teamNames.filter(name => name !== studentGame.teamName);
      updateGame(game.id, { teamNames: updatedTeamNames });
    }

    // Reset student state
    setStudentGame(initialStudentState);
    localStorage.setItem(STUDENT_GAME_STORAGE_KEY, JSON.stringify(initialStudentState));
    router.push('/student/join-game');
  };

  return (
    <StudentGameContext.Provider value={{ studentGame, isLoading, requestToJoinGame, abandonGame, checkGameStatus, updateStudentGame, getStudentGameByGameId }}>
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
