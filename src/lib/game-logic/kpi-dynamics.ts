

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
  let updatedNma = currentKpis.nma;
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
  actions.forEach(actionId => {
      const investment = allInvestments.find(inv => inv.id === actionId);
      if (investment) {
          if (investment.effects.nma) updatedNma += investment.effects.nma;
          if (investment.effects.morale) updatedMorale += investment.effects.morale;
          if (investment.effects.cashInjection) cashInjection += investment.effects.cashInjection;
          if (investment.effects.personnelCostReduction) {
            personnelCostMultiplier -= investment.effects.personnelCostReduction;
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

  if (crisisId && crisisOptionId) {
    const crisis = allCrises.find(c => c.id === crisisId);
    const option = crisis?.options.find(o => o.id === crisisOptionId);

    if (option) {
        crisisFinancialImpact += option.cost; // cost is often negative
    }

    if (crisisId === 'C2') { // Pérdida de subvención
      currentPublicIncome -= 25000;
      if (crisisOptionId === 'C2_op1') loanIncome += 25000;
      else if (crisisOptionId === 'C2_op2' || crisisOptionId === 'C2_op5') currentPublicIncome += 25000;
      else if (crisisOptionId === 'C2_op3' && negotiationSuccess) crisisFinancialImpact += 15000;
    }

    if (crisisId === 'C3') { // Morosidad
        privateIncome -= 10000;
        if(crisisOptionId === 'C3_op1') privateIncome += 8000;
        else if (crisisOptionId === 'C3_op2') privateIncome += 10000;
        else if (crisisOptionId === 'C3_op3') loanIncome += 10000;
        else if (crisisOptionId === 'C3_op4') {
            crisisFinancialImpact += 10000; // Represents saving from cut activities
            updatedMorale -= 5;
        }
    }
  
    if (crisisId === 'C1') {
        if (crisisOptionId === 'C1_op1') updatedMorale += 30;
        else if (crisisOptionId === 'C1_op2') updatedMorale += 20;
        else if (crisisOptionId === 'C1_op3') updatedMorale = 40;
        else if (crisisOptionId === 'C1_op4') updatedMorale += 15;
        else if (crisisOptionId === 'C1_op5') updatedMorale -= 30;
    }
    
    if (crisisId === 'C4') {
      if (crisisOptionId === 'C4_op1') updatedMorale -= 10;
      else if (crisisOptionId === 'C4_op4') updatedMorale += 5;
    }

    if(crisisId === 'C5') {
      if (crisisOptionId === 'C5_op3') updatedMorale += 5;
      else if (crisisOptionId === 'C5_op4') updatedMorale -= 15;
      else if (crisisOptionId === 'C5_op5' && negotiationSuccess) crisisFinancialImpact += 5000;
    }

    if (crisisId === 'C6') {
        privateIncome -= 10000; // Sponsorship is a form of income
        if (crisisOptionId === 'C6_op1' && negotiationSuccess) privateIncome += 5000;
        if (crisisOptionId === 'C6_op2' || crisisOptionId === 'C6_op4') privateIncome += 10000;
        if (crisisOptionId === 'C6_op3') loanIncome += 10000;
    }

    if(crisisId === 'C7') {
      if (crisisOptionId === 'C7_op1') updatedMorale -= 5;
      else if (crisisOptionId === 'C7_op2') updatedMorale += 5;
      else if (crisisOptionId === 'C7_op5') updatedMorale -= 10;
    }
  }

  // --- NEW: Apply F3 Insurance Effect ---
  const hasInsurance = performanceHistory.some(round => round.decisions.actions.includes('F3')) || actions.includes('F3');
  if (hasInsurance && crisisFinancialImpact < 0) {
    crisisFinancialImpact *= 0.90; // Reduce the negative impact by 10%
  }


  const income = privateIncome + currentPublicIncome + loanIncome;
  let personnelCost = updatedNumTeachers * TEACHER_SALARY;

  // Apply P4 salary increase permanently
  const hasSalaryIncrease = performanceHistory.some(round => round.decisions.actions.includes('P4')) || actions.includes('P4');
  if (hasSalaryIncrease) {
    personnelCost *= 1.10; // Apply 10% permanent increase
  }

  personnelCost *= personnelCostMultiplier; // Apply reductions from investments like ERP
  
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
      if (actionId === 'P2') return sum + 7500; // Coste de contratación (primer salario)
      return sum;
  }, 0);
  
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

  const totalDecisionsCost = investmentCost + centerActionsCost;
  const totalExpenses = personnelCost + totalDecisionsCost + interestCost;
  
  console.log(`[GPS] 5b. For ${teamState.name}: investmentCost=${investmentCost}, centerActionsCost=${centerActionsCost}, crisisFinancialImpact=${crisisFinancialImpact}, interestCost=${interestCost}, totalExpenses=${totalExpenses}`);

  let updatedCash = teamState.kpis.cash + income - totalExpenses + cashInjection + crisisFinancialImpact;
  
  // 3. Calcular nuevos KPIs de Reputación y Moral
  let updatedStudentTeacherRatio = updatedNumTeachers > 0 ? updatedNumStudents / updatedNumTeachers : 0;

  // Bonificación por ratio bajo
  if (updatedStudentTeacherRatio > 0 && updatedStudentTeacherRatio < LOW_RATIO_THRESHOLD) {
    const bonusLevels = Math.floor(LOW_RATIO_THRESHOLD - updatedStudentTeacherRatio);
    updatedNma += (bonusLevels + 1) * LOW_RATIO_NMA_BONUS;
  }
  
  // Impacto de sobrecarga (PENALTY)
  if (updatedStudentTeacherRatio > OVERLOAD_RATIO) {
    updatedMorale -= OVERLOAD_MORALE_PENALTY;
    updatedNma -= OVERLOAD_NMA_PENALTY;
  }

  // --- NEW RULE: Inaction in HR ---
  // If no investment in personnel area is made, apply penalty.
  const hrInvestmentIds = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P8', 'P9', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15'];
  const hasHrInvestment = actions.some(actionId => hrInvestmentIds.includes(actionId));
  if (!hasHrInvestment) {
    updatedMorale -= 10;
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
      loanIncome: loanIncome,
      crisisImpact: crisisFinancialImpact,
  };
  
  return finalKPIs;
}
