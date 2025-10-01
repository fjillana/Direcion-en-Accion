// src/lib/game-logic/market-attractiveness.ts

import type { Game } from "@/hooks/use-games";
import type { TeamState } from "./types";

// Este es el total de nuevos alumnos disponibles en el mercado cada ronda.
// En una versión futura, podría venir de los ajustes del juego.
const NEW_STUDENTS_POOL = 50;

/**
 * Calcula el índice de atractividad de mercado (IAM) para cada equipo y distribuye los nuevos alumnos.
 * Este es el núcleo del MAM (Modelo de Atractividad de Mercado).
 * @param teams - Un array con el estado actual de todos los equipos en el juego.
 * @returns Un objeto con los resultados para cada equipo, incluyendo los nuevos alumnos.
 */
export function calculateMarketAttractiveness(teams: TeamState[]) {
  if (teams.length === 0) {
    return {};
  }

  // 1. Calcular las medias del mercado para el precio y la NMA.
  // Estas medias sirven como benchmark contra el que se compara cada equipo.
  const totalTuition = teams.reduce((sum, team) => sum + team.decisions.tuitionPrice, 0);
  const averageTuition = totalTuition / teams.length;

  const totalNma = teams.reduce((sum, team) => sum + team.kpis.nma, 0);
  const averageNma = totalNma / teams.length;
  
  let totalIamPoints = 0;
  const teamIamResults: Record<string, { iam: number; points: { nma: number; price: number; marketing: number } }> = {};

  // 2. Calcular los puntos IAM para cada equipo. Cada equipo parte de una base de 50 puntos.
  for (const team of teams) {
    // a. Puntos por NMA: Más puntos por tener un NMA por encima de la media.
    // La calidad educativa es un factor clave de atracción.
    const nmaDifference = team.kpis.nma - averageNma;
    const nmaPoints = Math.round(nmaDifference * 20); // Ej: 0.5 puntos de NMA por encima de la media = 10 puntos IAM.

    // b. Puntos por Precio: Más puntos por tener un precio por debajo de la media.
    // Un precio competitivo atrae a más alumnos.
    const priceDifference = averageTuition - team.decisions.tuitionPrice;
    const pricePoints = Math.round(priceDifference / 5); // Ej: Ser 50 CC más barato que la media = 10 puntos IAM.
    
    // c. Puntos por Marketing: Puntos directos por la inversión realizada.
    // Se asume que 'R1' es la inversión en marketing. Esto debería ser más robusto en el futuro.
    const marketingInvestment = team.decisions.investments.find(inv => inv.id === 'R1');
    const marketingPoints = marketingInvestment ? Math.round(marketingInvestment.cost / 1000) : 0; // Ej: 10.000 CC = 10 puntos IAM.

    const totalPoints = 50 + nmaPoints + pricePoints + marketingPoints; // Base de 50 puntos para todos.
    const iam = Math.max(0, totalPoints); // El IAM no puede ser negativo.

    teamIamResults[team.name] = {
        iam,
        points: { nma: nmaPoints, price: pricePoints, marketing: marketingPoints }
    };
    totalIamPoints += iam;
  }

  // 3. Distribuir los nuevos alumnos en base a la cuota de IAM de cada equipo.
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
    // Caso improbable: si ningún equipo tiene puntos IAM, los alumnos se reparten equitativamente.
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