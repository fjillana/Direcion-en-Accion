


import type { Game, TeamPerformanceData, TeamDecision, GameMessage } from "@/hooks/use-games";
import { calculateTeamPerformance } from "./scoring";
import { calculateMarketAttractiveness } from "./market-attractiveness";
import { updateKpisForNextRound } from "./kpi-dynamics";
import type { TeamState, TeamKPIs, AIArchetype } from "./types";
import { getAIDecisions } from "./ai-strategy";

const getStudentDecisions = (teamName: string, game: Game): TeamDecision => {
    const key = `decisions_${game.id}_${teamName}_${game.round}`;
    if (typeof window !== 'undefined') {
        const storedDecisions = localStorage.getItem(key);
        if (storedDecisions) {
            const parsed = JSON.parse(storedDecisions);
            // Ensure selectedInvestments is an array of objects
            if (parsed.selectedInvestments && Array.isArray(parsed.selectedInvestments) && parsed.selectedInvestments.length > 0 && typeof parsed.selectedInvestments[0] === 'string') {
              return { ...parsed, selectedInvestments: [] }; // Reset if it's old format
            }
            return parsed;
        }
    }
    // Fallback if no decisions are found
    return {
        investments: [],
        tuitionPrice: 120,
        crisisResponse: null,
        selectedCenterActions: [],
        roundConfirmed: false
    };
}

const aiArchetypes: AIArchetype[] = ['BALANCED', 'AGGRESSIVE_GROWTH', 'FINANCE_CONSERVATIVE', 'QUALITY_FOCUSED'];


export function simulateRound(game: Game): { performanceData: TeamPerformanceData[], newMessages: GameMessage[] } {
  const humanTeamsCount = game.teamNames.length;
  const numIaTeams = humanTeamsCount > 0 ? humanTeamsCount : 4; // Manual: 4 IA rivals

  const initialKPIs = (gameData: Game): TeamKPIs => ({
    cash: gameData.initialFunds,
    personnelCost: 240000, 
    income: 320000,
    privateIncome: 0,
    publicIncome: 0,
    nma: 7.5,
    marketShare: 100 / (humanTeamsCount + numIaTeams),
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
        decisions: getStudentDecisions(name, game),
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
  
  // For Round 0, we just apply initial decisions without market simulation
  if (game.round === 0) {
      const performanceResults: TeamPerformanceData[] = currentTeamsState.map(teamState => {
        const kpisAfterInitialInvestment = updateKpisForNextRound(teamState, 0, true);
        const performance = calculateTeamPerformance(kpisAfterInitialInvestment, false);
        return {
          name: teamState.name,
          type: teamState.type,
          ...performance,
          decisions: teamState.decisions,
          kpis: kpisAfterInitialInvestment,
          archetype: teamState.archetype,
        };
      });
      return { performanceData: performanceResults, newMessages: [] };
  }

  // --- For Round 1 onwards ---
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
    const performance = calculateTeamPerformance(teamState.kpis, isOverloaded);

    return {
      name: teamState.name,
      type: teamState.type,
      ...performance,
      decisions: teamState.decisions,
      kpis: teamState.kpis,
      archetype: teamState.archetype,
    };
  });
  
  const newMessages: GameMessage[] = game.teamNames.map(teamName => ([
    {
        id: `msg-${Date.now()}-report-${teamName}`,
        from: 'system',
        to: teamName,
        content: `El reporte de la ronda ${game.round} ya está disponible.`,
        title: "Reporte Disponible",
        type: "report",
        timestamp: Date.now(),
        readBy: []
    },
    {
        id: `msg-${Date.now()}-newround-${teamName}`,
        from: 'system',
        to: teamName,
        content: `Ha comenzado la ronda ${game.round + 1}. Ya puedes tomar tus decisiones.`,
        title: "Nueva Ronda Disponible",
        type: "message",
        timestamp: Date.now(),
        readBy: []
    }
  ])).flat();

  return { performanceData: performanceResults, newMessages };
}
