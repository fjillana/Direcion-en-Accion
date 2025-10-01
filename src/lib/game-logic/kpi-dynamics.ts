
import type { TeamState } from "./types";

const TEACHER_SALARY = 7500; // Coste trimestral por profesor
const OVERLOAD_RATIO = 26.0;
const OVERLOAD_MORALE_PENALTY = 5;
const OVERLOAD_NMA_PENALTY = 0.1;
const PUBLIC_INCOME = 25000;
const CAPACITY = 810;


/**
 * Recalcula los KPIs de un equipo para el inicio de la siguiente ronda.
 * @param teamState - El estado actual del equipo.
 * @param newStudents - El número de nuevos alumnos captados en esta ronda.
 * @param isInitialSetup - Si es la ronda 0, para solo calcular el gasto inicial.
 * @returns El nuevo estado de los KPIs del equipo.
 */
export function updateKpisForNextRound(teamState: TeamState, newStudents: number, isInitialSetup = false) {
  const currentKpis = { ...teamState.kpis };
  const decisions = { ...teamState.decisions };

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

  // En la simulación normal (no en el setup inicial), los nuevos alumnos se añaden
  if (!isInitialSetup) {
      const availableSpots = CAPACITY - updatedNumStudents;
      const admittedStudents = Math.min(newStudents, availableSpots);
      updatedNumStudents += admittedStudents;
  }
  

  // 2. Calcular Ingresos y Costes
  const privateIncome = updatedNumStudents * decisions.tuitionPrice;
  const income = privateIncome + PUBLIC_INCOME;
  const personnelCost = updatedNumTeachers * TEACHER_SALARY;
  const investmentCost = (decisions.investments || []).reduce((sum, inv) => sum + inv.cost, 0);
  
  const centerActionsCost = decisions.selectedCenterActions.reduce((sum, actionId) => {
      if (actionId === 'F5') return sum + 50000;
      if (actionId === 'P7') return sum + 7500; // Coste de despido
      return sum;
  }, 0);
  
  const totalExpenses = personnelCost + investmentCost + centerActionsCost;
  
  // Para la Ronda 0, el "resultado" es solo el gasto inicial. No hay ingresos.
  const roundResult = isInitialSetup 
    ? -totalExpenses
    : income - personnelCost;
  
  const updatedCash = currentKpis.cash + roundResult - (isInitialSetup ? 0 : investmentCost + centerActionsCost);


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
  
  // Impacto de acciones de personal
  if(decisions.selectedCenterActions.includes('P7')) { // Despedir
      updatedMorale -= 25;
  }
  if(decisions.selectedCenterActions.includes('P2')) { // Contratar
      updatedMorale += 10;
  }

  // Impacto de sobrecarga
  if (updatedStudentTeacherRatio > OVERLOAD_RATIO) {
    updatedMorale -= OVERLOAD_MORALE_PENALTY;
    updatedNma -= OVERLOAD_NMA_PENALTY;
  }
  
  // Limitar valores para que no se salgan de rangos lógicos
  updatedNma = Math.max(0, Math.min(10, updatedNma));
  updatedMorale = Math.max(0, Math.min(100, updatedMorale));
  
  return {
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
}
