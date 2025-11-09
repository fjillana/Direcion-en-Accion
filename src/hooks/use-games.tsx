

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
import { crises as fullCrisesList } from '@/app/teacher/catalog/crises-data';

export interface CrisisDecision {
  crisisId: string;
  crisisName: string;
  option: string;
  justification: string;
  optionId: string;
  cost: number;
  outcomeDescription?: string;
}

export interface TeamDecision {
  tuitionPrice: number;
  crisisResponse: CrisisDecision | null;
  actions: string[];
  roundConfirmed: boolean;
  investmentCosts?: Record<string, number>;
  poachingTarget?: string;
  poachingSuccess?: boolean;
  forcedByTeacher?: boolean;
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
  updateTeamPerformance: (gameId: string, round: number, performanceData: TeamPerformanceData[], newMessages: GameMessage[], automaticCrises: { teamName: string, crisisIds: string[] }[]) => Promise<void>;
  updateRoundSettings: (gameId: string, round: number, settings: RoundSettings) => Promise<void>;
  addMessage: (gameId: string, message: Omit<GameMessage, 'id' | 'timestamp' | 'readBy'>) => Promise<void>;
  markMessageAsRead: (gameId: string, messageId: string, userId: string) => Promise<void>;
  confirmStudentDecisions: (gameId: string, teamName: string, round: number, decisions: TeamDecision) => Promise<void>;
  forceStudentDecisions: (gameId: string, teamName: string, round: number) => Promise<void>;
  getGameById: (gameId: string) => Game | undefined;
  setActiveGameId: (gameId: string | null) => void;
  activeGameId: string | null;
  acceptJoinRequests: (gameId: string, requests: JoinRequest[]) => Promise<void>;
  removeTeamFromGame: (gameId: string, teamName: string, userId?: string) => Promise<void>;
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
    if (!isAuthLoading && user && firestore) {
      const storedActiveId = localStorage.getItem(ACTIVE_GAME_ID_STORAGE_KEY);
      if (storedActiveId) {
        setActiveGameIdState(JSON.parse(storedActiveId));
      }

      const gamesCollectionRef = collection(firestore, "games");
      let q;

      if (user.role === 'teacher') {
        q = query(gamesCollectionRef, where("createdBy", "==", user.id));
      } else {
        // Students should be able to see all games to join them.
        q = query(gamesCollectionRef);
      }
      

      const unsubscribe = onSnapshot(q, 
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
    } else if (!isAuthLoading && !user) {
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
    addDoc(collection(firestore, "games"), gameWithOwner).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'games',
        operation: 'create',
        requestResourceData: gameWithOwner,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
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
  
 const removeTeamFromGame = async (gameId: string, teamNameToRemove: string, userId?: string) => {
    if (!firestore || !user) return;

    const gameRef = doc(firestore, "games", gameId);
    const batch = writeBatch(firestore);

    // Remove team name from the game's teamNames array
    const gameDoc = await getDoc(gameRef);
    if (gameDoc.exists()) {
        const gameData = gameDoc.data() as Game;
        const teamNamesToKeep = gameData.teamNames.filter(name => name !== teamNameToRemove);
        batch.update(gameRef, { teamNames: teamNamesToKeep });
    }

    // If a userId is provided, reset the student's game state
    if (userId) {
        const studentRef = doc(firestore, "studentGames", userId);
        batch.set(studentRef, {
            status: 'no-game',
            gameId: null,
            gameName: null,
            teamName: null,
            userId: userId,
            planConfirmed: false,
            strategicPlan: {}, // Reset strategic plan
            unlockedAchievements: [],
        }, { merge: true });
    }

    try {
        await batch.commit();
    } catch(error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: gameRef.path,
                operation: 'update',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error removing team with batch:", error);
        }
    }
};


  const updateGame = async (gameId: string, updatedGame: Partial<Game>) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    updateDoc(gameRef, updatedGame, { merge: true }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: gameRef.path,
            operation: 'update',
            requestResourceData: updatedGame,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
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
        
        // Use a batch to perform all writes atomically
        const batch = writeBatch(firestore);

        // 1. Update the game document
        batch.update(gameRef, {
            teamNames: arrayUnion(...newTeamNames),
            pendingJoinRequests: remainingRequests
        });

        // 2. Update all student documents
        for (const req of requests) {
            const studentRef = doc(firestore, "studentGames", req.userId);
            // Use set with merge to ensure the document is created if it doesn't exist
            batch.set(studentRef, { status: "joined" }, { merge: true });
        }

        // 3. Commit the batch
        await batch.commit();

    } catch (error: any) {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: gameRef.path,
                operation: 'update',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            console.error("Error accepting join requests:", error);
        }
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

    updateDoc(gameRef, updateData, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: gameRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const updateTeamPerformance = async (gameId: string, round: number, performanceData: TeamPerformanceData[], newMessages: GameMessage[], automaticCrises: { teamName: string, crisisIds: string[] }[]) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);

    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;
    const gameData = gameDoc.data();
    
    const nextRound = round + 1;
    const existingSettings = gameData.roundSettings || {};
    const existingNextRoundSettings = existingSettings[nextRound] || { investments: [], teamCrises: [] };

    automaticCrises.forEach(autoCrisis => {
        const teamCrisisIndex = existingNextRoundSettings.teamCrises.findIndex((tc:any) => tc.teamName === autoCrisis.teamName);
        if (teamCrisisIndex > -1) {
            const existingIds = existingNextRoundSettings.teamCrises[teamCrisisIndex].crisisIds;
            const newIds = [...new Set([...existingIds, ...autoCrisis.crisisIds])];
            existingNextRoundSettings.teamCrises[teamCrisisIndex].crisisIds = newIds;
        } else {
            existingNextRoundSettings.teamCrises.push(autoCrisis);
        }
    });

    const updateData = {
        [`performance.${round}`]: performanceData,
        messages: arrayUnion(...newMessages),
        [`roundSettings.${nextRound}`]: existingNextRoundSettings
    };
    
    updateDoc(gameRef, updateData, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: gameRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const updateRoundSettings = async (gameId: string, round: number, settings: RoundSettings) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;

    const gameData = gameDoc.data();
    const newSettingsState = { ...(gameData.roundSettings || {}) };
    
    const existingCrises = newSettingsState[round]?.teamCrises || [];
    const manualCrises = settings.teamCrises;
    const mergedCrises = [...existingCrises];

    manualCrises.forEach(manualCrisis => {
      const existingIndex = mergedCrises.findIndex(c => c.teamName === manualCrisis.teamName);
      if (existingIndex > -1) {
        const combinedIds = [...new Set([...mergedCrises[existingIndex].crisisIds, ...manualCrisis.crisisIds])];
        mergedCrises[existingIndex].crisisIds = combinedIds;
      } else {
        mergedCrises.push(manualCrisis);
      }
    });

    newSettingsState[round] = { ...settings, teamCrises: mergedCrises };

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
    const updateData = { roundSettings: newSettingsState, messages: updatedMessages };
    updateDoc(gameRef, updateData, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: gameRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const addMessage = async (gameId: string, message: Omit<GameMessage, 'id' | 'timestamp' | 'readBy'>) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    
    const newMessage: GameMessage = {
      ...message, id: `msg-${Date.now()}`, timestamp: Date.now(), readBy: [],
    };
    
    updateDoc(gameRef, {
        messages: arrayUnion(newMessage)
    }, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: gameRef.path,
        operation: 'update',
        requestResourceData: { messages: [newMessage] },
      });
      errorEmitter.emit('permission-error', permissionError);
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
    updateDoc(gameRef, { messages: newMessages }, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: gameRef.path,
        operation: 'update',
        requestResourceData: { messages: '...' },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const confirmStudentDecisions = async (gameId: string, teamName: string, round: number, decisions: TeamDecision) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);

    // Create a clean copy of the decisions object
    const decisionsToSave: Partial<TeamDecision> = { ...decisions };

    // Remove any undefined properties to prevent Firestore errors
    Object.keys(decisionsToSave).forEach(keyStr => {
        const key = keyStr as keyof TeamDecision;
        if (decisionsToSave[key] === undefined) {
            delete decisionsToSave[key];
        }
    });
     // Also clean inside crisisResponse
    if (decisionsToSave.crisisResponse) {
        const crisisResponse: Partial<CrisisDecision> = { ...decisionsToSave.crisisResponse };
        Object.keys(crisisResponse).forEach(keyStr => {
            const key = keyStr as keyof CrisisDecision;
            if (crisisResponse[key] === undefined) {
                delete crisisResponse[key];
            }
        });
        decisionsToSave.crisisResponse = crisisResponse as CrisisDecision;
    }


    const updateData = {
      [`decisions.${round}.${teamName}`]: decisionsToSave
    };
  
    updateDoc(gameRef, updateData, { merge: true }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: gameRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const forceStudentDecisions = async (gameId: string, teamName: string, round: number) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;
    const gameData = gameDoc.data() as Game;

    const roundDecisions = gameData.decisions?.[round]?.[teamName] || {};
    const roundSettings = gameData.roundSettings?.[round];
    
    let crisisResponse: CrisisDecision | null = null;
    const teamCrisis = roundSettings?.teamCrises.find(tc => tc.teamName === teamName);
    if (teamCrisis && teamCrisis.crisisIds.length > 0) {
      const crisisId = teamCrisis.crisisIds[0];
      const crisisData = fullCrisesList.find(c => c.id === crisisId);
      if (crisisData && crisisData.options.length > 0) {
        const firstOption = crisisData.options[0];
        crisisResponse = {
          crisisId: crisisData.id,
          crisisName: crisisData.name,
          option: firstOption.label,
          optionId: firstOption.id,
          cost: firstOption.cost,
          justification: "Decisión forzada por el profesor por inactividad.",
          outcomeDescription: "" // Initialize as empty string
        }
      }
    }

    const forcedDecisions: TeamDecision = {
      tuitionPrice: roundDecisions.tuitionPrice || 120,
      actions: [],
      investmentCosts: {},
      crisisResponse,
      roundConfirmed: true,
      forcedByTeacher: true,
    };
    
    await confirmStudentDecisions(gameId, teamName, round, forcedDecisions);
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
    } catch (error: any) {
        if(error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: 'studentGames',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
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
        forceStudentDecisions,
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



    
