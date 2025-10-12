

import type { TeamState, TeamKPIs } from "./types";
import { investments as allInvestments } from '@/app/teacher/catalog/investment-data';

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
export function updateKpisForNextRound(teamState: TeamState, newStudents: number) {
  
  const currentKpis: TeamKPIs = { ...teamState.kpis };
  const decisions = { ...teamState.decisions };

  console.log(`[GPS] 5a. Updating KPIs for ${teamState.name}. Decisions received:`, decisions);

  // --- Pre-calculation state ---
  let updatedNumStudents = currentKpis.numStudents;
  let updatedNumTeachers = currentKpis.numTeachers;
  let updatedCapacity = currentKpis.capacity || BASE_CAPACITY;

  const actions = decisions.actions || [];

  // --- Apply decisions ---
  if (actions.includes('P2')) { // Contratar
    updatedNumTeachers += 1;
  }
  if (actions.includes('P7')) { // Despedir
    updatedNumTeachers -= 1;
  }
  if (actions.includes('F5')) { // Ampliación Aulas
    updatedCapacity += 50;
  }

  // Los nuevos alumnos se añaden
  const availableSpots = updatedCapacity - updatedNumStudents;
  const admittedStudents = Math.min(newStudents, availableSpots);
  updatedNumStudents += admittedStudents;
  

  // 2. Calcular Ingresos y Costes
  const privateIncome = updatedNumStudents * decisions.tuitionPrice;
  const income = privateIncome + PUBLIC_INCOME;
  const personnelCost = updatedNumTeachers * TEACHER_SALARY;
  
  const investmentCost = actions.reduce((sum, actionId) => {
      const investmentInfo = allInvestments.find(inv => inv.id === actionId);
      if (!investmentInfo) return sum;

      if(investmentInfo.cost.type === 'fixed') {
        return sum + (investmentInfo.cost.value as number);
      }
      if(investmentInfo.cost.type === 'range') {
        // For now, assume max cost for range investments made by AI.
        // For humans, a slider would set the specific cost. This needs to be stored in the decision object.
        return sum + (investmentInfo.cost.value[1]);
      }
      return sum;
  }, 0);
  
  const centerActionsCost = actions.reduce((sum, actionId) => {
      if (actionId === 'F5') return sum + 50000;
      if (actionId === 'P7') return sum + 7500; // Coste de despido
      return sum;
  }, 0);
  
  const totalDecisionsCost = investmentCost + centerActionsCost;
  const totalExpenses = personnelCost + totalDecisionsCost;
  
  console.log(`[GPS] 5b. For ${teamState.name}: investmentCost=${investmentCost}, centerActionsCost=${centerActionsCost}, totalExpenses=${totalExpenses}`);

  const cashAtStartOfRound = teamState.kpis.cash;
  const updatedCash = cashAtStartOfRound + income - totalExpenses;

  // 3. Calcular nuevos KPIs de Reputación y Moral
  let updatedNma = currentKpis.nma;
  let updatedMorale = currentKpis.morale;
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
      publicIncome: PUBLIC_INCOME
  };
  
  return finalKPIs;
}
