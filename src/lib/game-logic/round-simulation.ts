import type { Game, TeamPerformanceData } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";

// This is a simplified version of the team data we'd have.
// In a real scenario, this would come from the student's decisions.
const mockTeamState = {
  cash: 25000,
  personnelCost: 240000, // 32 teachers * 7500 CC
  income: 320000,
  nma: 7.5,
  marketShare: 12.5,
  morale: 80,
  studentTeacherRatio: 25.0,
  numStudents: 800,
  numTeachers: 32,
  decisions: {
    investments: [],
    tuitionPrice: 120,
    crisisResponse: null,
  }
};


export function simulateRound(game: Game): TeamPerformanceData[] {
  const allTeamNames = [...game.teamNames];
  // Add AI rivals based on the number of human teams for this example
  const humanTeamsCount = game.teamNames.length;
  for (let i = 0; i < humanTeamsCount; i++) {
    allTeamNames.push(`IA Rival ${i + 1}`);
  }

  const performanceResults: TeamPerformanceData[] = allTeamNames.map(teamName => {
    // In a real scenario, we would fetch the actual state of each team
    // For now, we use a mocked state for all.
    const isHuman = game.teamNames.includes(teamName);
    
    // Create a slightly varied state for each team for demonstration
    const currentTeamState = {
      ...mockTeamState,
      nma: mockTeamState.nma + (Math.random() - 0.5), // +/- 0.5
      marketShare: mockTeamState.marketShare + (Math.random() * 2 - 1), // +/- 1
      morale: mockTeamState.morale + (Math.random() * 10 - 5), // +/- 5
      cash: mockTeamState.cash + (Math.random() * 10000 - 5000), // +/- 5000
    };

    const performance = calculateTeamPerformance(currentTeamState);

    return {
      name: teamName,
      type: isHuman ? 'H' : 'IA',
      ...performance,
    };
  });

  return performanceResults;
}
