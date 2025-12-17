

"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, getDocs, arrayUnion, serverTimestamp, writeBatch, onSnapshot, query, where, Query } from "firebase/firestore";
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
  isBlind?: boolean;
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
}

interface GamesContextType {
  games: Game[];
  loading: boolean;
  addGame: (game: Omit<Game, 'id' | 'createdBy'>) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
  updateGame: (gameId: string, updatedGame: Partial<Omit<Game, 'id'>>) => Promise<void>;
  updateReport: (gameId: string, round: number, teamName: string, reportData: any) => Promise<void>;
  updateTeamPerformance: (gameId: string, round: number, performanceData: TeamPerformanceData[], newMessages: GameMessage[], automaticCrises: { teamName: string, crisisIds: string[] }[]) => Promise<void>;
  updateRoundSettings: (gameId: string, currentRound: number, settings: RoundSettings, isBlindForNextRound: boolean) => Promise<void>;
  updateTeamKpis: (gameId: string, round: number, teamName: string, kpis: Partial<TeamKPIs>) => Promise<void>;
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
    if (!firestore || isAuthLoading) {
      setLoading(true);
      return;
    }

    let q: Query;
    const gamesCollectionRef = collection(firestore, "games");

    if (user?.role === 'teacher' || user?.role === 'superadmin') {
      // Teacher/Superadmin: Fetch all games they created.
      q = query(gamesCollectionRef, where("createdBy", "==", user.id));
    } else {
      // Student: Fetch only "En curso" games for joining purposes.
      q = query(gamesCollectionRef, where("status", "==", "En curso"));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const gamesData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Game)
        );
        setGames(gamesData);
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching games:`, error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'games', operation: 'list' }));
        setGames([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthLoading, user, firestore]);

  useEffect(() => {
    const storedActiveId = localStorage.getItem(ACTIVE_GAME_ID_STORAGE_KEY);
    if (storedActiveId) {
      setActiveGameIdState(JSON.parse(storedActiveId));
    }
  }, []);


  const addGame = async (game: Omit<Game, 'id' | 'createdBy'>) => {
    if (!firestore || !user) {
        throw new Error("Usuario no autenticado o Firestore no está disponible.");
    }
    const gameWithOwner = { ...game, createdBy: user.id };
    await addDoc(collection(firestore, "games"), gameWithOwner);
  };

  const removeGame = async (gameId: string) => {
    if (!firestore) return;
    const gameDocRef = doc(firestore, "games", gameId);
    await deleteDoc(gameDocRef);
  };
  
 const removeTeamFromGame = async (gameId: string, teamNameToRemove: string, userId?: string) => {
    if (!firestore || !user) return;

    const gameRef = doc(firestore, "games", gameId);
    const batch = writeBatch(firestore);

    const gameDoc = await getDoc(gameRef);
    if (gameDoc.exists()) {
        const gameData = gameDoc.data() as Game;
        const teamNamesToKeep = gameData.teamNames.filter(name => name !== teamNameToRemove);
        batch.update(gameRef, { teamNames: teamNamesToKeep });
    }

    if (userId) {
        const studentRef = doc(firestore, "studentGames", userId);
        batch.set(studentRef, {
            status: 'no-game',
            gameId: null,
            gameName: null,
            teamName: null,
            userId: userId,
            planConfirmed: false,
            strategicPlan: {
                confirmed: false, rankingGoal: "",
                targets: {
                  cash: { target: 50000, operator: "min" },
                  personnelCost: { target: 75, operator: "max" },
                  nma: { target: 8.5, operator: "min" },
                  marketShare: { target: 18, operator: "min" },
                  morale: { target: 85, operator: "min" },
                  studentTeacherRatio: { target: 23, operator: "max" },
                }
            },
            unlockedAchievements: [],
        }, { merge: true });
    }
    await batch.commit();
};


  const updateGame = async (gameId: string, updatedGame: Partial<Game>) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    await updateDoc(gameRef, updatedGame);
  };
  
  const acceptJoinRequests = async (gameId: string, requests: JoinRequest[]) => {
    if (!firestore || requests.length === 0) return;

    const gameRef = doc(firestore, "games", gameId);
    
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) throw new Error("Game not found");
    
    const currentRequests = gameDoc.data().pendingJoinRequests || [];
    const newTeamNames = requests.map(r => r.teamName);
    const remainingRequests = currentRequests.filter((pr: JoinRequest) => !requests.some(r => r.userId === pr.userId));
    
    const batch = writeBatch(firestore);

    batch.update(gameRef, {
        teamNames: arrayUnion(...newTeamNames),
        pendingJoinRequests: remainingRequests
    });

    for (const req of requests) {
        const studentRef = doc(firestore, "studentGames", req.userId);
        batch.set(studentRef, { status: "joined" }, { merge: true });
    }

    await batch.commit();
  };

  const updateReport = async (gameId: string, round: number, teamName: string, reportData: any) => {
    if (!firestore) return;

    const gameRef = doc(firestore, "games", gameId);
    const reportPath = `reports.${round}.${teamName}`;
    const updatePayload: { [key: string]: any } = { [reportPath]: reportData };

    if (reportData.published) {
        const gameDoc = await getDoc(gameRef);
        if (!gameDoc.exists()) return;
        const gameData = gameDoc.data() as Game;

        const isFinalRound = (round + 1) === gameData.numRounds;
        const displayRound = isFinalRound ? gameData.numRounds : round + 1;
        const title = isFinalRound ? 'Reporte Final Disponible' : `Reporte Disponible: Ronda ${displayRound}`;
        const messageContent = `El reporte para la ronda ${displayRound} ya está disponible en tu sección de Reporte.`;

        const existingMessages = gameData.messages || [];
        const messageExists = existingMessages.some(
            msg => msg.to === teamName && msg.title === title && msg.type === 'report'
        );

        if (!messageExists) {
            const newMessage: GameMessage = {
                id: `msg-report-${round}-${teamName}-${Date.now()}`,
                from: 'system',
                to: teamName,
                title: title,
                content: messageContent,
                type: 'report',
                timestamp: Date.now(),
                readBy: [],
            };
            updatePayload.messages = arrayUnion(newMessage);
        }
    }
    
    await updateDoc(gameRef, updatePayload);
  };


  const updateTeamPerformance = async (gameId: string, round: number, performanceData: TeamPerformanceData[], newMessages: GameMessage[], automaticCrises: { teamName: string, crisisIds: string[] }[]) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);

    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;
    const gameData = gameDoc.data() as Game;
    
    const nextRound = round + 1;

    const updateData: Record<string, any> = {
        [`performance.${round}`]: performanceData,
        messages: arrayUnion(...newMessages),
        round: nextRound,
    };

    if (nextRound >= gameData.numRounds) {
        updateData.status = "Finalizado";
    }

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

    if (automaticCrises.length > 0) {
        updateData[`roundSettings.${nextRound}`] = existingNextRoundSettings;
    }
    
    await updateDoc(gameRef, updateData);
  };

  const updateRoundSettings = async (gameId: string, currentRound: number, settings: RoundSettings, isBlindForNextRound: boolean) => {
    if (!firestore) return;
    const gameRef = doc(firestore, "games", gameId);
    
    const updatePayload: Record<string, any> = {
        [`roundSettings.${currentRound}`]: settings
    };
    
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) return;
    const gameData = gameDoc.data();
    
    const nextRoundIndex = currentRound; 
    const nextRoundSettings = gameData.roundSettings?.[nextRoundIndex] || { investments: [], teamCrises: [] };
    nextRoundSettings.isBlind = isBlindForNextRound;
    updatePayload[`roundSettings.${nextRoundIndex}`] = nextRoundSettings;
    
    let newMessages: GameMessage[] = [];
    settings.teamCrises.forEach(newTeamCrisis => {
        const previousCrises = gameData.roundSettings?.[currentRound]?.teamCrises.find((tc: any) => tc.teamName === newTeamCrisis.teamName)?.crisisIds || [];
        const addedCrises = newTeamCrisis.crisisIds.filter(id => !previousCrises.includes(id));
        
        if (addedCrises.length > 0) {
            newMessages.push({
                id: `msg-crisis-${Date.now()}-${newTeamCrisis.teamName}`,
                from: 'system', to: newTeamCrisis.teamName, title: 'ATENCIÓN: ¡CRISIS!',
                content: 'Se ha presentado un evento de crisis inesperado. Revisa tu dashboard para tomar una decisión crucial.',
                type: 'crisis', timestamp: Date.now(), readBy: [],
            });
        }
    });

    if (newMessages.length > 0) {
        updatePayload.messages = arrayUnion(...newMessages);
    }
    
    await updateDoc(gameRef, updatePayload);
  };

  const updateTeamKpis = async (gameId: string, round: number, teamName: string, kpis: Partial<TeamKPIs>) => {
    if (!firestore) return;

    const gameRef = doc(firestore, "games", gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) throw new Error("Game not found");
    
    const gameData = gameDoc.data();
    const performanceData = gameData.performance?.[round];
    if (!performanceData) throw new Error(`No performance data for round ${round}`);

    const teamIndex = performanceData.findIndex((p: TeamPerformanceData) => p.name === teamName);
    if (teamIndex === -1) throw new Error(`Team ${teamName} not found in performance data for round ${round}`);
    
    const updatedPerformanceData = [...performanceData];
    const currentKpis = updatedPerformanceData[teamIndex].kpis;
    
    const newKpis = { ...currentKpis };
    for (const key in kpis) {
      const value = kpis[key as keyof TeamKPIs];
      if (typeof value === 'number' && !isNaN(value)) {
        (newKpis as any)[key] = value;
      }
    }
    updatedPerformanceData[teamIndex].kpis = newKpis;

    const updatePayload = {
      [`performance.${round}`]: updatedPerformanceData,
    };
    
    await updateDoc(gameRef, updatePayload);
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
    const gameRef = doc(firestore, "games", gameId);

    const decisionsToSave: Partial<TeamDecision> = { ...decisions };

    Object.keys(decisionsToSave).forEach(keyStr => {
        const key = keyStr as keyof TeamDecision;
        if (decisionsToSave[key] === undefined) {
            delete decisionsToSave[key];
        }
    });
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
  
    await updateDoc(gameRef, updateData);
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

    const querySnapshot = await getDocs(q);
    const studentGames = querySnapshot.docs.map(doc => doc.data() as StudentGameState);
    return studentGames;

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
        updateTeamKpis,
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

    

    