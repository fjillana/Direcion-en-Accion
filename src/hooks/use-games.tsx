

"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, arrayUnion, serverTimestamp, writeBatch, onSnapshot, query, where } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { Investment, Crisis } from "@/components/teacher/catalog-editor";
import type { AIArchetype, StrategicPlan, TeamKPIs } from "@/lib/game-logic/types";
import { useAuth } from "./use-auth";
import { getAuth } from "firebase/auth";

export interface CrisisDecision {
  crisisId: string;
  crisisName: string;
  option: string;
  justification: string;
  optionId: string;
  cost: number;
}

export interface TeamDecision {
  tuitionPrice: number;
  crisisResponse: CrisisDecision | null;
  actions: string[];
  roundConfirmed: boolean;
  investmentCosts?: Record<string, number>;
}

export interface TeamPerformanceData {
  name: string;
  type: 'H' | 'IA';
  finances: { peb: number; xp: number; pebBreakdown: string[] };
  reputation: { peb: number; xp: number; pebBreakdown: string[] };
  morale: { peb: number; xp: number; pebBreakdown: string[] };
  xpFinancesBonus: number;
  xpReputationBonus: number;
  xpMoraleBonus: number;
  totalXp: number;
  decisions: TeamDecision;
  kpis: TeamKPIs;
  round: number;
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

export interface StudentGameState {
  userId: string;
  status: 'no-game' | 'pending' | 'joined';
  gameId: string | null;
  gameName: string | null;
  teamName: string | null;
  planConfirmed?: boolean;
  strategicPlan?: StrategicPlan;
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
  strategicPlan?: StrategicPlan;
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
  acceptJoinRequests: (gameId: string, requests: JoinRequest[]) => Promise<void>;
  removeTeamFromGame: (gameId: string, teamName: string) => Promise<void>;
  getStudentGamesByGameId: (gameId: string) => Promise<StudentGameState[]>;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

const ACTIVE_GAME_ID_STORAGE_KEY = 'activeGameId';

export function GamesProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGameId, setActiveGameIdState] = useState<string | null>(null);
  
  useEffect(() => {
    if (user && firestore) {
      const storedActiveId = localStorage.getItem(ACTIVE_GAME_ID_STORAGE_KEY);
      if (storedActiveId) {
        setActiveGameIdState(JSON.parse(storedActiveId));
      }

      const gamesCollectionRef = collection(firestore, "games");
      const unsubscribe = onSnapshot(gamesCollectionRef, 
        (querySnapshot) => {
          const gamesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
          setGames(gamesData);
          setLoading(false);
        },
        (error) => {
          setGames([]);
          setLoading(false);
          const permissionError = new FirestorePermissionError({
            path: 'games',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      );

      return () => unsubscribe();
    } else if (!isAuthLoading) {
      // Clear state if user logs out
      setGames([]);
      setActiveGameIdState(null);
      localStorage.removeItem(ACTIVE_GAME_ID_STORAGE_KEY);
      setLoading(false);
    }
  }, [isAuthLoading, user, firestore]);


  const addGame = async (game: Omit<Game, 'id' | 'createdBy'>) => {
    if (!firestore || !user) {
        throw new Error("Usuario no autenticado o Firestore no está disponible.");
    }
    const gameWithOwner = { ...game, createdBy: user.id };
    await addDoc(collection(firestore, "games"), gameWithOwner)
  };

  const removeGame = async (gameId: string) => {
    if (!firestore) return;
    const gameDocRef = doc(firestore, "games", gameId);
    deleteDoc(gameDocRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `games/${gameId}`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
 const removeTeamFromGame = async (gameId: string, teamNameToRemove: string) => {
    if (!firestore || !user) return;

    const gameRef = doc(firestore, "games", gameId);

    try {
        const gameDoc = await getDoc(gameRef);
        if (!gameDoc.exists()) throw new Error("Game not found");
        const gameData = gameDoc.data() as Game;

        const teamNamesToKeep = gameData.teamNames.filter(name => name !== teamNameToRemove);
        const gameUpdateData = { teamNames: teamNamesToKeep };
        
        await updateDoc(gameRef, gameUpdateData);

        const studentRequest = (gameData.pendingJoinRequests || []).find(req => req.teamName === teamNameToRemove);
        if (studentRequest) {
            const studentRef = doc(firestore, "studentGames", studentRequest.userId);
            await updateDoc(studentRef, { status: 'no-game', gameId: null, gameName: null, teamName: null });
        }
    } catch (error: any) {
        console.error("Error removing team:", error);
        throw error;
    }
};


  const updateGame = async (gameId: string, updatedGame: Partial<Game>) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    await updateDoc(gameRef, updatedGame);
  };
  
  const acceptJoinRequests = async (gameId: string, requests: JoinRequest[]) => {
    if (!firestore || requests.length === 0) return;

    const gameRef = doc(firestore, "games", gameId);
    
    try {
        const gameDoc = await getDoc(gameRef);
        if (!gameDoc.exists()) throw new Error("Game not found");
        
        const currentRequests = gameDoc.data().pendingJoinRequests || [];
        const newTeamNames = requests.map(r => r.teamName);
        const remainingRequests = currentRequests.filter((pr: JoinRequest) => !requests.some(r => r.userId === pr.userId));

        // Update game doc with new team names and remove pending requests
        await updateDoc(gameRef, {
            teamNames: arrayUnion(...newTeamNames),
            pendingJoinRequests: remainingRequests
        });

        // Then, update all student documents in a batch
        const batch = writeBatch(firestore);
        for (const req of requests) {
            const studentRef = doc(firestore, "studentGames", req.userId);
             batch.update(studentRef, { status: "joined" });
        }
        await batch.commit();

    } catch (error) {
        console.error("Error accepting join requests:", error);
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
        const existingMsgIndex = newMessages.findIndex(msg => msg.type === 'report' && msg.to === teamName && msg.content.includes(`ronda ${round}`));
        if (existingMsgIndex === -1) {
            newMessages.push({
                id: `msg-report-${Date.now()}-${teamName}`,
                from: 'system', to: teamName, title: 'Reporte Disponible',
                content: `El reporte de la ronda ${round} ya está disponible.`,
                type: 'report', timestamp: Date.now(), readBy: [],
            });
        }
    }

    const updateData = { reports: newReports, messages: newMessages };

    await updateDoc(gameRef, updateData);
  };

  const updateTeamPerformance = async (gameId: string, round: number, performanceData: TeamPerformanceData[], newMessages: GameMessage[]) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);

    const updateData = {
        [`performance.${round}`]: performanceData,
        messages: arrayUnion(...newMessages)
    };
    
    const findUndefined = (obj: any, path = ''): string[] => {
      const undefinedPaths: string[] = [];
      if (obj === undefined) {
        undefinedPaths.push(path || 'root');
        return undefinedPaths;
      }
      if (obj === null || typeof obj !== 'object') {
        return undefinedPaths;
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          undefinedPaths.push(...findUndefined(item, `${path}[${index}]`));
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          undefinedPaths.push(...findUndefined(value, currentPath));
        });
      }
      return undefinedPaths;
    };

    const undefinedPaths = findUndefined(updateData);
    if (undefinedPaths.length > 0) {
      const errorMessage = `Cannot save undefined values at paths: ${undefinedPaths.join(', ')}`;
      console.error('FOUND UNDEFINED VALUES AT:', undefinedPaths);
      throw new Error(errorMessage);
    }
    
    await updateDoc(gameRef, updateData);
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
  };
  
  const confirmStudentDecisions = async (gameId: string, teamName: string, round: number, decisions: TeamDecision) => {
    if (!firestore) return;
    console.log(`[GPS] 2a. Confirming decisions in useGames hook for ${teamName}. Data:`, decisions);
    const gameRef = doc(firestore, "games", gameId);
    const updateData = { [`decisions.${round}.${teamName}`]: { ...decisions, roundConfirmed: true } };

    await updateDoc(gameRef, updateData);
  };

  const getGameById = (gameId: string) => games.find(g => g.id === gameId);

  const getStudentGamesByGameId = useCallback(async (gameId: string): Promise<StudentGameState[]> => {
    if (!firestore) return [];
    
    const studentGamesRef = collection(firestore, "studentGames");
    const q = query(studentGamesRef, where("gameId", "==", gameId));

    try {
        const querySnapshot = await getDocs(q);
        const studentGames = querySnapshot.docs.map(doc => doc.data() as StudentGameState);
        return studentGames;
    } catch (error) {
        console.error("Error fetching student games by gameId:", error);
        return [];
    }
  }, [firestore]);

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
        acceptJoinRequests,
        removeTeamFromGame,
        getStudentGamesByGameId,
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
