

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

function calculateFinancialDecisionsPeb(decisions: TeamDecision): { peb: number, breakdown: string } {
    let peb = 80; // Base PEB for decisions
    const financialInvestments = ['F1', 'F2', 'F3'];
    const madeFinancialInvestment = (decisions?.investments || []).some(inv => financialInvestments.includes(inv.id));

    if (madeFinancialInvestment) {
        peb = 110; 
        return { peb, breakdown: `Decisiones Financieras: ${peb.toFixed(2)} PEB (+ por inversión estratégica)` };
    }
    
    return { peb, breakdown: `Decisiones Financieras: ${peb.toFixed(2)} PEB (Base)` };
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

function calculateReputationDecisionsPeb(decisions: TeamDecision): { peb: number, breakdown: string } {
    let peb = 80; // Base PEB for decisions
    const reputationInvestments = ['R1', 'R2', 'R3', 'R4', 'R5'];
    const madeReputationInvestment = (decisions?.investments || []).some(inv => reputationInvestments.includes(inv.id));
    
    if (madeReputationInvestment) {
        peb = 110;
        return { peb, breakdown: `Decisiones de Reputación: ${peb.toFixed(2)} PEB (+ por inversión estratégica)` };
    }
    
    return { peb, breakdown: `Decisiones de Reputación: ${peb.toFixed(2)} PEB (Base)` };
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

function calculateMoraleDecisionsPeb(decisions: TeamDecision): { peb: number, breakdown: string } {
    let peb = 80; // Base PEB for decisions
    const moraleInvestments = ['P1', 'P3', 'P4', 'P5'];
    const madeMoraleInvestment = (decisions?.investments || []).some(inv => moraleInvestments.includes(inv.id));
    
    if (madeMoraleInvestment) {
        peb = 110;
        return { peb, breakdown: `Decisiones de Personal: ${peb.toFixed(2)} PEB (+ por inversión estratégica)` };
    }
    
    return { peb, breakdown: `Decisiones de Personal: ${peb.toFixed(2)} PEB (Base)` };
}


export function calculateTeamPerformance(teamState: TeamState, ratioOverloaded: boolean) {
    const { kpis, decisions } = teamState;

    // Finance
    const treasury = calculateTreasuryPeb(kpis.cash, kpis.income);
    const personnelCost = calculatePersonnelCostPeb(kpis.personnelCost, kpis.income);
    const decisionsFinances = calculateFinancialDecisionsPeb(decisions);
    const pebFinanzas = (treasury.peb + personnelCost.peb + decisionsFinances.peb) / 3;
    const xpFinanzas = pebFinanzas * XP_CONVERSION_FACTOR;

    // Reputation
    const nma = calculateNmaPeb(kpis.nma);
    const marketShare = calculateMarketSharePeb(kpis.numStudents);
    const decisionsReputation = calculateReputationDecisionsPeb(decisions);
    const pebReputationBase = (nma.peb + marketShare.peb + decisionsReputation.peb) / 3;
    // Manual: -10 PEB de Reputación por sobrecarga
    const pebReputacion = ratioOverloaded ? pebReputationBase - 10 : pebReputationBase; 
    const xpReputacion = pebReputacion * XP_CONVERSION_FACTOR;

    // Morale
    const staffMorale = calculateStaffMoralePeb(kpis.morale);
    const studentTeacherRatio = calculateStudentTeacherRatioPeb(kpis.studentTeacherRatio);
    const decisionsMorale = calculateMoraleDecisionsPeb(decisions);
    const pebMoral = (staffMorale.peb + studentTeacherRatio.peb + decisionsMorale.peb) / 3;
    const xpMoral = pebMoral * XP_CONVERSION_FACTOR;

    const totalXp = xpFinanzas + xpReputacion + xpMoral;

    return {
        finances: {
            peb: pebFinanzas,
            xp: xpFinanzas,
            pebBreakdown: [treasury.breakdown, personnelCost.breakdown, decisionsFinances.breakdown]
        },
        reputation: {
            peb: pebReputacion,
            xp: xpReputacion,
            pebBreakdown: [nma.breakdown, marketShare.breakdown, decisionsReputation.breakdown, `Ajuste por sobrecarga: ${ratioOverloaded ? '-10' : '0'} PEB`]
        },
        morale: {
            peb: pebMoral,
            xp: xpMoral,
            pebBreakdown: [staffMorale.breakdown, studentTeacherRatio.breakdown, decisionsMorale.breakdown]
        },
        totalXp: totalXp
    };
}
