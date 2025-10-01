import type { Game, TeamPerformanceData } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs } from "./types";

// This is a simplified version of the team data we'd have.
// In a real scenario, this would come from the student's decisions saved in the game state.
const mockTeamState: Omit<TeamState, 'name' | 'type' | 'decisions'> = {
  kpis: {
    cash: 25000,
    personnelCost: 240000, // 32 teachers * 7500 CC
    income: 320000,
    nma: 7.5,
    marketShare: 12.5,
    morale: 80,
    studentTeacherRatio: 25.0,
    numStudents: 800,
    numTeachers: 32,
  }
};


export function simulateRound(game: Game): TeamPerformanceData[] {
  const allTeamNames = [...game.teamNames];
  // Add AI rivals based on the number of human teams for this example
  const humanTeamsCount = game.teamNames.length;
  for (let i = 0; i < humanTeamsCount; i++) {
    allTeamNames.push(`IA Rival ${i + 1}`);
  }

  // TODO: Fetch actual decisions for each team from the game state.
  // For now, we generate mock decisions.
  const currentTeamsState: TeamState[] = allTeamNames.map(name => ({
    name,
    type: game.teamNames.includes(name) ? 'H' : 'IA',
    kpis: {
      ...mockTeamState.kpis,
      nma: mockTeamState.kpis.nma + (Math.random() - 0.5),
    },
    decisions: {
      investments: Math.random() > 0.5 ? [{ id: 'R1', name: 'Campaña publicitaria en redes', cost: 10000, effect: '' }] : [],
      tuitionPrice: 110 + Math.floor(Math.random() * 20),
      crisisResponse: null,
      selectedCenterActions: [],
    }
  }));

  // 1. Calculate Market Attractiveness and determine new students for each team
  const marketResults = calculateMarketAttractiveness(currentTeamsState);

  // 2. Update each team's KPIs based on decisions and market results
  const teamsWithUpdatedKpis: { name: string, type: 'H' | 'IA', kpis: TeamKPIs }[] = currentTeamsState.map(team => {
      const newStudents = marketResults[team.name]?.newStudents || 0;
      const updatedKpis = updateKpisForNextRound(team, newStudents);
      return {
          name: team.name,
          type: team.type,
          kpis: updatedKpis,
      };
  });

  // After all teams have their new student count, we can calculate the final market share
  const totalStudentsInMarket = teamsWithUpdatedKpis.reduce((sum, team) => sum + team.kpis.numStudents, 0);
  
  const finalTeamsState = teamsWithUpdatedKpis.map(team => ({
      ...team,
      kpis: {
          ...team.kpis,
          marketShare: totalStudentsInMarket > 0 ? (team.kpis.numStudents / totalStudentsInMarket) * 100 : 0,
      }
  }));


  // 3. Calculate performance (PEB & XP) for each team based on their updated KPIs
  const performanceResults: TeamPerformanceData[] = finalTeamsState.map(teamState => {
    const performance = calculateTeamPerformance(teamState.kpis);

    return {
      name: teamState.name,
      type: teamState.type,
      ...performance,
    };
  });

  return performanceResults;
}
