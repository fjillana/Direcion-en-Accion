

import type { TeamKPIs, TeamState } from './types';
import type { TeamDecision } from '@/hooks/use-games';

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
function getXpBonusFromDecisions(decisions: TeamDecision): { finance: number; reputation: number; morale: number } {
    const bonus = { finance: 0, reputation: 0, morale: 0 };
    if (!decisions.investments) return bonus;

    // This mapping should be maintained and is the source of truth for XP bonuses.
    const xpBonusMap: Record<string, { area: keyof typeof bonus, xp: number }> = {
        'F1': { area: 'finance', xp: 10 },
        'F2': { area: 'finance', xp: 8 },
        'F3': { area: 'finance', xp: 5 },
        'F4': { area: 'finance', xp: 8 },
        'F5': { area: 'finance', xp: 10 },
        'R1': { area: 'reputation', xp: 10 },
        'R2': { area: 'reputation', xp: 15 },
        'R3': { area: 'reputation', xp: 12 },
        'R4': { area: 'reputation', xp: 5 },
        'R5': { area: 'reputation', xp: 4 },
        'P1': { area: 'morale', xp: 5 },
        'P2': { area: 'morale', xp: 10 },
        'P3': { area: 'morale', xp: 15 },
        'P4': { area: 'morale', xp: 15 },
        'P5': { area: 'morale', xp: 8 },
    };

    for (const investment of decisions.investments) {
        const bonusInfo = xpBonusMap[investment.id];
        if (bonusInfo) {
            // Logic to scale XP based on cost for variable investments
            if (investment.id === 'R1') { // Campaña publicitaria
                const maxCost = 20000;
                const minCost = 5000;
                const maxBonus = 10;
                const minBonus = 2;
                if (investment.cost >= minCost) {
                    const scaledBonus = minBonus + ((investment.cost - minCost) / (maxCost - minCost)) * (maxBonus - minBonus);
                    bonus[bonusInfo.area] += scaledBonus;
                }
            } else {
                bonus[bonusInfo.area] += bonusInfo.xp;
            }
        }
    }
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

    const xpFinanzas = baseXpFinanzas + xpBonus.finance;
    const xpReputacion = baseXpReputacion + xpBonus.reputation;
    const xpMoral = baseXpMoral + xpBonus.morale;

    const totalXp = xpFinanzas + xpReputacion + xpMoral;

    return {
        finances: {
            peb: pebFinanzas,
            xp: xpFinanzas,
            pebBreakdown: [treasury.breakdown, personnelCost.breakdown]
        },
        reputation: {
            peb: pebReputacion,
            xp: xpReputacion,
            pebBreakdown: [nma.breakdown, marketShare.breakdown, `Ajuste por sobrecarga: ${ratioOverloaded ? '-10' : '0'} PEB`]
        },
        morale: {
            peb: pebMoral,
            xp: xpMoral,
            pebBreakdown: [staffMorale.breakdown, studentTeacherRatio.breakdown]
        },
        totalXp: totalXp
    };
}
