
import type { TeamKPIs } from './types';
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
    let peb = 80; // Base PEB
    let breakdown = "Decisiones Financieras: 80.00 PEB (Base)";
    const justifications: string[] = [];

    const financialInvestments = ['F1', 'F2', 'F3'];
    const madeFinancialInvestment = (decisions.investments || []).some(inv => financialInvestments.includes(inv.id));

    if (madeFinancialInvestment) {
        peb += 10; // Bonus for making a smart financial investment
        justifications.push('+10 por inversión financiera estratégica');
    }
    
    if (justifications.length > 0) {
        breakdown = `Decisiones Financieras: ${peb.toFixed(2)} PEB (${justifications.join(', ')})`;
    }

    return { peb, breakdown };
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


export function calculateTeamPerformance(teamKPIs: TeamKPIs, ratioOverloaded: boolean, decisions: TeamDecision) {
    // Finance
    const treasury = calculateTreasuryPeb(teamKPIs.cash, teamKPIs.income);
    const personnelCost = calculatePersonnelCostPeb(teamKPIs.personnelCost, teamKPIs.income);
    const decisionsFinances = calculateFinancialDecisionsPeb(decisions);
    const pebFinanzas = (treasury.peb + personnelCost.peb + decisionsFinances.peb) / 3;
    const xpFinanzas = pebFinanzas * XP_CONVERSION_FACTOR;

    // Reputation
    const nma = calculateNmaPeb(teamKPIs.nma);
    const marketShare = calculateMarketSharePeb(teamKPIs.numStudents);
    const pebReputationBase = (nma.peb + marketShare.peb) / 2;
    // Manual: -10 PEB de Reputación por sobrecarga
    const pebReputacion = ratioOverloaded ? pebReputationBase - 10 : pebReputationBase; 
    const xpReputacion = pebReputacion * XP_CONVERSION_FACTOR;

    // Morale
    const staffMorale = calculateStaffMoralePeb(teamKPIs.morale);
    const studentTeacherRatio = calculateStudentTeacherRatioPeb(teamKPIs.studentTeacherRatio);
    const pebMoral = (staffMorale.peb + studentTeacherRatio.peb) / 2;
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
