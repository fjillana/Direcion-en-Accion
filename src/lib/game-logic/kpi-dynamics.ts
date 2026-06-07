

import type { TeamState, TeamKPIs } from "./types";
import type { TeamPerformanceData, CrisisDecision } from "@/hooks/use-games";
import { investments as allInvestments } from '@/app/teacher/catalog/investment-data';
import { crises as allCrises } from '@/app/teacher/catalog/crises-data';

const TEACHER_SALARY = 7500; // Coste trimestral por profesor
const OVERLOAD_RATIO = 26.0;
const OVERLOAD_MORALE_PENALTY = 15; // Manual: -15 puntos de moral
const OVERLOAD_NMA_PENALTY = 0.3; // Manual: -0.3 en NMA
const LOW_RATIO_THRESHOLD = 24.0;
const LOW_RATIO_NMA_BONUS = 0.2;
const PUBLIC_INCOME = 224000;
const BASE_CAPACITY = 810;


/**
 * Recalcula los KPIs de un equipo para el inicio de la siguiente ronda.
 * @param teamState - El estado actual del equipo.
 * @param newStudents - El número de nuevos alumnos captados en esta ronda.
 * @returns El nuevo estado de los KPIs del equipo.
 */
export function updateKpisForNextRound(
  teamState: TeamState,
  newStudents: number,
  performanceHistory: TeamPerformanceData[],
  negotiationSuccess?: boolean
) {
  
  const currentKpis: TeamKPIs = { ...teamState.kpis };
  const decisions = { ...teamState.decisions };

  // --- Pre-calculation state ---
  let updatedNumStudents = currentKpis.numStudents;
  let updatedNumTeachers = currentKpis.numTeachers;
  let updatedCapacity = currentKpis.capacity || BASE_CAPACITY;
  let updatedMorale = currentKpis.morale;
  
  // NMA LOGIC CHANGE: Start from the previous round's base NMA, not the final one with modifiers.
  // The 'baseNma' will be the NMA before ratio bonuses/penalties were applied.
  const previousRoundPerformance = performanceHistory.length > 0 ? performanceHistory[performanceHistory.length - 1] : null;
  let baseNma = previousRoundPerformance ? previousRoundPerformance.kpis.baseNma || previousRoundPerformance.kpis.nma : currentKpis.nma;
  let updatedNma = baseNma; // Start with the base NMA
  
  let cashInjection = 0;
  let personnelCostMultiplier = 1.0;
  let crisisFinancialImpact = 0;


  const actions = decisions.actions || [];

  // --- Apply static decisions effects ---
  if (actions.includes('P2')) { // Contratar
    updatedNumTeachers += 1;
    updatedMorale += 15; // Direct effect from hiring
  }
  if (actions.includes('P7')) { // Despedir
    updatedNumTeachers -= 1;
    updatedMorale -= 25; // Direct effect from firing
  }
  if (actions.includes('F5')) { // Ampliación Aulas
    updatedCapacity += 50;
  }
  
  // --- Apply dynamic investment effects ---
  actions.forEach((actionId: string) => {
      const investment = allInvestments.find(inv => inv.id === actionId);
      if (investment) {
          if (investment.effects.nma) updatedNma += investment.effects.nma;
          if (investment.effects.morale) updatedMorale += investment.effects.morale;
          if (investment.effects.cashInjection) cashInjection += investment.effects.cashInjection;
          if (investment.effects.personnelCostReduction) {
            personnelCostMultiplier -= investment.effects.personnelCostReduction;
          }
          // NEW: Proportional capacity increase for R3
          if (investment.id === 'R3') {
            const cost = teamState.decisions.investmentCosts?.['R3'] || 0;
            const [minCost, maxCost] = investment.cost.value as [number, number];
            const maxCapacityBonus = 100; // Max 100 new places
            if (cost > 0 && maxCost > minCost) {
                const ratio = (cost - minCost) / (maxCost - minCost);
                const capacityBonus = Math.round(ratio * maxCapacityBonus);
                updatedCapacity += capacityBonus;
            } else if (cost >= maxCost) {
                updatedCapacity += maxCapacityBonus;
            }
          }
      }
  });


  // Los nuevos alumnos se añaden
  const availableSpots = updatedCapacity - updatedNumStudents;
  const admittedStudents = Math.min(newStudents, availableSpots);
  updatedNumStudents += admittedStudents;
  

  // 2. Calcular Ingresos y Costes
  let currentPublicIncome = PUBLIC_INCOME;
  let loanIncome = 0;
  let privateIncome = updatedNumStudents * decisions.tuitionPrice;

  // --- Crisis Effects on Income and Morale---
  const crisisId = decisions.crisisResponse?.crisisId;
  const crisisOptionId = decisions.crisisResponse?.optionId;
  
  // Set a default outcome description if none is set by specific logic below
  if (teamState.decisions.crisisResponse) {
    if(!teamState.decisions.crisisResponse.outcomeDescription) {
        const costText = (decisions.crisisResponse?.cost || 0) < 0 ? `${Math.abs(decisions.crisisResponse?.cost || 0).toLocaleString('es-ES')} CC de coste` : `${(decisions.crisisResponse?.cost || 0).toLocaleString('es-ES')} CC de ingreso`;
        teamState.decisions.crisisResponse.outcomeDescription = `La decisión ha tenido un impacto financiero de ${costText}. Revisa el reporte para ver otras consecuencias.`;
    }
  }

  if (crisisId && crisisOptionId) {
    const crisis = allCrises.find(c => c.id === crisisId);
    const option = crisis?.options.find(o => o.id === crisisOptionId);

    if (option) {
        crisisFinancialImpact += option.cost; // cost is often negative
    }

    if (crisisId === 'C1') {
      if (crisisOptionId === 'C1_op1') {
        updatedMorale += 30;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = `Se han aceptado todas las demandas. La moral sube +30 puntos y la huelga termina, pero tiene un coste de 25.000 CC. Ganas +5 XP Personal y pierdes -5 XP Finanzas.`;
      } else if (crisisOptionId === 'C1_op2') {
        updatedMorale += 20;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = `Se ha negociado un acuerdo. La moral sube +20 puntos y la huelga termina. El coste es de 15.000 CC. Ganas +3 XP Personal y pierdes -3 XP Finanzas.`;
      } else if (crisisOptionId === 'C1_op3') {
        updatedMorale = 40;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = `Se ha ignorado la huelga. La moral se desploma y se fija en 40. Esta decisión conlleva una penalización de -15 XP en todas las áreas (Finanzas, Reputación y Moral).`;
      } else if (crisisOptionId === 'C1_op4') {
        updatedMorale += 15;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = `Los mediadores han resuelto el conflicto. La moral sube +15 puntos y la huelga termina con un coste de 8.000 CC. Ganas +2 XP Personal.`;
      } else if (crisisOptionId === 'C1_op5') {
        updatedMorale -= 30;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = `Se ha despedido a los líderes. La moral se hunde (-30 puntos) y daña la reputación (-10 XP), aunque se considera una medida de ahorro (+5 XP Finanzas). Coste de 10.000 CC.`;
      }
    }


    if (crisisId === 'C2') { // Pérdida de subvención
      currentPublicIncome -= 25000;
      if (crisisOptionId === 'C2_op1') {
        loanIncome += 25000;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Has solicitado un préstamo de emergencia para cubrir la pérdida de 25.000 CC. La tesorería se estabiliza, pero esta deuda genera una penalización directa de -20 puntos a tu PEB de Finanzas.";
      }
      else if (crisisOptionId === 'C2_op2') {
        currentPublicIncome += 25000;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Has evitado la pérdida de la subvención, pero para ello has tenido que recortar inversiones ya planificadas, lo que daña tu imagen. Sufres una penalización de -15 XP de Reputación.";
      }
      else if (crisisOptionId === 'C2_op5') {
        currentPublicIncome += 25000;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Retrasar pagos a proveedores ha generado liquidez inmediata (+8 XP Finanzas), pero ha dañado tu fiabilidad y reputación en el mercado (-8 XP Reputación).";
      }
      else if (crisisOptionId === 'C2_op3') {
          if (negotiationSuccess) {
            crisisFinancialImpact += 15000;
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = `¡Éxito! Tras un gasto de 3.000 CC en gestiones, la negociación con la consejería ha permitido recuperar 15.000 CC de la subvención. Ganas +5 XP Reputación por tu habilidad diplomática.`;
          } else {
             if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = `La negociación fracasó. A pesar del gasto de 3.000 CC, no se recuperó parte de la subvención, lo que resulta en una penalización de -5 XP Finanzas.`;
          }
      } else if (crisisOptionId === 'C2_op4') {
          if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Has decidido asumir la pérdida de 25.000 CC directamente contra la tesorería del centro. Es un golpe duro a la liquidez, pero no genera penalizaciones adicionales en XP ni PEB.";
      }
    }

    if (crisisId === 'C3') { // Morosidad
        privateIncome -= 10000;
        if(crisisOptionId === 'C3_op1') {
            privateIncome += 8000;
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Ofrecer un plan de pagos ha funcionado. Se recupera el 80% de la deuda (8.000 CC), ganas +2 XP Reputación por la flexibilidad, pero pierdes -2 XP Finanzas por el coste de gestión.";
        }
        else if (crisisOptionId === 'C3_op2') {
            privateIncome += 10000;
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Subir la matrícula al resto de familias compensa el déficit, pero genera una mala imagen. Ganas +5 XP Finanzas pero pierdes -5 XP Reputación.";
        }
        else if (crisisOptionId === 'C3_op3') {
            loanIncome += 10000;
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Has solicitado un préstamo para cubrir el déficit de 10.000 CC. Aunque soluciona la liquidez a corto plazo, la deuda genera una fuerte penalización directa de -20 XP en Finanzas.";
        }
        else if (crisisOptionId === 'C3_op4') {
            crisisFinancialImpact += 10000; 
            updatedMorale -= 5;
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Recortar actividades extraescolares ha compensado el déficit financiero (+3 XP Finanzas), but it has worsened the center's offer (-4 XP Reputation) and affected staff morale (-5 points).";
        }
         else if (crisisOptionId === 'C3_op5') {
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Invertir en captar nuevos alumnos ha ayudado a paliar el déficit (+2 XP Finanzas) y ha mejorado la imagen y el atractivo del centro (+3 XP Reputación, +10 IAM).";
        }
    }
  
    
    if (crisisId === 'C4') {
      if (crisisOptionId === 'C4_op1') {
        updatedMorale -= 10;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Ignorar el incidente ha sido una mala decisión. La falta de transparencia ha provocado una caída de 10 puntos en la moral y una penalización de -5 XP en Reputación.";
      } else if (crisisOptionId === 'C4_op2') {
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Afrontar el problema con honestidad ha mitigado el daño. La reputación solo sufre una pequeña penalización (-2 XP), y la transparencia ha sido valorada por el personal (+2 XP Personal).";
      } else if (crisisOptionId === 'C4_op4') {
        updatedMorale += 5;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Realizar mejoras inmediatas ha sido una respuesta proactiva. La reputación mejora (+5 XP) y la moral del personal sube 5 puntos, aunque ha supuesto un coste de 20.000 CC.";
      } else if (crisisOptionId === 'C4_op3') {
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Contratar un seguro adicional es una medida financiera prudente (+5 XP Finanzas) que protege al centro, aunque no aborda la causa raíz del problema de reputación.";
      } else if (crisisOptionId === 'C4_op5') {
          if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Lanzar una campaña positiva ha ayudado a contrarrestar la noticia negativa, mejorando la reputación (+3 XP) y el atractivo del centro (+10 IAM) a un coste de 8.000 CC.";
      }
    }

    if(crisisId === 'C5') {
      if (crisisOptionId === 'C5_op1') {
          if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Suspender toda actividad ha generado pérdidas económicas (-5 XP Finanzas) y ha dañado la imagen de continuidad del centro (-3 XP Reputación).";
      } else if (crisisOptionId === 'C5_op2') {
          if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "La inversión en TIC ha permitido continuar con las clases online, mejorando la reputación (+5 XP) y la competencia del personal (+3 XP) a un coste de 10.000 CC.";
      } else if (crisisOptionId === 'C5_op3') {
        updatedMorale += 5;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Contratar personal sanitario ha sido bien recibido, mejorando la moral (+5) y la sensación de seguridad (+3 XP Personal) con un coste de 5.000 CC.";
      } else if (crisisOptionId === 'C5_op4') {
        updatedMorale -= 15;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Ignorar las recomendaciones ha sido una decisión muy arriesgada, causando un grave daño a la reputación (-10 XP) y un desplome de la moral (-15 puntos).";
      } else if (crisisOptionId === 'C5_op5') {
          if (negotiationSuccess) {
            crisisFinancialImpact += 5000;
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = '¡Éxito! La administración aportó 5.000 CC para equipos, mejorando la reputación (+2 XP) con un bajo coste administrativo (-2 XP Finanzas).';
          } else {
             if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = 'La negociación fracasó. No se recibió ayuda, resultando en un coste administrativo inútil (-2 XP Finanzas).';
          }
      }
    }

    if (crisisId === 'C6') { // Retraso patrocinio
        crisisFinancialImpact -= 10000; // The loss always happens first
        if (crisisOptionId === 'C6_op1') {
            if (negotiationSuccess) {
                crisisFinancialImpact += 5000; // Recover half
                if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = '¡Éxito! Se ha recuperado la mitad del patrocinio (5.000 CC), resultando en un balance neto de +2 XP Reputación y -2 XP Finanzas.';
            } else {
                 if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = 'La renegociación fracasó. No se recuperó el pago, lo que ha generado un coste neto y penalizaciones de XP.';
            }
        } else if (crisisOptionId === 'C6_op2') {
            crisisFinancialImpact += 10000; // Recover the full 10k
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Buscar otro patrocinador ha sido un éxito. A pesar del coste de 4.000 CC, se recuperaron los 10.000 CC íntegros, generando un beneficio de XP (+4 Finanzas, +2 Reputación).";
        } else if (crisisOptionId === 'C6_op3') {
            loanIncome += 10000; // Take a loan to cover the loss
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "El préstamo cubre el déficit, pero la deuda resultante reduce el PEB de Finanzas a la mitad y generará costes de intereses en el futuro.";
        } else if (crisisOptionId === 'C6_op4') {
            crisisFinancialImpact += 10000; // Cancel out the loss by saving on marketing
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Recortar gastos de marketing ha compensado la pérdida, pero a costa de la visibilidad del centro (-5 XP Reputación), aunque mejora el ratio financiero (+4 XP Finanzas).";
        } else if (crisisOptionId === 'C6_op5') {
            // The -10k impact remains
            if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Asumir la pérdida de 10.000 CC impacta en la tesorería (-2 XP Finanzas), pero mantiene la reputación intacta al no tomar medidas drásticas.";
        }
    }

    if(crisisId === 'C7') {
      if (crisisOptionId === 'C7_op1') {
        updatedMorale -= 5;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Minimizar el caso ha dañado gravemente la reputación (-8 XP) y la moral del personal (-5 puntos). Además, afectará negativamente a la captación de alumnos.";
      } else if (crisisOptionId === 'C7_op2') {
        updatedMorale += 5;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "La investigación interna ha sido un primer paso correcto. Aunque la reputación sufre un golpe inicial (-4 XP), la moral del personal mejora 5 puntos por la gestión proactiva (+3 XP Personal).";
      } else if (crisisOptionId === 'C7_op3') {
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Implementar un programa anti-bullying es una gran medida preventiva. Mejora la reputación a largo plazo (+5 XP), la moral (+3 XP Personal) y el atractivo del centro (+10 IAM).";
      } else if (crisisOptionId === 'C7_op4') {
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Un comunicado público honesto ha limitado los daños. La reputación sufre un impacto menor (-2 XP) y la transparencia es valorada por el personal (+2 XP Personal).";
      } else if (crisisOptionId === 'C7_op5') {
        updatedMorale -= 10;
        if (decisions.crisisResponse) decisions.crisisResponse.outcomeDescription = "Demandear a los denunciantes ha sido una estrategia muy agresiva y mal recibida. La reputación se desploma (-10 XP) y la moral cae 10 puntos, aunque la IA financiera lo valora como un ahorro (+5 XP Finanzas).";
      }
    }
  }

  // --- NEW: Apply F3 Insurance Effect ---
  const hasInsurance = performanceHistory.some(round => round.decisions.actions.includes('F3')) || actions.includes('F3');
  if (hasInsurance && crisisFinancialImpact < 0) {
    const reduction = Math.abs(crisisFinancialImpact * 0.10);
    crisisFinancialImpact += reduction; // Reduce el impacto negativo (haciéndolo menos negativo)
    if(decisions.crisisResponse) {
        decisions.crisisResponse.outcomeDescription = (decisions.crisisResponse.outcomeDescription || '') + ` Gracias al seguro, el impacto negativo se redujo en ${reduction.toLocaleString('es-ES')} CC.`;
    }
  }

  const income = privateIncome + currentPublicIncome + loanIncome + cashInjection + (crisisFinancialImpact > 0 ? crisisFinancialImpact : 0);
  let personnelCost = updatedNumTeachers * TEACHER_SALARY;

  // Apply P4 salary increase permanently
  const hasSalaryIncrease = performanceHistory.some(round => round.decisions.actions.includes('P4')) || actions.includes('P4');
  if (hasSalaryIncrease) {
    personnelCost *= 1.10; // Apply 10% permanent increase
  }

  personnelCost *= personnelCostMultiplier; // Apply reductions from investments like ERP
  
  const totalDecisionsCost = actions.reduce((sum: number, actionId: string) => {
    // F4 (Negociación Agresiva) is cash injection, not a cost.
    if (actionId === 'F4') return sum;
    // Poaching only costs if successful
    if (actionId === 'P3' && teamState.decisions.poachingSuccess !== true) return sum;

    const investmentInfo = allInvestments.find(inv => inv.id === actionId);
    if (investmentInfo) {
        if (investmentInfo.cost.type === 'fixed') {
            return sum + (investmentInfo.cost.value as number);
        }
        if (investmentInfo.cost.type === 'range') {
            return sum + (teamState.decisions.investmentCosts?.[actionId] || ((investmentInfo.cost.value as [number, number])[1]));
        }
    }

    const centerActionsCostMap: Record<string, number> = {
      'P2': 7500, // Contratar
      'P7': 7500, // Despedir
      'F5': 50000, // Ampliar
    };

    if (actionId in centerActionsCostMap) {
      return sum + centerActionsCostMap[actionId];
    }
    
    return sum;
  }, 0);
  
  // Calculate interest cost and principal repayments if loans were taken previously
  let interestCost = 0;
  let loanRepayments = 0;
  const currentRound = performanceHistory.length;

  performanceHistory.forEach(pastRound => {
    const pastOptionId = pastRound.decisions.crisisResponse?.optionId;
    const pastRoundNum = pastRound.round;
    const roundsElapsed = currentRound - pastRoundNum;

    if (pastOptionId === 'C2_op1') {
      const principal = 25000;
      if (roundsElapsed === 1 || roundsElapsed === 2) {
        interestCost += principal * 0.05; // 5% interest
      }
      if (roundsElapsed === 2) {
        loanRepayments += principal;
      }
    }
    else if (pastOptionId === 'C3_op3') {
      const principal = 10000;
      if (roundsElapsed === 1 || roundsElapsed === 2) {
        interestCost += principal * 0.05; // 5% interest
      }
      if (roundsElapsed === 2) {
        loanRepayments += principal;
      }
    }
    else if (pastOptionId === 'C6_op3') {
      const principal = 10000;
      if (roundsElapsed === 1 || roundsElapsed === 2) {
        interestCost += principal * 0.05; // 5% interest
      }
      if (roundsElapsed === 2) {
        loanRepayments += principal;
      }
    }
  });
  
  const totalExpenses = personnelCost + totalDecisionsCost + interestCost + (crisisFinancialImpact < 0 ? Math.abs(crisisFinancialImpact) : 0) + loanRepayments;
  
  let updatedCash = teamState.kpis.cash + income - totalExpenses;
  
  // 3. Calcular nuevos KPIs de Reputación y Moral
  let updatedStudentTeacherRatio = updatedNumTeachers > 0 ? updatedNumStudents / updatedNumTeachers : 0;
  let finalNma = updatedNma;

  // Bonificación por ratio bajo
  if (updatedStudentTeacherRatio > 0 && updatedStudentTeacherRatio < LOW_RATIO_THRESHOLD) {
    const bonusLevels = Math.floor(LOW_RATIO_THRESHOLD - updatedStudentTeacherRatio);
    finalNma += (bonusLevels + 1) * LOW_RATIO_NMA_BONUS;
  }
  
  // Impacto de sobrecarga (PENALTY)
  if (updatedStudentTeacherRatio > OVERLOAD_RATIO) {
    updatedMorale -= OVERLOAD_MORALE_PENALTY;
    finalNma -= OVERLOAD_NMA_PENALTY;
  }

  // --- NEW RULE: Inaction in HR ---
  // If no investment in personnel area is made, apply penalty.
  const hrInvestmentIds = ['P1', 'P2', 'P3', 'P4', 'P5'];
  const hasHrInvestment = actions.some((actionId: string) => hrInvestmentIds.includes(actionId));
  if (!hasHrInvestment && decisions.crisisResponse?.crisisId !== 'C1') {
    updatedMorale -= 10;
  }
  
  // Limitar valores para que no se salgan de rangos lógicos
  finalNma = Math.max(0, Math.min(10, finalNma));
  updatedMorale = Math.max(0, Math.min(100, updatedMorale));

  const finalKPIs: TeamKPIs = {
      ...currentKpis,
      cash: updatedCash,
      personnelCost: personnelCost,
      income: income,
      numStudents: updatedNumStudents,
      numTeachers: updatedNumTeachers,
      capacity: updatedCapacity,
      baseNma: updatedNma, // Store the base NMA before ratio modifiers
      nma: finalNma, // Store the final NMA with all modifiers
      morale: updatedMorale,
      studentTeacherRatio: updatedStudentTeacherRatio,
      privateIncome,
      publicIncome: currentPublicIncome,
      loanInterest: interestCost,
      loanIncome: loanIncome,
      loanRepayment: loanRepayments,
      crisisImpact: crisisFinancialImpact,
      cashInjection: cashInjection,
  };
  
  return finalKPIs;
}
