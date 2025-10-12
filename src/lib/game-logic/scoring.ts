

import type { TeamState } from './types';
import type { TeamDecision } from '@/hooks/use-games';
import { investments as fullInvestmentsList } from '@/app/teacher/catalog/investment-data';

// Constantes según el Manual Técnico
const XP_CONVERSION_FACTOR = 26.67 / 100; // 100 PEB = 26.67 XP

// --- Finance PEB Calculation (Sección 10.1) ---
function calculateTreasuryPeb(cash: number, income: number): { peb: number, breakdown: string } {
    if (income === 0 && cash <= 0) return { peb: 0, breakdown: 'Tesorería: 0 PEB (Sin ingresos y tesorería negativa o cero)'};
    const minRemanent = 16000;
    
    // Si no hay ingresos pero hay caja, se evalúa sobre la caja inicial.
    if (income === 0 && cash > 0) {
        const peb = cash < minRemanent ? (cash / minRemanent) * 100 : (cash > minRemanent * 2) ? 110 : 100;
         return { peb, breakdown: `Tesorería (${(cash).toLocaleString('es-ES')} CC): ${peb.toFixed(2)} PEB` };
    }

    const peb = cash < 0 ? 0 : cash < minRemanent ? (cash / minRemanent) * 100 : (cash > minRemanent * 2) ? 110 : 100;

    return { peb, breakdown: `Tesorería (${(cash).toLocaleString('es-ES')} CC): ${peb.toFixed(2)} PEB` };
}

function calculatePersonnelCostPeb(personnelCost: number, income: number): { peb: number, breakdown: string } {
    if (income === 0) return { peb: 0, breakdown: 'Coste Personal: 0 PEB (Ingresos son 0)' };
    const costPercentage = (personnelCost / income) * 100;
    let peb = 0;
    if (costPercentage <= 70) {
        peb = 110;
    } else if (costPercentage <= 78) { // 75 +/- 3
        peb = 100;
    } else if (costPercentage <= 80) {
        peb = 90;
    } else {
        peb = 70;
    }
    return { peb, breakdown: `Coste Personal (${costPercentage.toFixed(1)}%): ${peb.toFixed(2)} PEB` };
}

// --- Reputation PEB Calculation (Sección 10.2) ---
function calculateNmaPeb(nma: number): { peb: number, breakdown: string } {
    let peb = 0;
    if (nma >= 8.5) {
        peb = 100;
    } else if (nma >= 8.0) {
        peb = 80;
    } else {
        peb = 60;
    }
    return { peb, breakdown: `NMA (${nma.toFixed(1)}): ${peb.toFixed(2)} PEB` };
}

function calculateMarketSharePeb(currentStudents: number, initialStudents: number = 800): { peb: number, breakdown: string } {
    const growth = ((currentStudents - initialStudents) / initialStudents) * 100;
    let peb = 0;
    if (growth >= 10) {
        peb = 110;
    } else if (growth >= 5) {
        peb = 100;
    } else if (growth >= 1) {
        peb = 80;
    } else if (growth > -1) {
        peb = 60;
    } else {
        peb = 50;
    }
    return { peb, breakdown: `Cuota Mercado (crecimiento ${growth.toFixed(1)}%): ${peb.toFixed(2)} PEB` };
}

// --- Morale PEB Calculation (Sección 10.3) ---
function calculateStaffMoralePeb(morale: number): { peb: number, breakdown: string } {
    let peb = 0;
    if (morale >= 90) {
        peb = 110;
    } else if (morale >= 70) {
        peb = 100;
    } else if (morale >= 60) {
        peb = 80;
    } else if (morale >= 50) {
        peb = 50;
    } else {
        peb = 0;
    }
    return { peb, breakdown: `Moral Personal (${morale.toFixed(0)}%): ${peb.toFixed(2)} PEB` };
}

function calculateStudentTeacherRatioPeb(ratio: number): { peb: number, breakdown: string } {
    let peb = 0;
    if (ratio <= 22.5) {
        peb = 100;
    } else if (ratio <= 24) {
        peb = 90;
    } else if (ratio <= 25) {
        peb = 70;
    } else if (ratio <= 26) {
        peb = 50;
    } else {
        peb = 0;
    }
    return { peb, breakdown: `Ratio Alumno/Profesor (${ratio.toFixed(1)}): ${peb.toFixed(2)} PEB` };
}

// --- XP Bonus Calculation from Decisions ---
function getXpBonusFromDecisions(decisions: TeamDecision): { finances: number; reputation: number; morale: number } {
    const bonus = { finances: 0, reputation: 0, morale: 0 };
    const actions = decisions.actions || [];

    console.log(`[GPS] 5c. Calculating XP Bonus. Decisions received:`, decisions);

    for (const actionId of actions) {
        const investmentInfo = fullInvestmentsList.find(inv => inv.id === actionId);
        if (!investmentInfo) continue;
        
        const area = investmentInfo.bonus.area;

        if (investmentInfo.bonus.type === 'fixed') {
            bonus[area] += investmentInfo.bonus.value as number;
        } else if (investmentInfo.bonus.type === 'scaled') {
            const [minBonus, maxBonus] = investmentInfo.bonus.value as [number, number];
            // Scaled bonus is based on the investment cost, which we assume is max for now
            // This is a simplification. A more accurate model would require the chosen cost
            // to be part of the decision object. For now, let's grant the max bonus.
            bonus[area] += maxBonus;
        }
    }
    console.log(`[GPS] 5d. Calculated XP Bonus:`, bonus);
    return bonus;
}

export function calculateTeamPerformance(teamState: TeamState, ratioOverloaded: boolean) {
    const { kpis, decisions } = teamState;

    // --- PEB Calculation ---
    const treasury = calculateTreasuryPeb(kpis.cash, kpis.income);
    const personnelCost = calculatePersonnelCostPeb(kpis.personnelCost, kpis.income);
    const pebFinanzas = (treasury.peb + personnelCost.peb) / 2;

    const nma = calculateNmaPeb(kpis.nma);
    const marketShare = calculateMarketSharePeb(kpis.numStudents);
    const pebReputationBase = (nma.peb + marketShare.peb) / 2;
    const pebReputacion = ratioOverloaded ? pebReputationBase - 10 : pebReputationBase; 

    const staffMorale = calculateStaffMoralePeb(kpis.morale);
    const studentTeacherRatio = calculateStudentTeacherRatioPeb(kpis.studentTeacherRatio);
    const pebMoral = (staffMorale.peb + studentTeacherRatio.peb) / 2;

    // --- XP Calculation ---
    const baseXpFinanzas = pebFinanzas * XP_CONVERSION_FACTOR;
    const baseXpReputacion = pebReputacion * XP_CONVERSION_FACTOR;
    const baseXpMoral = pebMoral * XP_CONVERSION_FACTOR;
    
    const xpBonus = getXpBonusFromDecisions(decisions);

    const xpFinanzas = baseXpFinanzas + xpBonus.finances;
    const xpReputacion = baseXpReputacion + xpBonus.reputation;
    const xpMoral = baseXpMoral + xpBonus.morale;

    const totalXp = xpFinanzas + xpReputacion + xpMoral;

    return {
        finances: {
            peb: pebFinanzas,
            xp: xpFinanzas,
            pebBreakdown: [treasury.breakdown, personnelCost.breakdown],
        },
        reputation: {
            peb: pebReputacion,
            xp: xpReputacion,
            pebBreakdown: [nma.breakdown, marketShare.breakdown, `Ajuste por sobrecarga: ${ratioOverloaded ? '-10' : '0'} PEB`],
        },
        morale: {
            peb: pebMoral,
            xp: xpMoral,
            pebBreakdown: [staffMorale.breakdown, studentTeacherRatio.breakdown],
        },
        xpFinancesBonus: xpBonus.finances,
        xpReputationBonus: xpBonus.reputation,
        xpMoraleBonus: xpBonus.morale,
        totalXp: totalXp
    };
}
