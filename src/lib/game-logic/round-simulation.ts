

import type { Game, TeamPerformanceData, TeamDecision, GameMessage, StudentGameState, RoundDecisions } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs, AIArchetype } from "./types";
import { getAIDecisions } from "./ai-strategy";
import { getAchievementsStatus } from "../achievements";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

const getStudentDecisions = (teamName: string, game: Game, studentGames: StudentGameState[]): RoundDecisions => {
    const studentState = studentGames.find(sg => sg.teamName === teamName);
    const roundDecisions = game.decisions?.[game.round] || {};
    const teamDecision = roundDecisions[teamName];

    // Fallback if no decisions are found, ensuring no undefined fields.
    const fallbackDecisions: RoundDecisions = {
        actions: [],
        tuitionPrice: 120,
        crisisResponse: null,
        roundConfirmed: false,
        investmentCosts: {},
        poachingTarget: undefined,
        poachingSuccess: false,
        forcedByTeacher: false,
    };
    
    if (teamDecision) {
        // Build the return object field by field to ensure no 'undefined' values slip through.
        const decisionsToReturn: RoundDecisions = {
            actions: teamDecision.actions || [],
            tuitionPrice: teamDecision.tuitionPrice || 120,
            crisisResponse: teamDecision.crisisResponse || null,
            roundConfirmed: teamDecision.roundConfirmed || false,
            investmentCosts: teamDecision.investmentCosts || {},
            // Explicitly default optional fields to a valid value (null/false) instead of undefined.
            poachingTarget: teamDecision.poachingTarget || undefined,
            poachingSuccess: teamDecision.poachingSuccess || false,
            forcedByTeacher: teamDecision.forcedByTeacher || false,
        };
        return decisionsToReturn;
    }
    
    return fallbackDecisions;
}

const aiArchetypes: AIArchetype[] = ['BALANCED', 'AGGRESSIVE_GROWTH', 'FINANCE_CONSERVATIVE', 'QUALITY_FOCUSED'];


export function simulateRound(game: Game, studentGames: StudentGameState[]): { performanceData: TeamPerformanceData[], newMessages: GameMessage[], automaticCrises: { teamName: string, crisisIds: string[]}[] } {

  const numHumanTeams = game.teamNames.length;
  const numIaTeams = numHumanTeams > 0 ? numHumanTeams : 0; // 1 AI for each Human team
  const totalTeams = numHumanTeams + numIaTeams;

  const initialKPIs = (gameData: Game): TeamKPIs => ({
    cash: gameData.initialFunds,
    personnelCost: 240000, 
    income: 0,
    privateIncome: 0,
    publicIncome: 0,
    nma: 7.5,
    marketShare: 100 / (totalTeams || 1),
    morale: 80,
    studentTeacherRatio: 25.0,
    numStudents: 800,
    numTeachers: 32,
    capacity: 810,
  });

  const previousRound = game.round > 0 ? game.round -1 : 0;
  const previousPerformance = game.performance?.[previousRound];

  let currentTeamsState: TeamState[] = [];

  // Build state for human teams
  game.teamNames.forEach(name => {
    const previousTeamState = previousPerformance?.find(p => p.name === name);
    const kpis = previousTeamState ? previousTeamState.kpis : initialKPIs(game);
     currentTeamsState.push({
        name,
        type: 'H',
        kpis,
        decisions: getStudentDecisions(name, game, studentGames),
        performanceHistory: game.performance ? Object.values(game.performance).flat().filter(p => p.name === name) : []
    });
  });

  // Build state for AI teams
  for (let i = 0; i < numIaTeams; i++) {
    const name = `IA Rival ${i + 1}`;
    const previousTeamState = previousPerformance?.find(p => p.name === name);
    const kpis = previousTeamState ? previousTeamState.kpis : initialKPIs(game);
    
    const archetype = previousTeamState?.archetype || aiArchetypes[i % aiArchetypes.length];

    currentTeamsState.push({
        name,
        type: 'IA',
        kpis,
        decisions: getAIDecisions({ name, type: 'IA', kpis, archetype, decisions: {} as RoundDecisions, performanceHistory: [] }, game),
        archetype,
        performanceHistory: game.performance ? Object.values(game.performance).flat().filter(p => p.name === name) : []
    });
  }

  // --- Handle poaching logic ---
  const poachingEffects: Record<string, { teacherChange: number, moraleChange: number }> = {};
  const newMessages: GameMessage[] = [];

  currentTeamsState.forEach(team => {
      poachingEffects[team.name] = { teacherChange: 0, moraleChange: 0 };
  });

  currentTeamsState.forEach(poachingTeam => {
      if (poachingTeam.decisions.actions.includes('P3') && poachingTeam.decisions.poachingTarget) {
          const targetTeamName = poachingTeam.decisions.poachingTarget;
          const targetTeamState = currentTeamsState.find(t => t.name === targetTeamName);
          
          if (targetTeamState && targetTeamState.kpis.morale < 70) {
              // Successful poach
              poachingTeam.decisions.poachingSuccess = true;
              poachingEffects[poachingTeam.name].teacherChange += 1;
              poachingEffects[targetTeamName].teacherChange -= 1;
              poachingEffects[targetTeamName].moraleChange -= 10;
              
              // Notify the team that lost the teacher, if human
              if (targetTeamState.type === 'H') {
                  newMessages.push({
                    id: `msg-poached-${Date.now()}-${targetTeamName}`,
                    from: 'system',
                    to: targetTeamName,
                    title: '¡ATENCIÓN! Fuga de talento',
                    content: `¡Te han robado un profesor! Un competidor ha fichado a un miembro de tu equipo. Pierdes un docente y sufres una penalización de -10 en la moral.`,
                    type: 'message',
                    timestamp: Date.now(),
                    readBy: [],
                  });
              }

              // Notify the poaching team of success, if human
              if (poachingTeam.type === 'H') {
                 newMessages.push({
                    id: `msg-poach-success-${Date.now()}-${poachingTeam.name}`,
                    from: 'system',
                    to: poachingTeam.name,
                    title: 'Fichaje Exitoso',
                    content: `¡Enhorabuena! Tu intento de "poaching" ha tenido éxito. Has contratado un nuevo profesor del equipo "${targetTeamName}".`,
                    type: 'message',
                    timestamp: Date.now(),
                    readBy: [],
                  });
              }

          } else {
              // Unsuccessful poach
              poachingTeam.decisions.poachingSuccess = false;
               // Notify the poaching team of failure, if human
              if (poachingTeam.type === 'H') {
                 newMessages.push({
                    id: `msg-poach-fail-${Date.now()}-${poachingTeam.name}`,
                    from: 'system',
                    to: poachingTeam.name,
                    title: 'Fichaje Fallido',
                    content: `Tu intento de "poaching" al equipo "${targetTeamName}" ha fallado. La moral de su personal era demasiado alta (superior al 70%). La inversión no se ha ejecutado y no ha tenido coste.`,
                    type: 'message',
                    timestamp: Date.now(),
                    readBy: [],
                  });
              }
          }
      }
  });
  
  // Apply poaching effects before main KPI update
  const teamsAfterPoaching = currentTeamsState.map(team => {
      const effects = poachingEffects[team.name];
      return {
          ...team,
          kpis: {
              ...team.kpis,
              numTeachers: team.kpis.numTeachers + effects.teacherChange,
              morale: Math.max(0, team.kpis.morale + effects.moraleChange),
          }
      };
  });


  // --- For ALL Rounds (including Round 0) ---
  const marketResults = calculateMarketAttractiveness(teamsAfterPoaching, game);
  
  const negotiationOutcomes: Record<string, boolean> = {};
  teamsAfterPoaching.forEach(team => {
    if (
        team.decisions.crisisResponse?.optionId === 'C2_op3' || 
        team.decisions.crisisResponse?.optionId === 'C5_op5' ||
        team.decisions.crisisResponse?.optionId === 'C6_op1'
    ) {
      negotiationOutcomes[team.name] = Math.random() < 0.5; // 50% chance
    }
  });


  const teamsWithUpdatedKpis: TeamState[] = teamsAfterPoaching.map(team => {
      const newStudents = marketResults[team.name]?.newStudents || 0;
      const negotiationSuccess = negotiationOutcomes[team.name];
      const updatedKpis = updateKpisForNextRound(team, newStudents, team.performanceHistory, negotiationSuccess);
      return {
          ...team,
          kpis: updatedKpis,
      };
  });

  const totalStudentsInMarket = teamsWithUpdatedKpis.reduce((sum, team) => sum + team.kpis.numStudents, 0);
  
  const finalTeamsState = teamsWithUpdatedKpis.map(team => ({
      ...team,
      kpis: {
          ...team.kpis,
          marketShare: totalStudentsInMarket > 0 ? (team.kpis.numStudents / totalStudentsInMarket) * 100 : 0,
      }
  }));

  const performanceResults: TeamPerformanceData[] = finalTeamsState.map(teamState => {
    const isOverloaded = teamState.kpis.studentTeacherRatio > 26.0;
    const negotiationSuccess = negotiationOutcomes[teamState.name];
    const performance = calculateTeamPerformance(teamState);

    // Clean the decisions object before saving
    const finalDecisions = { ...teamState.decisions };
    
    const result: TeamPerformanceData = {
      name: teamState.name,
      type: teamState.type,
      round: game.round,
      ...performance,
      decisions: finalDecisions,
      kpis: teamState.kpis,
    };
    
    if (teamState.archetype) {
      result.archetype = teamState.archetype;
    }
    
    return result;
  });

  const automaticCrises: { teamName: string, crisisIds: string[] }[] = [];

  const { firestore } = initializeFirebase();

  // --- Automatic Crisis & Achievement Trigger Check ---
  performanceResults.forEach(teamPerformance => {
    if (teamPerformance.type === 'H') {
      const student = studentGames.find(s => s.teamName === teamPerformance.name);
      if (student) {
        const teamHistory = game.performance ? Object.values(game.performance).flat().filter(p => p.name === teamPerformance.name) : [];
        const fullHistory = [...teamHistory, teamPerformance];
        const currentAchievements = getAchievementsStatus(fullHistory).filter(a => a.unlocked).map(a => a.name);
        const previousAchievements = student.unlockedAchievements || [];
        
        if (currentAchievements.length > previousAchievements.length) {
          const studentRef = doc(firestore, "studentGames", student.userId);
          updateDoc(studentRef, { unlockedAchievements: currentAchievements });
        }
      }
    }
    
    // Check for Teacher Strike
    if (teamPerformance.kpis.morale < 50) {
      automaticCrises.push({ teamName: teamPerformance.name, crisisIds: ['C1'] });

      // Message for the student
      newMessages.push({
        id: `msg-strike-student-${Date.now()}-${teamPerformance.name}`,
        from: 'system',
        to: teamPerformance.name,
        title: '¡HUELGA DOCENTE!',
        content: 'La moral de tu personal ha caído por debajo del 50%. Se ha convocado una huelga que paraliza el centro. Debes tomar una decisión en la siguiente ronda.',
        type: 'crisis',
        timestamp: Date.now(),
        readBy: [],
      });
    }
  });

  
  return { performanceData: performanceResults, newMessages, automaticCrises };
}
