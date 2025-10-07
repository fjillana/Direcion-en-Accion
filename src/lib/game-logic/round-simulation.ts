

import type { Game, TeamPerformanceData, TeamDecision, GameMessage, StudentGameState } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs, AIArchetype } from "./types";
import { getAIDecisions } from "./ai-strategy";

const getStudentDecisions = (teamName: string, game: Game, studentGames: StudentGameState[]): TeamDecision => {
    console.log(`--- DEBUG: [getStudentDecisions] START for team ${teamName} ---`);
    const studentState = studentGames.find(sg => sg.teamName === teamName);
    const roundDecisions = game.decisions?.[game.round] || {};
    const teamDecision = roundDecisions[teamName];

    console.log('Found student state:', studentState ? JSON.parse(JSON.stringify(studentState)) : 'Not Found');
    console.log(`Decisions for round ${game.round} in game object:`, teamDecision ? JSON.parse(JSON.stringify(teamDecision)) : 'Not Found');


    // Fallback if no decisions are found
    const fallbackDecisions: TeamDecision = {
        investments: [],
        tuitionPrice: 120, // Default price
        crisisResponse: null,
        selectedCenterActions: [],
        roundConfirmed: false,
    };
    
    if (teamDecision) {
        const decisionsToReturn = {
            investments: teamDecision.investments || [],
            tuitionPrice: teamDecision.tuitionPrice || 120,
            crisisResponse: teamDecision.crisisResponse || null,
            selectedCenterActions: teamDecision.selectedCenterActions || [],
            roundConfirmed: teamDecision.roundConfirmed || false,
        };
        console.log('Returning decisions from game object:', JSON.parse(JSON.stringify(decisionsToReturn)));
        console.log(`--- DEBUG: [getStudentDecisions] END for team ${teamName} ---`);
        return decisionsToReturn;
    }
    
    console.warn(`No decisions found for team ${teamName} in round ${game.round}. Using fallback.`);
    console.log(`--- DEBUG: [getStudentDecisions] END for team ${teamName} ---`);
    return fallbackDecisions;
}

const aiArchetypes: AIArchetype[] = ['BALANCED', 'AGGRESSIVE_GROWTH', 'FINANCE_CONSERVATIVE', 'QUALITY_FOCUSED'];


export function simulateRound(game: Game, studentGames: StudentGameState[]): { performanceData: TeamPerformanceData[], newMessages: GameMessage[] } {
  console.log('--- DEBUG: [simulateRound] START ---');
  console.log('Simulating with game data:', JSON.parse(JSON.stringify(game)));
  console.log('Simulating with studentGames data:', JSON.parse(JSON.stringify(studentGames)));

  const numIaTeams = game.teams > game.teamNames.length ? game.teams - game.teamNames.length : 0;

  const initialKPIs = (gameData: Game): TeamKPIs => ({
    cash: gameData.initialFunds,
    personnelCost: 240000, 
    income: 0,
    privateIncome: 0,
    publicIncome: 0,
    nma: 7.5,
    marketShare: 100 / (game.teamNames.length + numIaTeams || 1),
    morale: 80,
    studentTeacherRatio: 25.0,
    numStudents: 800,
    numTeachers: 32,
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
        decisions: getAIDecisions({ name, type: 'IA', kpis, archetype, decisions: {} as TeamDecision }, game),
        archetype,
    });
  }

  console.log('Initial teams state for simulation:', JSON.parse(JSON.stringify(currentTeamsState)));
  
  // --- For ALL Rounds (including Round 0) ---
  const marketResults = calculateMarketAttractiveness(currentTeamsState, game);
  console.log('Market attractiveness results:', JSON.parse(JSON.stringify(marketResults)));


  const teamsWithUpdatedKpis: TeamState[] = currentTeamsState.map(team => {
      const newStudents = marketResults[team.name]?.newStudents || 0;
      const updatedKpis = updateKpisForNextRound(team, newStudents);
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
    const performance = calculateTeamPerformance(teamState, isOverloaded);

    const result: TeamPerformanceData = {
      name: teamState.name,
      type: teamState.type,
      ...performance,
      decisions: teamState.decisions,
      kpis: teamState.kpis,
    };
    
    if (teamState.archetype) {
      result.archetype = teamState.archetype;
    }
    
    return result;
  });

  console.log('Final performance results:', JSON.parse(JSON.stringify(performanceResults)));
  console.log('--- DEBUG: [simulateRound] END ---');
  
  const newMessages: GameMessage[] = [];

  return { performanceData: performanceResults, newMessages };
}
