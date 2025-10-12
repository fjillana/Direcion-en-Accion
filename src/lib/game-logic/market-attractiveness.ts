// src/lib/game-logic/market-attractiveness.ts

import type { Game } from "@/hooks/use-games";
import type { TeamState } from "./types";
import { investments as allInvestments } from '@/app/teacher/catalog/investment-data';

/**
 * Calcula el índice de atractividad de mercado (IAM) para cada equipo y distribuye los nuevos alumnos.
 * Este es el núcleo del MAM (Modelo de Atractividad de Mercado).
 * @param teams - Un array con el estado actual de todos los equipos en el juego.
 * @param game - El objeto del juego actual, que contiene la configuración de la partida.
 * @returns Un objeto con los resultados para cada equipo, incluyendo los nuevos alumnos.
 */
export function calculateMarketAttractiveness(teams: TeamState[], game: Game) {
  if (teams.length === 0) {
    return {};
  }
  const NEW_STUDENTS_POOL = game.newStudentsPerRound;

  // 1. Calcular el precio medio del mercado.
  // Este valor sirve como benchmark contra el que se compara cada equipo.
  const totalTuition = teams.reduce((sum, team) => sum + team.decisions.tuitionPrice, 0);
  const averageTuition = totalTuition / teams.length;

  let totalIamPoints = 0;
  const teamIamResults: Record<string, { iam: number; points: { nma: number; price: number; marketing: number } }> = {};

  // 2. Calcular el IAM para cada equipo siguiendo la fórmula del manual técnico.
  // IAM = (NMA * 10) + (Precio medio / Precio del equipo * 30) + (Inversión en Marketing / 1000)
  for (const team of teams) {
    // a. Componente de Calidad (50%): Se multiplica la NMA por 10 para escalarla.
    const nmaPoints = team.kpis.nma * 10;

    // b. Componente de Precio (30%): Se calcula la competitividad del precio en relación a la media del mercado.
    const pricePoints = team.decisions.tuitionPrice > 0 ? (averageTuition / team.decisions.tuitionPrice) * 30 : 0;
    
    // c. Componente de Marketing (20%): Se calcula en base a la inversión en la campaña "R1".
    const marketingActionId = (team.decisions?.actions || []).find(id => id === 'R1');
    let marketingPoints = 0;
    if (marketingActionId) {
        const investmentInfo = allInvestments.find(inv => inv.id === 'R1');
        if (investmentInfo) {
            // Asumimos el coste máximo para inversiones de rango por ahora.
            // Para una simulación más precisa, el coste exacto debería guardarse en el objeto de decisión.
            const cost = investmentInfo.cost.type === 'range' ? investmentInfo.cost.value[1] : investmentInfo.cost.value as number;
            marketingPoints = cost / 1000;
        }
    }

    // Fórmula completa del IAM
    const iam = nmaPoints + pricePoints + marketingPoints;
    const finalIam = Math.max(0, iam); // El IAM no puede ser negativo.

    teamIamResults[team.name] = {
        iam: finalIam,
        points: { nma: nmaPoints, price: pricePoints, marketing: marketingPoints }
    };
    totalIamPoints += finalIam;
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
