

import type { TeamState, TeamKPIs } from "./types";
import type { TeamPerformanceData } from "@/hooks/use-games";
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

  console.log(`[GPS] 5a. Updating KPIs for ${teamState.name}. Decisions received:`, decisions);

  // --- Pre-calculation state ---
  let updatedNumStudents = currentKpis.numStudents;
  let updatedNumTeachers = currentKpis.numTeachers;
  let updatedCapacity = currentKpis.capacity || BASE_CAPACITY;
  let updatedMorale = currentKpis.morale;

  const actions = decisions.actions || [];

  // --- Apply decisions ---
  if (actions.includes('P2')) { // Contratar
    updatedNumTeachers += 1;
  }
  if (actions.includes('P7')) { // Despedir
    updatedNumTeachers -= 1;
  }
  // Poaching is handled in round-simulation as it affects other teams
  
  if (actions.includes('R3')) { // Mejora de instalaciones (aumento de NMA y Moral)
    currentKpis.nma += 0.3;
    updatedMorale += 10;
  }
  if (actions.includes('R4')) { // Desarrollo curricular innovador
      currentKpis.nma += 0.3;
  }
  if (actions.includes('P5')) { // Actividades sociales
    updatedMorale += 10;
  }
  
  if (actions.includes('F5')) { // Ampliación Aulas
    updatedCapacity += 50;
  }

  // Los nuevos alumnos se añaden
  const availableSpots = updatedCapacity - updatedNumStudents;
  const admittedStudents = Math.min(newStudents, availableSpots);
  updatedNumStudents += admittedStudents;
  

  // 2. Calcular Ingresos y Costes
  let currentPublicIncome = PUBLIC_INCOME;
  let loanIncome = 0;
  let recoveredSubsidy = 0;
  let privateIncome = updatedNumStudents * decisions.tuitionPrice;
  let otherIncome = 0; // For sponsorships etc.

  // --- Crisis Effects on Income and Morale---
  const crisisId = decisions.crisisResponse?.crisisId;
  const crisisOption = decisions.crisisResponse?.optionId;

  if (crisisId === 'C2') { // Pérdida de subvención
      if (crisisOption === 'C2_op1') { // Loan
          currentPublicIncome -= 25000;
          loanIncome = 25000;
      } else if (crisisOption === 'C2_op2' || crisisOption === 'C2_op5') { // Cut investments or Delay payments
          // Subsidy loss is avoided. No change to currentPublicIncome.
      } else if (crisisOption === 'C2_op3') { // Negotiate
          currentPublicIncome -= 25000; // Subsidy is lost initially.
          if (negotiationSuccess) {
              recoveredSubsidy = 15000; // 15k is recovered on success.
          }
      } else { // Default effect for option 4 and any other
          currentPublicIncome -= 25000;
      }
  }

  if (crisisId === 'C3') { // Morosidad en matrículas
    privateIncome -= 10000; // Se aplica el déficit inicial de la crisis.
    if(crisisOption === 'C3_op1') { // Ofrecer plan de pagos
      privateIncome += 8000; // Recupera el 80%
    } else if (crisisOption === 'C3_op2') { // Subir matrícula
        privateIncome += 10000; // Compensa el déficit con ingresos extra
    } else if (crisisOption === 'C3_op3') { // Solicitar préstamo
        loanIncome += 10000;
    } else if (crisisOption === 'C3_op4') { // Recortar actividades
        privateIncome += 10000; // Reintegra el coste de las actividades, compensando el déficit.
        updatedMorale -= 5; // Penalización de moral
    }
  }
  
  if (crisisId === 'C4') {
    if (crisisOption === 'C4_op1') { // Ignorar
      updatedMorale -= 10;
    } else if (crisisOption === 'C4_op4') { // Mejoras
      updatedMorale += 5;
    }
  }

  if(crisisId === 'C5') {
    if (crisisOption === 'C5_op3') { // Contratar personal sanitario
      updatedMorale += 5;
    } else if (crisisOption === 'C5_op4') { // Ignorar recomendaciones
      updatedMorale -= 15;
    } else if (crisisOption === 'C5_op5') {
      if (negotiationSuccess) {
          // The 5k is a cash injection, handled here as "recoveredSubsidy" for simplicity
          recoveredSubsidy += 5000;
      }
    }
  }

  if (crisisId === 'C6') { // Retraso en patrocinio
    otherIncome -= 10000; // Apply base deficit
    if (crisisOption === 'C6_op1' && negotiationSuccess) {
        otherIncome += 5000; // Recover 5k
    } else if (crisisOption === 'C6_op2') {
        otherIncome += 10000; // Recover full amount
    } else if (crisisOption === 'C6_op3') {
        loanIncome += 10000; // Loan to cover the deficit
    } else if (crisisOption === 'C6_op4') {
        otherIncome += 10000; // Recutting marketing avoids the loss
    }
  }

  if(crisisId === 'C7') { // Ciberbullying
      if (crisisOption === 'C7_op1') { // Minimizar caso
          updatedMorale -= 5;
      } else if (crisisOption === 'C7_op2') { // Investigar
          updatedMorale += 5;
      }
  }

  const income = privateIncome + currentPublicIncome + loanIncome + recoveredSubsidy + otherIncome;
  let personnelCost = updatedNumTeachers * TEACHER_SALARY;

  const hasErp = performanceHistory.some(round => round.decisions.actions.includes('F1')) || actions.includes('F1');
  if (hasErp) {
    personnelCost *= 0.98; // Apply 2% reduction
  }

  // Apply P4 salary increase permanently
  const hasSalaryIncrease = performanceHistory.some(round => round.decisions.actions.includes('P4')) || actions.includes('P4');
  if (hasSalaryIncrease) {
    personnelCost *= 1.10; // Apply 10% permanent increase
  }
  
  const investmentCost = actions.reduce((sum, actionId) => {
      const investmentInfo = allInvestments.find(inv => inv.id === actionId);
      if (!investmentInfo) return sum;

      if(investmentInfo.cost.type === 'fixed') {
        return sum + (investmentInfo.cost.value as number);
      }
      if(investmentInfo.cost.type === 'range') {
        return sum + (teamState.decisions.investmentCosts?.[actionId] || (investmentInfo.cost.value[1]));
      }
      return sum;
  }, 0);
  
  const centerActionsCost = actions.reduce((sum, actionId) => {
      if (actionId === 'F5') return sum + 50000;
      if (actionId === 'P7') return sum + 7500; // Coste de despido
      return sum;
  }, 0);
  
  // Calculate crisis cost with potential insurance reduction
  let crisisCost = 0;
  const hasInsurance = performanceHistory.some(round => round.decisions.actions.includes('F3')) || actions.includes('F3');
  if (decisions.crisisResponse && decisions.crisisResponse.cost) {
    crisisCost = decisions.crisisResponse.cost;
    if (hasInsurance && crisisCost < 0) {
      crisisCost *= 0.9; // Apply 10% reduction to negative costs
    }
  }
  
  if (crisisOption === 'C3_op5') { // Coste extra de la opción de marketing de C3
    crisisCost -= 10000;
  }
  if (crisisOption === 'C4_op3') {
    crisisCost -= 10000;
  }
  if (crisisOption === 'C4_op4') {
    crisisCost -= 20000;
  }
  if (crisisOption === 'C4_op5') {
    crisisCost -= 8000;
  }
  if (crisisOption === 'C6_op2') {
    crisisCost -= 4000;
  }
  if (crisisOption === 'C7_op3') {
    crisisCost -= 5000;
  }

  // Calculate interest cost if loan was taken previously
  let interestCost = 0;
  const hasC2Loan = performanceHistory.some(p => p.decisions.crisisResponse?.optionId === 'C2_op1');
  const hasC3Loan = performanceHistory.some(p => p.decisions.crisisResponse?.optionId === 'C3_op3');
  const hasC6Loan = performanceHistory.some(p => p.decisions.crisisResponse?.optionId === 'C6_op3') || decisions.crisisResponse?.optionId === 'C6_op3';

  if (hasC2Loan) {
    interestCost += 25000 * 0.10; // 10% interest on 25k loan
  }
  if (hasC3Loan) {
    interestCost += 10000 * 0.10; // 10% interest on 10k loan
  }
  if (hasC6Loan) {
    interestCost += 10000 * 0.10; // 10% interest on 10k loan for C6
  }


  const totalDecisionsCost = investmentCost + centerActionsCost + Math.abs(crisisCost) + interestCost;
  const totalExpenses = personnelCost + totalDecisionsCost;
  
  console.log(`[GPS] 5b. For ${teamState.name}: investmentCost=${investmentCost}, centerActionsCost=${centerActionsCost}, crisisCost=${crisisCost}, interestCost=${interestCost}, totalExpenses=${totalExpenses}`);

  let updatedCash = teamState.kpis.cash + income - totalExpenses;
  
  // Apply F4 cash injection
  if(actions.includes('F4')) {
    updatedCash += 50000;
  }

  // 3. Calcular nuevos KPIs de Reputación y Moral
  let updatedNma = currentKpis.nma;
  
  let updatedStudentTeacherRatio = updatedNumTeachers > 0 ? updatedNumStudents / updatedNumTeachers : 0;

  // Impacto de inversiones
  if (actions.includes('R2')) { // Inversión en TIC
      updatedNma += 0.2;
      updatedMorale += 5;
  }
  
  if (actions.includes('P1')) { // Formación docente
      updatedNma += 0.1;
      updatedMorale += 10;
  }
  if (actions.includes('R4')) { // Desarrollo curricular
      updatedNma += 0.3;
  }
  if (actions.includes('P5')) { // Actividades sociales
    updatedMorale += 10;
  }

  // --- Crisis C1 Effects ---
  if (decisions.crisisResponse?.crisisId === 'C1') {
    if (decisions.crisisResponse.optionId === 'C1_op1') {
      updatedMorale += 30;
    } else if (decisions.crisisResponse.optionId === 'C1_op2') {
      updatedMorale += 20;
    } else if (decisions.crisisResponse.optionId === 'C1_op3') {
      updatedMorale = 40;
    } else if (decisions.crisisResponse.optionId === 'C1_op4') {
        updatedMorale += 15;
    } else if (decisions.crisisResponse.optionId === 'C1_op5') {
        updatedMorale -= 30;
    }
  }

  // Bonificación por ratio bajo
  if (updatedStudentTeacherRatio > 0 && updatedStudentTeacherRatio < LOW_RATIO_THRESHOLD) {
    const bonusLevels = Math.floor(LOW_RATIO_THRESHOLD - updatedStudentTeacherRatio);
    updatedNma += (bonusLevels + 1) * LOW_RATIO_NMA_BONUS;
  }
  
  // Impacto de acciones de personal
  if(actions.includes('P7')) { // Despedir
      updatedMorale -= 25;
  }
  if(actions.includes('P2')) { // Contratar
      updatedMorale += 15;
  }
  // Poaching morale effects are handled in round simulation

  // Impacto de sobrecarga (PENALTY)
  if (updatedStudentTeacherRatio > OVERLOAD_RATIO) {
    updatedMorale -= OVERLOAD_MORALE_PENALTY;
    updatedNma -= OVERLOAD_NMA_PENALTY;
  }
  
  // Limitar valores para que no se salgan de rangos lógicos
  updatedNma = Math.max(0, Math.min(10, updatedNma));
  updatedMorale = Math.max(0, Math.min(100, updatedMorale));

  const finalKPIs: TeamKPIs = {
      ...currentKpis,
      cash: updatedCash,
      personnelCost: personnelCost,
      income: income,
      numStudents: updatedNumStudents,
      numTeachers: updatedNumTeachers,
      capacity: updatedCapacity,
      nma: updatedNma,
      morale: updatedMorale,
      studentTeacherRatio: updatedStudentTeacherRatio,
      privateIncome,
      publicIncome: currentPublicIncome,
      loanInterest: interestCost,
      loanIncome: loanIncome
  };
  
  return finalKPIs;
}
