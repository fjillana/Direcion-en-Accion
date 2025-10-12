

import type { Game, TeamPerformanceData, TeamDecision, GameMessage, StudentGameState } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs, AIArchetype } from "./types";
import { getAIDecisions } from "./ai-strategy";

const getStudentDecisions = (teamName: string, game: Game, studentGames: StudentGameState[]): TeamDecision => {
    const studentState = studentGames.find(sg => sg.teamName === teamName);
    const roundDecisions = game.decisions?.[game.round] || {};
    const teamDecision = roundDecisions[teamName];

    console.log(`[GPS] 3a. Retrieving decisions for ${teamName} in Round ${game.round}. Found:`, teamDecision);

    // Fallback if no decisions are found
    const fallbackDecisions: TeamDecision = {
        actions: [],
        tuitionPrice: 120, // Default price
        crisisResponse: null,
        roundConfirmed: false,
    };
    
    if (teamDecision) {
        const decisionsToReturn: TeamDecision = {
            actions: teamDecision.actions || [],
            tuitionPrice: teamDecision.tuitionPrice || 120,
            crisisResponse: teamDecision.crisisResponse || null,
            roundConfirmed: teamDecision.roundConfirmed || false,
        };
        console.log(`[GPS] 3b. Parsed decisions for ${teamName}:`, decisionsToReturn);
        return decisionsToReturn;
    }
    
    console.log(`[GPS] 3b. No decisions found for ${teamName}. Using fallback.`);
    return fallbackDecisions;
}

const aiArchetypes: AIArchetype[] = ['BALANCED', 'AGGRESSIVE_GROWTH', 'FINANCE_CONSERVATIVE', 'QUALITY_FOCUSED'];


export function simulateRound(game: Game, studentGames: StudentGameState[]): { performanceData: TeamPerformanceData[], newMessages: GameMessage[] } {
  
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
  
  console.log('[GPS] 4. Initial team states for this round:', currentTeamsState);

  // --- For ALL Rounds (including Round 0) ---
  const marketResults = calculateMarketAttractiveness(currentTeamsState, game);

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
  
  console.log('[GPS] 6. Final performance results for the round:', performanceResults);

  return { performanceData: performanceResults, newMessages };
}
