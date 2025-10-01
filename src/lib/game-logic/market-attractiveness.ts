// src/lib/game-logic/market-attractiveness.ts

import type { Game } from "@/hooks/use-games";
import type { TeamState } from "./types";

// This is the total pool of new students available in the market each round.
// In a future version, this could come from the game settings.
const NEW_STUDENTS_POOL = 50;

/**
 * Calculates the market attractiveness index (IAM) for each team and distributes new students.
 * This is the core of the MAM (Market Attractiveness Model).
 * @param teams - An array of the current state of all teams in the game.
 * @returns An object containing the results for each team, including new students.
 */
export function calculateMarketAttractiveness(teams: TeamState[]) {
  if (teams.length === 0) {
    return {};
  }

  // 1. Calculate market averages for price and NMA
  const totalTuition = teams.reduce((sum, team) => sum + team.decisions.tuitionPrice, 0);
  const averageTuition = totalTuition / teams.length;

  const totalNma = teams.reduce((sum, team) => sum + team.kpis.nma, 0);
  const averageNma = totalNma / teams.length;
  
  let totalIamPoints = 0;
  const teamIamResults: Record<string, { iam: number; points: { nma: number; price: number; marketing: number } }> = {};

  // 2. Calculate IAM points for each team
  for (const team of teams) {
    // a. NMA Points: More points for higher NMA compared to average
    const nmaDifference = team.kpis.nma - averageNma;
    const nmaPoints = Math.round(nmaDifference * 20); // e.g., 0.5 difference = 10 points

    // b. Price Points: More points for lower price compared to average
    const priceDifference = averageTuition - team.decisions.tuitionPrice;
    const pricePoints = Math.round(priceDifference / 5); // e.g., 50 CC cheaper = 10 points
    
    // c. Marketing Points: Direct points from investment
    // We assume 'R1' is the marketing investment. In a real scenario, this should be more robust.
    const marketingInvestment = team.decisions.investments.find(inv => inv.id === 'R1');
    const marketingPoints = marketingInvestment ? Math.round(marketingInvestment.cost / 1000) : 0; // e.g., 10,000 CC = 10 points

    const totalPoints = 50 + nmaPoints + pricePoints + marketingPoints; // Base of 50 points for everyone
    const iam = Math.max(0, totalPoints); // Ensure IAM is not negative

    teamIamResults[team.name] = {
        iam,
        points: { nma: nmaPoints, price: pricePoints, marketing: marketingPoints }
    };
    totalIamPoints += iam;
  }

  // 3. Distribute new students based on IAM share
  const finalResults: Record<string, { iam: number; newStudents: number }> = {};
  if (totalIamPoints > 0) {
    for (const team of teams) {
        const iamShare = teamIamResults[team.name].iam / totalIamPoints;
        const newStudents = Math.round(iamShare * NEW_STUDENTS_POOL);
        finalResults[team.name] = {
            iam: teamIamResults[team.name].iam,
            newStudents: newStudents
        };
    }
  } else {
    // If no one has any IAM points, distribute students equally
    const newStudentsPerTeam = Math.floor(NEW_STUDENTS_POOL / teams.length);
    for (const team of teams) {
        finalResults[team.name] = {
            iam: 0,
            newStudents: newStudentsPerTeam
        };
    }
  }

  return finalResults;
}