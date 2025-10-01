import type { Game, TeamPerformanceData } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import type { TeamState } from "./types";

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
      marketShare: mockTeamState.kpis.marketShare + (Math.random() * 2 - 1),
    },
    decisions: {
      investments: Math.random() > 0.5 ? [{ id: 'R1', name: 'Campaña publicitaria en redes', cost: 10000, effect: '' }] : [],
      tuitionPrice: 110 + Math.floor(Math.random() * 20),
      crisisResponse: null,
      selectedCenterActions: [],
    }
  }));

  // 1. Calculate Market Attractiveness and distribute new students
  const marketResults = calculateMarketAttractiveness(currentTeamsState);

  // 2. Update each team's state with new students before calculating performance
  const updatedTeamsState = currentTeamsState.map(team => {
    const marketData = marketResults[team.name];
    if (marketData) {
      return {
        ...team,
        kpis: {
          ...team.kpis,
          numStudents: team.kpis.numStudents + marketData.newStudents
        }
      };
    }
    return team;
  });


  // 3. Calculate performance for each team based on their updated state
  const performanceResults: TeamPerformanceData[] = updatedTeamsState.map(teamState => {
    // In a real scenario, we would fetch the actual state of each team
    // For now, we use a mocked state for all.
    const performance = calculateTeamPerformance(teamState.kpis);

    return {
      name: teamState.name,
      type: teamState.type,
      ...performance,
    };
  });

  return performanceResults;
}
