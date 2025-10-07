

import type { TeamState } from "./types";

const TEACHER_SALARY = 7500; // Coste trimestral por profesor
const OVERLOAD_RATIO = 26.0;
const OVERLOAD_MORALE_PENALTY = 15; // Manual: -15 puntos de moral
const OVERLOAD_NMA_PENALTY = 0.3; // Manual: -0.3 en NMA
const LOW_RATIO_THRESHOLD = 24.0;
const LOW_RATIO_NMA_BONUS = 0.2;
const PUBLIC_INCOME = 224000;
const CAPACITY = 810;


/**
 * Recalcula los KPIs de un equipo para el inicio de la siguiente ronda.
 * @param teamState - El estado actual del equipo.
 * @param newStudents - El número de nuevos alumnos captados en esta ronda.
 * @returns El nuevo estado de los KPIs del equipo.
 */
export function updateKpisForNextRound(teamState: TeamState, newStudents: number) {
  console.log(`--- DEBUG: [updateKpisForNextRound] START for team ${teamState.name} ---`);
  
  const currentKpis = { ...teamState.kpis };
  const decisions = { ...teamState.decisions };

  console.log('Initial KPIs:', JSON.parse(JSON.stringify(currentKpis)));
  console.log('Decisions received:', JSON.parse(JSON.stringify(decisions)));


  // --- Pre-calculation state ---
  let updatedNumStudents = currentKpis.numStudents;
  let updatedNumTeachers = currentKpis.numTeachers;

  // --- Apply decisions ---
  if (decisions.selectedCenterActions.includes('P2')) { // Contratar
    updatedNumTeachers += 1;
  }
  if (decisions.selectedCenterActions.includes('P7')) { // Despedir
    updatedNumTeachers -= 1;
  }

  // Los nuevos alumnos se añaden
  const availableSpots = CAPACITY - updatedNumStudents;
  const admittedStudents = Math.min(newStudents, availableSpots);
  updatedNumStudents += admittedStudents;
  

  // 2. Calcular Ingresos y Costes
  const privateIncome = updatedNumStudents * decisions.tuitionPrice;
  const income = privateIncome + PUBLIC_INCOME;
  const personnelCost = updatedNumTeachers * TEACHER_SALARY;
  const investmentCost = (decisions.investments || []).reduce((sum, inv) => sum + inv.cost, 0);
  
  const centerActionsCost = decisions.selectedCenterActions.reduce((sum, actionId) => {
      if (actionId === 'F5') return sum + 50000;
      if (actionId === 'P7') return sum + 7500; // Coste de despido
      // Note: P2 (hiring) cost is part of the recurring personnelCost, not a one-time investment here.
      if (actionId === 'P2') return sum + 7500; // Hiring cost is also a one-time cost
      return sum;
  }, 0);
  
  const totalExpenses = personnelCost + investmentCost + centerActionsCost;
  
  console.log('Calculated investmentCost:', investmentCost);
  console.log('Calculated centerActionsCost:', centerActionsCost);
  console.log('Calculated totalExpenses:', totalExpenses);


  // En Ronda 0, el cash inicial es el de la partida. En las demás, es el de la ronda anterior.
  const cashAtStartOfRound = teamState.kpis.cash;
  const updatedCash = cashAtStartOfRound + income - totalExpenses;

  // 3. Calcular nuevos KPIs de Reputación y Moral
  let updatedNma = currentKpis.nma;
  let updatedMorale = currentKpis.morale;
  let updatedStudentTeacherRatio = updatedNumTeachers > 0 ? updatedNumStudents / updatedNumTeachers : 0;

  // Impacto de inversiones
  if ((decisions.investments || []).some(inv => inv.id === 'R2')) { // Inversión en TIC
      updatedNma += 0.2;
      updatedMorale += 5;
  }
  if ((decisions.investments || []).some(inv => inv.id === 'P1')) { // Formación docente
      updatedNma += 0.1;
      updatedMorale += 10;
  }

  // Bonificación por ratio bajo
  if (updatedStudentTeacherRatio > 0 && updatedStudentTeacherRatio < LOW_RATIO_THRESHOLD) {
    const bonusLevels = Math.floor(LOW_RATIO_THRESHOLD - updatedStudentTeacherRatio);
    updatedNma += (bonusLevels + 1) * LOW_RATIO_NMA_BONUS;
  }
  
  // Impacto de acciones de personal
  if(decisions.selectedCenterActions.includes('P7')) { // Despedir
      updatedMorale -= 25;
  }
  if(decisions.selectedCenterActions.includes('P2')) { // Contratar
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

  const finalKPIs = {
      ...currentKpis,
      cash: updatedCash,
      personnelCost: personnelCost,
      income: income,
      numStudents: updatedNumStudents,
      numTeachers: updatedNumTeachers,
      nma: updatedNma,
      morale: updatedMorale,
      studentTeacherRatio: updatedStudentTeacherRatio,
      privateIncome,
      publicIncome: PUBLIC_INCOME
  };

  console.log('Final KPIs:', JSON.parse(JSON.stringify(finalKPIs)));
  console.log(`--- DEBUG: [updateKpisForNextRound] END for team ${teamState.name} ---`);
  
  return finalKPIs;
}
