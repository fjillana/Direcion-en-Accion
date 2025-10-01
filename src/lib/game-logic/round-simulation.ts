import type { Game, TeamPerformanceData, TeamDecision } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs, AIArchetype } from "./types";
import { getAIDecisions } from "./ai-strategy";

// This is a simplified version of fetching team decisions.
// In a real scenario, this would come from a database or a more complex state management solution.
const getStudentDecisions = (teamName: string, game: Game): TeamDecision => {
    // For now, we generate mock decisions. In a real app, you would fetch this from where student decisions are stored.
    // e.g., from localStorage, a database, etc.
    const mockDecisions: TeamDecision = {
        investments: Math.random() > 0.5 ? [{ id: 'R1', name: 'Campaña publicitaria en redes', cost: 10000, effect: '' }] : [],
        tuitionPrice: 110 + Math.floor(Math.random() * 20),
        crisisResponse: Math.random() > 0.7 ? {
            crisisName: "Huelga docente",
            option: "Negociar un acuerdo parcial",
            justification: "Decisión simulada para mantener la estabilidad del centro."
        } : null,
        selectedCenterActions: Math.random() > 0.5 ? ['P2'] : [],
    }
    return mockDecisions;
}

const aiArchetypes: AIArchetype[] = ['BALANCED', 'AGGRESSIVE_GROWTH', 'FINANCE_CONSERVATIVE', 'QUALITY_FOCUSED'];


export function simulateRound(game: Game): TeamPerformanceData[] {
  const allTeamNames = [...game.teamNames];
  const humanTeamsCount = game.teamNames.length;
  const numIaTeams = humanTeamsCount; // Create one IA rival per human team

  // Define initial KPIs for the beginning of the simulation
  const initialKPIs: TeamKPIs = {
    cash: game.initialFunds,
    personnelCost: 240000, // 32 teachers * 7500 CC
    income: 320000,
    nma: 7.5,
    marketShare: 100 / (humanTeamsCount + numIaTeams),
    morale: 80,
    studentTeacherRatio: 25.0,
    numStudents: 800,
    numTeachers: 32,
  };

  // Get previous round's performance data if it exists
  const previousRound = game.round > 1 ? game.round - 1 : 1;
  const previousPerformance = game.performance?.[previousRound];

  const currentTeamsState: TeamState[] = [];

  // Build state for human teams
  game.teamNames.forEach(name => {
    const previousTeamState = previousPerformance?.find(p => p.name === name);
    const kpis = previousTeamState ? {
        // This should be a proper carry-over from one round to the next.
        // For now, we'll just use the final kpis from the previous round if they exist.
        // This part needs to be more robust in a real implementation.
        ...initialKPIs
    } : initialKPIs;
     currentTeamsState.push({
        name,
        type: 'H',
        kpis,
        decisions: getStudentDecisions(name, game), // Fetch/simulate decisions for the current round
    });
  });

  // Build state for AI teams
  for (let i = 0; i < numIaTeams; i++) {
    const name = `IA Rival ${i + 1}`;
    const previousTeamState = previousPerformance?.find(p => p.name === name);
    const kpis = previousTeamState ? { ...initialKPIs } : initialKPIs; // Simplified
    
    // Assign a persistent archetype to the AI
    const archetype = previousTeamState?.archetype || aiArchetypes[i % aiArchetypes.length];

    currentTeamsState.push({
        name,
        type: 'IA',
        kpis,
        decisions: getAIDecisions({ name, type: 'IA', kpis, archetype, decisions: {} as TeamDecision }, game),
        archetype,
    });
  }
  
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
    const performance = calculateTeamPerformance(teamState.kpis);

    return {
      name: teamState.name,
      type: teamState.type,
      ...performance,
      decisions: teamState.decisions, // Include the decisions in the performance data
      archetype: teamState.archetype,
    };
  });

  return performanceResults;
}
