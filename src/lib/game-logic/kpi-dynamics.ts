
import type { TeamState } from "./types";
import { calculateMarketAttractiveness } from "./market-attractiveness";

const TEACHER_SALARY = 7500;
const OVERLOAD_RATIO = 26.0;
const OVERLOAD_MORALE_PENALTY = 5;
const OVERLOAD_NMA_PENALTY = 0.1;

/**
 * Recalcula los KPIs de un equipo para el inicio de la siguiente ronda.
 * @param teamState - El estado actual del equipo.
 * @param newStudents - El número de nuevos alumnos captados en esta ronda.
 * @returns El nuevo estado de los KPIs del equipo.
 */
export function updateKpisForNextRound(teamState: TeamState, newStudents: number) {
  const currentKpis = { ...teamState.kpis };
  const decisions = { ...teamState.decisions };

  // 1. Actualizar número de alumnos y profesores
  let updatedNumStudents = currentKpis.numStudents + newStudents;
  let updatedNumTeachers = currentKpis.numTeachers;

  if (decisions.selectedCenterActions.includes('P2')) { // Contratar
    updatedNumTeachers += 1;
  }
  if (decisions.selectedCenterActions.includes('P7')) { // Despedir
    updatedNumTeachers -= 1;
  }
  
  // TODO: Simular pérdida de alumnos si la capacidad es excedida

  // 2. Calcular Ingresos y Costes
  const income = updatedNumStudents * decisions.tuitionPrice;
  const personnelCost = updatedNumTeachers * TEACHER_SALARY;
  const investmentCost = decisions.investments.reduce((sum, inv) => sum + inv.cost, 0);
  const centerActionsCost = decisions.selectedCenterActions.reduce((sum, actionId) => {
      if (actionId === 'P2') return sum + TEACHER_SALARY; // Coste de contratación es un salario
      if (actionId === 'P7') return sum + TEACHER_SALARY; // Coste de despido (indemnización)
      if (actionId === 'F5') return sum + 50000; // Ampliación de aulas
      return sum;
  }, 0);
  
  // TODO: Añadir costes de crisis
  const totalCost = personnelCost + investmentCost + centerActionsCost;
  const roundResult = income - totalCost;
  
  const updatedCash = currentKpis.cash + roundResult;

  // 3. Calcular nuevos KPIs de Reputación y Moral
  let updatedNma = currentKpis.nma;
  let updatedMorale = currentKpis.morale;
  let updatedStudentTeacherRatio = updatedNumTeachers > 0 ? updatedNumStudents / updatedNumTeachers : 0;

  // Impacto de inversiones
  if (decisions.investments.some(inv => inv.id === 'R2')) { // Inversión en TIC
      updatedNma += 0.2;
      updatedMorale += 5;
  }
  if (decisions.investments.some(inv => inv.id === 'P1')) { // Formación docente
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
      // La cuota de mercado se recalcula después de que todos los equipos tengan sus nuevos alumnos
  };
}
