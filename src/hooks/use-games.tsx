"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, arrayUnion, serverTimestamp, arrayRemove, writeBatch } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { Investment, Crisis } from "@/components/teacher/catalog-editor";
import type { AIArchetype, StrategicPlan, TeamKPIs } from "@/lib/game-logic/types";
import { useAuth } from "./use-auth";
import { getAuth } from "firebase/auth";

export interface InvestmentDecision {
  id: string;
  name: string;
  cost: number;
  effect: string;
}

export interface CrisisDecision {
  crisisId: string;
  crisisName: string;
  option: string;
  justification: string;
  optionId: string;
}

export interface TeamDecision {
  investments: InvestmentDecision[];
  tuitionPrice: number;
  crisisResponse: CrisisDecision | null;
  selectedCenterActions: string[];
  roundConfirmed: boolean;
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

export interface JoinRequest {
    userId: string;
    teamName: string;
    requestedAt: number;
}

export interface Game {
  id: string;
  name: string;
  round: number;
  teams: number;
  teamNames: string[];
  pendingJoinRequests?: JoinRequest[];
  status: "En curso" | "Finalizado";
  numRounds: number;
  initialFunds: number;
  newStudentsPerRound: number;
  aiDifficulty: number;
  reports?: Record<string, Record<string, any>>;
  performance?: Record<string, TeamPerformanceData[]>;
  roundSettings?: Record<number, RoundSettings>;
  messages?: GameMessage[];
  decisions?: Record<number, Record<string, TeamDecision>>;
  createdBy: string;
}

interface GamesContextType {
  games: Game[];
  loading: boolean;
  addGame: (game: Omit<Game, 'id' | 'createdBy'>) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
  updateGame: (gameId: string, updatedGame: Partial<Omit<Game, 'id'>>) => Promise<void>;
  updateReport: (gameId: string, round: number, teamName: string, reportData: any) => Promise<void>;
  updateTeamPerformance: (gameId: string, round: number, performanceData: TeamPerformanceData[], newMessages: GameMessage[]) => Promise<void>;
  updateRoundSettings: (gameId: string, round: number, settings: RoundSettings) => Promise<void>;
  addMessage: (gameId: string, message: Omit<GameMessage, 'id' | 'timestamp' | 'readBy'>) => Promise<void>;
  markMessageAsRead: (gameId: string, messageId: string, userId: string) => Promise<void>;
  confirmStudentDecisions: (gameId: string, teamName: string, round: number, decisions: TeamDecision) => Promise<void>;
  getGameById: (gameId: string) => Game | undefined;
  setActiveGameId: (gameId: string | null) => void;
  activeGameId: string | null;
  refreshGames: () => Promise<void>;
  acceptJoinRequests: (gameId: string, requests: JoinRequest[]) => Promise<void>;
  removeTeamFromGame: (gameId: string, teamName: string) => Promise<void>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

const ACTIVE_GAME_ID_STORAGE_KEY = 'activeGameId';

export function GamesProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGameId, setActiveGameIdState] = useState<string | null>(null);
  
  const refreshGames = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    try {
        const querySnapshot = await getDocs(collection(firestore, "games"));
        const gamesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
        setGames(gamesData);
    } catch (error) {
        console.error("Error fetching games: ", error);
    } finally {
        setLoading(false);
    }
  }, [firestore]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedActiveId = localStorage.getItem(ACTIVE_GAME_ID_STORAGE_KEY);
        if (storedActiveId) {
            setActiveGameIdState(JSON.parse(storedActiveId));
        }
    }
    refreshGames();
  }, [refreshGames]);

  const addGame = async (game: Omit<Game, 'id' | 'createdBy'>) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!firestore || !currentUser) {
        throw new Error("Usuario no autenticado o Firestore no está disponible.");
    }
    const gameWithOwner = { ...game, createdBy: currentUser.uid };
    await addDoc(collection(firestore, "games"), gameWithOwner);
    await refreshGames();
  };

  const removeGame = async (gameId: string) => {
    if (!firestore) return;
    const gameDocRef = doc(firestore, "games", gameId);
    try {
      await deleteDoc(gameDocRef);
      await refreshGames();
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
          path: gameDocRef.path,
          operation: 'delete',
        });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    }
  };
  
  const removeTeamFromGame = async (gameId: string, teamNameToRemove: string) => {
    if (!firestore) return;
    
    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;
    
    const gameData = gameDoc.data() as Game;
    
    const teamNameToKeep = gameData.teamNames.filter(name => name !== teamNameToRemove);
    
    // Find the user ID associated with the team name from pendingJoinRequests or other sources.
    // This is a weak link. A better approach is needed if this becomes a regular operation.
    const allRequests = [...(gameData.pendingJoinRequests || [])];
    const studentRequest = allRequests.find(req => req.teamName === teamNameToRemove);
    
    const batch = writeBatch(firestore);

    // Remove team from game's teamNames
    batch.update(gameRef, { teamNames: teamNameToKeep });

    // Try to find the student's ID to reset their game state.
    if (studentRequest) {
      const studentRef = doc(firestore, "studentGames", studentRequest.userId);
      batch.update(studentRef, { 
        status: 'no-game', 
        gameId: null, 
        gameName: null, 
        teamName: null 
      });
    }

    await batch.commit();
    await refreshGames();
  };


  const updateGame = async (gameId: string, updatedGame: Partial<Game>) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    await updateDoc(gameRef, updatedGame);
    await refreshGames();
  };
  
  const acceptJoinRequests = async (gameId: string, requests: JoinRequest[]) => {
    if (!firestore) throw new Error("Firestore is not initialized.");
    
    const gameRef = doc(firestore, "games", gameId);
    const batch = writeBatch(firestore);

    // Get current game data
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) throw new Error("Game not found.");
    const gameData = gameDoc.data() as Game;

    // Add new team names
    const newTeamNames = requests.map(req => req.teamName);
    const updatedTeamNames = Array.from(new Set([...(gameData.teamNames || []), ...newTeamNames]));

    // Remove accepted requests from pending list
    const acceptedUserIds = new Set(requests.map(r => r.userId));
    const updatedPendingRequests = (gameData.pendingJoinRequests || []).filter(
      req => !acceptedUserIds.has(req.userId)
    );

    // Update game document
    batch.update(gameRef, { 
        teamNames: updatedTeamNames,
        pendingJoinRequests: updatedPendingRequests
    });

    // Update each student's game document
    for (const req of requests) {
        const studentRef = doc(firestore, "studentGames", req.userId);
        batch.update(studentRef, { status: 'joined' });
    }
    
    try {
      await batch.commit();
      await refreshGames();
    } catch(e) {
        console.error("Error accepting join requests:", e);
        throw e; // Re-throw to be caught by the UI
    }
  };

  const updateReport = async (gameId: string, round: number, teamName: string, reportData: any) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;

    const gameData = gameDoc.data();
    const newReports = { ...(gameData.reports || {}) };
    if (!newReports[round]) newReports[round] = {};
    newReports[round][teamName] = reportData;

    let newMessages = [...(gameData.messages || [])];
    if (reportData.published) {
        newMessages.push({
            id: `msg-report-${Date.now()}-${teamName}`,
            from: 'system', to: teamName, title: 'Reporte Disponible',
            content: `El reporte de la ronda ${round} ya está disponible.`,
            type: 'report', timestamp: Date.now(), readBy: [],
        });
    }

    await updateDoc(gameRef, { reports: newReports, messages: newMessages });
    await refreshGames();
  };

  const updateTeamPerformance = async (gameId: string, round: number, performanceData: TeamPerformanceData[], newMessages: GameMessage[]) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;

    const newPerformance = { ...(gameDoc.data().performance || {}) };
    newPerformance[round] = performanceData;
    const updatedMessages = [...(gameDoc.data().messages || []), ...newMessages];

    await updateDoc(gameRef, { performance: newPerformance, messages: updatedMessages });
    await refreshGames();
  };

  const updateRoundSettings = async (gameId: string, round: number, settings: RoundSettings) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;

    const gameData = gameDoc.data();
    const newSettingsState = { ...(gameData.roundSettings || {}) };
    newSettingsState[round] = settings;

    let newMessages: GameMessage[] = [];
    settings.teamCrises.forEach(newTeamCrisis => {
      if (newTeamCrisis.crisisIds.length > 0) {
         newMessages.push({
           id: `msg-crisis-${Date.now()}-${newTeamCrisis.teamName}`,
           from: 'system', to: newTeamCrisis.teamName, title: 'ATENCIÓN: ¡CRISIS!',
           content: 'Se ha presentado un evento de crisis inesperado. Revisa tu dashboard para tomar una decisión crucial.',
           type: 'crisis', timestamp: Date.now(), readBy: [],
         });
      }
    });

    const updatedMessages = [...(gameData.messages || []), ...newMessages];
    await updateDoc(gameRef, { roundSettings: newSettingsState, messages: updatedMessages });
    await refreshGames();
  };

  const addMessage = async (gameId: string, message: Omit<GameMessage, 'id' | 'timestamp' | 'readBy'>) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    
    const newMessage: GameMessage = {
      ...message, id: `msg-${Date.now()}`, timestamp: Date.now(), readBy: [],
    };
    
    await updateDoc(gameRef, {
        messages: arrayUnion(newMessage)
    });
    await refreshGames();
  };

  const markMessageAsRead = async (gameId: string, messageId: string, userId: string) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;

    const newMessages = (gameDoc.data().messages || []).map((msg: GameMessage) => {
      if (msg.id === messageId && !msg.readBy.includes(userId)) {
        return { ...msg, readBy: [...msg.readBy, userId] };
      }
      return msg;
    });
    await updateDoc(gameRef, { messages: newMessages });
    await refreshGames();
  };
  
  const confirmStudentDecisions = async (gameId: string, teamName: string, round: number, decisions: TeamDecision) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);

    await updateDoc(gameRef, {
        [`decisions.${round}.${teamName}`]: { ...decisions, roundConfirmed: true }
    });
    await refreshGames();
  };

  const getGameById = (gameId: string) => games.find(g => g.id === gameId);

  const setActiveGameId = (gameId: string | null) => {
      if (typeof window !== 'undefined') {
          if (gameId) {
            localStorage.setItem(ACTIVE_GAME_ID_STORAGE_KEY, JSON.stringify(gameId));
          } else {
            localStorage.removeItem(ACTIVE_GAME_ID_STORAGE_KEY);
          }
      }
      setActiveGameIdState(gameId);
  };

  return (
    <GamesContext.Provider value={{ 
        games, 
        loading,
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
        markMessageAsRead,
        confirmStudentDecisions,
        refreshGames,
        acceptJoinRequests,
        removeTeamFromGame,
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
