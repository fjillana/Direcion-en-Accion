

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
  const teamIamResults: Record<string, { iam: number; points: { nma: number; price: number; marketing: number; facilities: number; sustainability: number; crisis: number;} }> = {};

  // 2. Calcular el IAM para cada equipo siguiendo la fórmula del manual técnico.
  for (const team of teams) {
    // a. Componente de Calidad (NMA): Se multiplica la NMA por 10 para escalarla.
    const nmaPoints = (team.kpis.nma || 0) * 10;

    // b. Componente de Precio: Se calcula la competitividad del precio en relación a la media del mercado.
    let pricePoints = 0;
    const priceRatio = averageTuition / team.decisions.tuitionPrice;
    if (team.decisions.tuitionPrice <= averageTuition) {
      // Bonificación lineal por ser más barato o igual que la media
      pricePoints = priceRatio * 50; // Aumentado de 30 a 50
    } else {
      // Penalización exponencial por ser más caro. Se eleva al cubo.
      pricePoints = (priceRatio ** 3) * 50; // Cambiado a cúbico y aumentado a 50
    }
    
    // c. Componente de Marketing: Se calcula en base a la inversión en la campaña "R1".
    const marketingActionId = (team.decisions?.actions || []).find(id => id === 'R1');
    let marketingPoints = 0;
    if (marketingActionId) {
        const investmentInfo = allInvestments.find(inv => inv.id === 'R1');
        if (investmentInfo) {
            const cost = team.decisions.investmentCosts?.['R1'] || (investmentInfo.cost.type === 'range' ? investmentInfo.cost.value[1] : investmentInfo.cost.value as number);
            marketingPoints = cost / 1000;
        }
    }
    // Bonus de marketing por la crisis C3
    if (team.decisions.crisisResponse?.optionId === 'C3_op5') {
        marketingPoints += 10; // Bonus de 10 puntos de IAM
    }
    // Bonus de marketing por crisis C4
    if (team.decisions.crisisResponse?.optionId === 'C4_op5') {
        marketingPoints += 10;
    }

    // d. Componente de Instalaciones: Bonus fijo por la inversión 'R3'.
    const facilitiesPoints = (team.decisions?.actions || []).includes('R3') ? 5 : 0;
    
    // e. Componente de Sostenibilidad: Bonus fijo por la inversión 'R5'.
    const sustainabilityPoints = (team.decisions?.actions || []).includes('R5') ? 5 : 0;

    // f. Componente de Crisis C7 (Ciberbullying)
    let crisisC7IamEffect = 0;
    if (team.decisions.crisisResponse?.crisisId === 'C7') {
      if (team.decisions.crisisResponse.optionId === 'C7_op1') { // Minimizar
        crisisC7IamEffect = -20;
      } else if (team.decisions.crisisResponse.optionId === 'C7_op3') { // Programa anti-bullying
        crisisC7IamEffect = 10;
      }
    }

    const sanitizedNmaPoints = isNaN(nmaPoints) ? 0 : nmaPoints;
    const sanitizedPricePoints = isNaN(pricePoints) ? 0 : pricePoints;
    const sanitizedMarketingPoints = isNaN(marketingPoints) ? 0 : marketingPoints;

    const iam = sanitizedNmaPoints + sanitizedPricePoints + sanitizedMarketingPoints + facilitiesPoints + sustainabilityPoints + crisisC7IamEffect;
    const finalIam = Math.max(0, iam);

    teamIamResults[team.name] = {
        iam: finalIam,
        points: { 
          nma: sanitizedNmaPoints, 
          price: sanitizedPricePoints, 
          marketing: sanitizedMarketingPoints,
          facilities: facilitiesPoints,
          sustainability: sustainabilityPoints,
          crisis: crisisC7IamEffect,
        }
    };
    totalIamPoints += finalIam;
  }
  
  type UnroundedResult = { team: TeamState; unroundedStudents: number; };
  let unroundedResults: UnroundedResult[] = [];

  // 3. Distribuir los nuevos alumnos en base a la cuota de IAM de cada equipo.
  if (totalIamPoints > 0) {
    unroundedResults = teams.map(team => {
        const iamShare = teamIamResults[team.name].iam / totalIamPoints;
        const unroundedStudents = iamShare * NEW_STUDENTS_POOL;
        return { team, unroundedStudents };
    });
  } else {
    // Caso improbable: si ningún equipo tiene puntos IAM, los alumnos se reparten equitativamente.
    const unroundedStudentsPerTeam = NEW_STUDENTS_POOL / teams.length;
    unroundedResults = teams.map(team => ({ team, unroundedStudents: unroundedStudentsPerTeam }));
  }
  
  // Identificar el equipo con más y menos alumnos (antes de redondear)
  if (unroundedResults.length > 1) {
    unroundedResults.sort((a, b) => b.unroundedStudents - a.unroundedStudents);
  }

  const finalResults: Record<string, { iam: number; points: { nma: number; price: number; marketing: number, facilities: number, sustainability: number, crisis: number }; newStudents: number, name: string, type: 'H' | 'IA' }> = {};

  unroundedResults.forEach((result, index) => {
    let newStudents: number;
    if (unroundedResults.length > 1 && index === 0) {
      // Equipo con más alumnos: redondear hacia arriba
      newStudents = Math.ceil(result.unroundedStudents);
    } else if (unroundedResults.length > 1 && index === unroundedResults.length - 1) {
      // Equipo con menos alumnos: redondear hacia abajo
      newStudents = Math.floor(result.unroundedStudents);
    } else {
      // Resto de equipos: redondeo estándar
      newStudents = Math.round(result.unroundedStudents);
    }

    finalResults[result.team.name] = {
      ...teamIamResults[result.team.name],
      newStudents: newStudents,
      name: result.team.name,
      type: result.team.type
    };
  });

  return finalResults;
}
