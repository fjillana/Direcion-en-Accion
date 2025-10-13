

import type { Game, TeamPerformanceData, TeamDecision, GameMessage, StudentGameState, RoundDecisions } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs, AIArchetype } from "./types";
import { getAIDecisions } from "./ai-strategy";

const getStudentDecisions = (teamName: string, game: Game, studentGames: StudentGameState[]): RoundDecisions => {
    const studentState = studentGames.find(sg => sg.teamName === teamName);
    const roundDecisions = game.decisions?.[game.round] || {};
    const teamDecision = roundDecisions[teamName];

    console.log(`[GPS] 3a. Retrieving decisions for ${teamName} in Round ${game.round}. Found:`, teamDecision);

    // Fallback if no decisions are found
    const fallbackDecisions: RoundDecisions = {
        actions: [],
        tuitionPrice: 120, // Default price
        crisisResponse: null,
        roundConfirmed: false,
        investmentCosts: {},
        poachingTarget: undefined,
    };
    
    if (teamDecision) {
        const decisionsToReturn: RoundDecisions = {
            actions: teamDecision.actions || [],
            tuitionPrice: teamDecision.tuitionPrice || 120,
            crisisResponse: teamDecision.crisisResponse || null,
            roundConfirmed: teamDecision.roundConfirmed || false,
            investmentCosts: teamDecision.investmentCosts || {},
            poachingTarget: teamDecision.poachingTarget,
        };
        console.log(`[GPS] 3b. Parsed decisions for ${teamName}:`, decisionsToReturn);
        return decisionsToReturn;
    }
    
    console.log(`[GPS] 3b. No decisions found for ${teamName}. Using fallback.`);
    return fallbackDecisions;
}

const aiArchetypes: AIArchetype[] = ['BALANCED', 'AGGRESSIVE_GROWTH', 'FINANCE_CONSERVATIVE', 'QUALITY_FOCUSED'];


export function simulateRound(game: Game, studentGames: StudentGameState[]): { performanceData: TeamPerformanceData[], newMessages: GameMessage[], automaticCrises: { teamName: string, crisisIds: string[]}[] } {
  
  console.log(`[GPS] 3. Starting round simulation for Game "${game.name}", Round ${game.round}`);

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

  const currentTeamsState: TeamState[] = [];

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
  
  console.log('[GPS] 4. Initial team states for this round:', currentTeamsState);

  // --- Handle poaching logic ---
  const poachingEffects: Record<string, { teacherChange: number, moraleChange: number }> = {};
  currentTeamsState.forEach(team => {
      poachingEffects[team.name] = { teacherChange: 0, moraleChange: 0 };
  });

  currentTeamsState.forEach(poachingTeam => {
      if (poachingTeam.decisions.actions.includes('P3') && poachingTeam.decisions.poachingTarget) {
          const targetTeamName = poachingTeam.decisions.poachingTarget;
          const targetTeamState = currentTeamsState.find(t => t.name === targetTeamName);
          
          if (targetTeamState && targetTeamState.kpis.morale < 70) {
              // Successful poach
              poachingEffects[poachingTeam.name].teacherChange += 1;
              poachingEffects[targetTeamName].teacherChange -= 1;
              poachingEffects[targetTeamName].moraleChange -= 10;
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
    const performance = calculateTeamPerformance(teamState, isOverloaded, negotiationSuccess);

    const result: TeamPerformanceData = {
      name: teamState.name,
      type: teamState.type,
      round: game.round,
      ...performance,
      decisions: teamState.decisions,
      kpis: teamState.kpis,
    };
    
    if (teamState.archetype) {
      result.archetype = teamState.archetype;
    }
    
    return result;
  });

  const newMessages: GameMessage[] = [];
  const automaticCrises: { teamName: string, crisisIds: string[] }[] = [];

  // --- Automatic Crisis Trigger Check ---
  performanceResults.forEach(teamPerformance => {
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

      // Message for the teacher
       newMessages.push({
        id: `msg-strike-teacher-${Date.now()}-${teamPerformance.name}`,
        from: 'system',
        to: 'teacher',
        title: `Huelga en Equipo: ${teamPerformance.name}`,
        content: `El equipo "${teamPerformance.name}" ha sufrido una huelga docente automática por tener una moral inferior a 50%.`,
        type: 'message',
        timestamp: Date.now(),
        readBy: [],
      });
    }
  });

  
  console.log('[GPS] 6. Final performance results for the round:', performanceResults);

  return { performanceData: performanceResults, newMessages, automaticCrises };
}
