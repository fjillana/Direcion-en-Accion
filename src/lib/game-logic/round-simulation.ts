import type { Game, TeamPerformanceData, TeamDecision } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs } from "./types";

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

export function simulateRound(game: Game): TeamPerformanceData[] {
  const allTeamNames = [...game.teamNames];
  const humanTeamsCount = game.teamNames.length;

  for (let i = 0; i < humanTeamsCount; i++) {
    allTeamNames.push(`IA Rival ${i + 1}`);
  }

  // Define initial KPIs for the beginning of the simulation
  const initialKPIs: TeamKPIs = {
    cash: game.initialFunds,
    personnelCost: 240000, // 32 teachers * 7500 CC
    income: 320000,
    nma: 7.5,
    marketShare: 12.5,
    morale: 80,
    studentTeacherRatio: 25.0,
    numStudents: 800,
    numTeachers: 32,
  };

  // Get previous round's performance data if it exists, otherwise use initial KPIs
  const previousRound = game.round > 1 ? game.round - 1 : 1;
  const previousPerformance = game.performance?.[previousRound];

  const currentTeamsState: TeamState[] = allTeamNames.map(name => {
    const isHuman = game.teamNames.includes(name);
    
    // Find the previous KPIs for this team
    const previousTeamState = previousPerformance?.find(p => p.name === name);
    // TODO: The KPIs for the next round simulation should be derived from the previous round's results, not just fetched.
    // This part is still simplified.
    const kpis = previousTeamState ? { ...initialKPIs } : initialKPIs; // Simplified for now

    return {
        name,
        type: isHuman ? 'H' : 'IA',
        kpis,
        decisions: getStudentDecisions(name, game), // Fetch/simulate decisions for the current round
    }
  });
  
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
    };
  });

  return performanceResults;
}
