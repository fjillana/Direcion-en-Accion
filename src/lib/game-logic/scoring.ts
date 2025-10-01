
// All these values are placeholders and should be refined based on game-testing and balancing.
const XP_CONVERSION_FACTOR = 26.67 / 100; // 100 PEB = 26.67 XP

// --- Finance PEB Calculation ---
function calculateTreasuryPeb(cash: number, income: number): { peb: number, breakdown: string } {
    const treasuryPercentage = (cash / income) * 100;
    let peb = 0;
    // Ideal range is 5-10%
    if (treasuryPercentage < 5) {
        peb = 80 - (5 - treasuryPercentage) * 10; // Penalty for being too low
    } else if (treasuryPercentage <= 10) {
        peb = 80 + ((treasuryPercentage - 5) / 5) * 20; // Scale up to 100 in the 5-10% range
    } else {
        peb = 100 + ((treasuryPercentage - 10) / 5) * 10; // Bonus for being over 10%, capped at 110
    }
    peb = Math.max(0, Math.min(110, peb));
    return { peb, breakdown: `Tesorería (${treasuryPercentage.toFixed(1)}%): ${peb.toFixed(2)} PEB` };
}

function calculatePersonnelCostPeb(personnelCost: number, income: number): { peb: number, breakdown: string } {
    const costPercentage = (personnelCost / income) * 100;
    let peb = 0;
    // Ideal is around 75%
    if (costPercentage <= 75) {
        peb = 100 + (75 - costPercentage); // Bonus for being under
    } else {
        peb = 100 - (costPercentage - 75) * 2; // Penalty for being over
    }
    peb = Math.max(0, Math.min(110, peb));
    return { peb, breakdown: `Coste Personal (${costPercentage.toFixed(1)}%): ${peb.toFixed(2)} PEB` };
}

// --- Reputation PEB Calculation ---
function calculateNmaPeb(nma: number): { peb: number, breakdown: string } {
    let peb = 0;
    // Target is 8.5
    if (nma >= 8.5) {
        peb = 100 + (nma - 8.5) * 10;
    } else {
        peb = 100 - ((8.5 - nma) / 1.5) * 20; // Assuming 7.0 is the lower bound
    }
    peb = Math.max(0, Math.min(110, peb));
    return { peb, breakdown: `NMA (${nma.toFixed(1)}): ${peb.toFixed(2)} PEB` };
}

function calculateMarketSharePeb(marketShare: number): { peb: number, breakdown: string } {
    let peb = 10 * (marketShare - 10); // Simple linear scale, assuming 10% is baseline
    peb = Math.max(0, Math.min(110, peb));
    return { peb, breakdown: `Cuota Mercado (${marketShare.toFixed(1)}%): ${peb.toFixed(2)} PEB` };
}

// --- Morale PEB Calculation ---
function calculateStaffMoralePeb(morale: number): { peb: number, breakdown: string } {
    let peb = morale; // Direct mapping
    peb = Math.max(0, Math.min(110, peb));
    return { peb, breakdown: `Moral Personal (${morale.toFixed(0)}%): ${peb.toFixed(2)} PEB` };
}

function calculateStudentTeacherRatioPeb(ratio: number): { peb: number, breakdown: string } {
    let peb = 0;
    // Target is < 26.0
    if (ratio <= 25) {
        peb = 100 + (25 - ratio) * 5;
    } else if (ratio <= 26) {
        peb = 100 - (ratio - 25) * 20;
    } else {
        peb = 80 - (ratio - 26) * 10; // Heavy penalty for being over 26
    }
    peb = Math.max(0, Math.min(110, peb));
    return { peb, breakdown: `Ratio Alumno/Profesor (${ratio.toFixed(1)}): ${peb.toFixed(2)} PEB` };
}


interface TeamState {
    cash: number;
    personnelCost: number;
    income: number;
    nma: number;
    marketShare: number;
    morale: number;
    studentTeacherRatio: number;
}

export function calculateTeamPerformance(teamState: TeamState) {
    // Finance
    const treasury = calculateTreasuryPeb(teamState.cash, teamState.income);
    const personnelCost = calculatePersonnelCostPeb(teamState.personnelCost, teamState.income);
    const pebFinanzas = (treasury.peb + personnelCost.peb) / 2;
    const xpFinanzas = pebFinanzas * XP_CONVERSION_FACTOR;

    // Reputation
    const nma = calculateNmaPeb(teamState.nma);
    const marketShare = calculateMarketSharePeb(teamState.marketShare);
    const pebReputacion = (nma.peb + marketShare.peb) / 2;
    const xpReputacion = pebReputacion * XP_CONVERSION_FACTOR;

    // Morale
    const staffMorale = calculateStaffMoralePeb(teamState.morale);
    const studentTeacherRatio = calculateStudentTeacherRatioPeb(teamState.studentTeacherRatio);
    const pebMoral = (staffMorale.peb + studentTeacherRatio.peb) / 2;
    const xpMoral = pebMoral * XP_CONVERSION_FACTOR;

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
            pebBreakdown: [nma.breakdown, marketShare.breakdown]
        },
        morale: {
            peb: pebMoral,
            xp: xpMoral,
            pebBreakdown: [staffMorale.breakdown, studentTeacherRatio.breakdown]
        },
        totalXp: totalXp
    };
}
