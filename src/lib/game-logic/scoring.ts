

import type { TeamState } from './types';
import type { TeamDecision } from '@/hooks/use-games';
import { investments as fullInvestmentsList } from '@/app/teacher/catalog/investment-data';

// Constantes según el Manual Técnico
const XP_CONVERSION_FACTOR = 26.67 / 100; // 100 PEB = 26.67 XP
const XP_AREA_MAX = 26.67 * 1.1; // 110% of base max XP

// --- Finance PEB Calculation (Sección 10.1) ---
function calculateTreasuryPeb(cash: number, income: number, hasLoan: boolean): { peb: number, breakdown: string } {
    if (income === 0 && cash <= 0) return { peb: 0, breakdown: 'Tesorería: 0 PEB (Sin ingresos y tesorería negativa o cero)'};
    const minRemanent = 16000;
    
    // Si no hay ingresos pero hay caja, se evalúa sobre la caja inicial.
    if (income === 0 && cash > 0) {
        const peb = cash < minRemanent ? (cash / minRemanent) * 100 : (cash > minRemanent * 2) ? 110 : 100;
         return { peb, breakdown: `Tesorería (${(cash).toLocaleString('es-ES')} CC): ${peb.toFixed(2)} PEB` };
    }

    let peb = cash < 0 ? 0 : cash < minRemanent ? (cash / minRemanent) * 100 : (cash > minRemanent * 2) ? 110 : 100;
    
    // Apply loan penalty
    if (hasLoan) {
        peb -= 20; // -20 PEB penalty for taking the loan
    }

    return { peb: Math.max(0, peb), breakdown: `Tesorería (${(cash).toLocaleString('es-ES')} CC): ${peb.toFixed(2)} PEB` };
}

function calculatePersonnelCostPeb(personnelCost: number, income: number): { peb: number, breakdown: string } {
    if (income === 0) return { peb: 0, breakdown: 'Coste Personal: 0 PEB (Ingresos son 0)' };
    const costPercentage = (personnelCost / income) * 100;
    
    const basePeb = 100;
    const basePercentage = 75;
    
    const percentageDifference = costPercentage - basePercentage;
    const pebAdjustment = percentageDifference * 10;
    
    let peb = basePeb - pebAdjustment;

    peb = Math.max(0, peb);

    return { peb, breakdown: `Coste Personal (${costPercentage.toFixed(1)}%): ${peb.toFixed(2)} PEB` };
}

// --- Reputation PEB Calculation (Sección 10.2) ---
function calculateNmaPeb(nma: number): { peb: number, breakdown: string } {
    const baseNma = 7.5;
    const basePeb = 70;
    
    // 20 PEB por cada punto de NMA por encima o por debajo de la base.
    const nmaDifference = nma - baseNma;
    const pebAdjustment = nmaDifference * 20;
    
    let peb = basePeb + pebAdjustment;
    
    // Limitar el PEB entre 0 y 110.
    peb = Math.max(0, Math.min(110, peb));
    
    return { peb, breakdown: `NMA (${nma.toFixed(1)}): ${peb.toFixed(2)} PEB` };
}


function calculateMarketSharePeb(currentStudents: number, initialStudents: number = 800): { peb: number, breakdown: string } {
    const growth = ((currentStudents - initialStudents) / initialStudents) * 100;
    const basePeb = 100;
    const targetGrowth = 5; // 5% de crecimiento se considera el objetivo para 100 PEB
    
    // 10 PEB por cada punto porcentual por encima o por debajo del objetivo
    const pebAdjustment = (growth - targetGrowth) * 10;
    let peb = basePeb + pebAdjustment;
    
    // Limitar el PEB entre 0 y 110
    peb = Math.max(0, Math.min(110, peb));

    return { peb, breakdown: `Cuota Mercado (crecimiento ${growth.toFixed(1)}%): ${peb.toFixed(2)} PEB` };
}

// --- Morale PEB Calculation (Sección 10.3) ---
function calculateStaffMoralePeb(morale: number): { peb: number, breakdown: string } {
    const baseMorale = 80;
    const basePeb = 90;
    
    const moraleDifference = morale - baseMorale;
    const pebAdjustment = moraleDifference; // 1 PEB por cada punto de moral
    
    let peb = basePeb + pebAdjustment;
    
    peb = Math.max(0, Math.min(110, peb));

    return { peb, breakdown: `Moral Personal (${morale.toFixed(0)}%): ${peb.toFixed(2)} PEB` };
}


function calculateStudentTeacherRatioPeb(ratio: number): { peb: number, breakdown: string } {
    const basePeb = 70;
    const baseRatio = 25.0;
    
    const ratioDifference = ratio - baseRatio;
    
    // 2 PEB por cada 0.1 de diferencia de ratio. Es decir, 20 PEB por cada punto de ratio.
    const pebAdjustment = ratioDifference * 20; 
    
    let peb = basePeb - pebAdjustment;

    peb = Math.max(0, Math.min(110, peb)); // Limitar el PEB entre 0 y 110

    return { peb, breakdown: `Ratio Alumno/Profesor (${ratio.toFixed(1)}): ${peb.toFixed(2)} PEB` };
}

// --- XP Bonus Calculation from Decisions ---
function getXpBonusFromDecisions(decisions: TeamDecision, negotiationSuccess?: boolean): { finances: number; reputation: number; morale: number } {
    const bonus = { finances: 0, reputation: 0, morale: 0 };
    const actions = decisions.actions || [];

    for (const actionId of actions) {
        const investmentInfo = fullInvestmentsList.find(inv => inv.id === actionId);
        if (!investmentInfo) continue;
        
        // Apply XP bonus from investments
        if (investmentInfo.xpBonus) {
            const applyBonus = (area: 'finances' | 'reputation' | 'morale') => {
                const bonusValue = investmentInfo.xpBonus[area];
                if (bonusValue) {
                    if (investmentInfo.xpBonus.type === 'fixed') {
                        bonus[area] += bonusValue as number;
                    } else if (investmentInfo.xpBonus.type === 'scaled') {
                        const [minBonus, maxBonus] = bonusValue as [number, number];
                        const [minCost, maxCost] = investmentInfo.cost.value as [number, number];
                        const actualCost = decisions.investmentCosts?.[actionId] || maxCost;
                        
                        if (maxCost > minCost) {
                            const ratio = (actualCost - minCost) / (maxCost - minCost);
                            bonus[area] += minBonus + (maxBonus - minBonus) * ratio;
                        } else {
                             bonus[area] += maxBonus;
                        }
                    }
                }
            };
            applyBonus('finances');
            applyBonus('reputation');
            applyBonus('morale');
        }

        // Apply direct reputation penalties from effects
        if (investmentInfo.effects.reputationPenalty) {
            bonus.reputation += investmentInfo.effects.reputationPenalty;
        }
    }
    
    // Crisis C1 Effects
    if (decisions.crisisResponse?.crisisId === 'C1') {
      const optionId = decisions.crisisResponse.optionId;
      if (optionId === 'C1_op1') {
        bonus.morale += 5;
        bonus.finances -= 5;
      } else if (optionId === 'C1_op2') {
        bonus.morale += 3;
        bonus.finances -= 3;
      } else if (optionId === 'C1_op3') {
        bonus.finances -= 15;
        bonus.reputation -= 15;
        bonus.morale -= 15;
      } else if (optionId === 'C1_op4') {
        bonus.morale += 2;
      } else if (optionId === 'C1_op5') {
        bonus.finances += 5;
        bonus.reputation -= 10;
      }
    }

    // Crisis C2 Effects
    if (decisions.crisisResponse?.crisisId === 'C2') {
        const optionId = decisions.crisisResponse.optionId;
        if (optionId === 'C2_op2') {
            bonus.reputation -= 15;
        } else if (optionId === 'C2_op3') {
            if (negotiationSuccess) {
                bonus.reputation += 5;
            } else {
                bonus.finances -= 5;
            }
        } else if (optionId === 'C2_op5') {
            bonus.finances += 8;
            bonus.reputation -= 8;
        }
    }

    // Crisis C3 Effects
    if (decisions.crisisResponse?.crisisId === 'C3') {
        const optionId = decisions.crisisResponse.optionId;
        if(optionId === 'C3_op1') {
            bonus.reputation += 2;
            bonus.finances -= 2;
        } else if (optionId === 'C3_op2') {
            bonus.finances += 5;
            bonus.reputation -= 5;
        } else if (optionId === 'C3_op4') {
            bonus.finances += 3;
            bonus.reputation -= 4;
        } else if (optionId === 'C3_op5') {
            bonus.reputation += 3;
            bonus.finances += 2;
        }
    }

    // Crisis C4 Effects
    if (decisions.crisisResponse?.crisisId === 'C4') {
        const optionId = decisions.crisisResponse.optionId;
        if (optionId === 'C4_op1') {
            bonus.reputation -= 5;
        } else if (optionId === 'C4_op2') {
            bonus.reputation -= 2;
            bonus.morale += 2;
        } else if (optionId === 'C4_op3') {
            bonus.finances += 5;
        } else if (optionId === 'C4_op4') {
            bonus.reputation += 5;
        } else if (optionId === 'C4_op5') {
            bonus.reputation += 3;
        }
    }

    // Crisis C5 Effects
    if (decisions.crisisResponse?.crisisId === 'C5') {
        const optionId = decisions.crisisResponse.optionId;
        if (optionId === 'C5_op1') {
            bonus.reputation -= 3;
            bonus.finances -= 5;
        } else if (optionId === 'C5_op2') {
            bonus.reputation += 5;
            bonus.morale += 3;
        } else if (optionId === 'C5_op3') {
            bonus.morale += 3;
        } else if (optionId === 'C5_op4') {
            bonus.reputation -= 10;
        } else if (optionId === 'C5_op5') {
            bonus.finances -= 2;
            if (negotiationSuccess) {
                bonus.reputation += 2;
            }
        }
    }
    
    // Crisis C6 Effects
    if (decisions.crisisResponse?.crisisId === 'C6') {
        const optionId = decisions.crisisResponse.optionId;
        if(optionId === 'C6_op1') {
            bonus.finances -= 2;
            bonus.reputation += 2;
        } else if (optionId === 'C6_op2') {
            bonus.finances += 4;
            bonus.reputation += 2;
        } else if (optionId === 'C6_op4') {
            bonus.finances += 4;
            bonus.reputation -= 5;
        } else if (optionId === 'C6_op5') {
            bonus.finances -= 2;
        }
    }

    // Crisis C7 Effects
    if (decisions.crisisResponse?.crisisId === 'C7') {
      const optionId = decisions.crisisResponse.optionId;
      if (optionId === 'C7_op1') { // Minimizar
        bonus.reputation -= 8;
      } else if (optionId === 'C7_op2') { // Investigar
        bonus.reputation -= 4;
        bonus.morale += 3;
      } else if (optionId === 'C7_op3') { // Programa anti-bullying
        bonus.reputation += 5;
        bonus.morale += 3;
      } else if (optionId === 'C7_op4') { // Comunicado
        bonus.reputation -= 2;
        bonus.morale += 2;
      } else if (optionId === 'C7_op5') { // Demandear
        bonus.reputation -= 10;
        bonus.finances += 5;
      }
    }


    return bonus;
}

export function calculateTeamPerformance(teamState: TeamState, ratioOverloaded: boolean, negotiationSuccess?: boolean) {
    const { kpis, decisions } = teamState;
    
    const hasC2Loan = decisions.crisisResponse?.optionId === 'C2_op1';
    const hasC3Loan = decisions.crisisResponse?.optionId === 'C3_op3';
    const hasC6Loan = decisions.crisisResponse?.optionId === 'C6_op3';
    const hasLoan = hasC2Loan || hasC3Loan || hasC6Loan;

    // --- PEB Calculation ---
    const treasury = calculateTreasuryPeb(kpis.cash, kpis.income, hasLoan);
    const personnelCost = calculatePersonnelCostPeb(kpis.personnelCost, kpis.income);
    let pebFinanzas = (treasury.peb + personnelCost.peb) / 2;

    if (hasC6Loan) { // Specific PEB penalty for C6 loan
        pebFinanzas *= 0.5;
    }
    pebFinanzas = Math.min(110, pebFinanzas);


    const nma = calculateNmaPeb(kpis.nma);
    const marketShare = calculateMarketSharePeb(kpis.numStudents);
    let pebReputacion = (nma.peb + marketShare.peb) / 2;
    
    if(decisions.crisisResponse?.optionId === 'C1_op3') {
        pebReputacion -= 40;
    }
    pebReputacion = Math.max(0, Math.min(110, pebReputacion));


    const staffMorale = calculateStaffMoralePeb(kpis.morale);
    const studentTeacherRatio = calculateStudentTeacherRatioPeb(kpis.studentTeacherRatio);
    const pebMoral = Math.min(110, (staffMorale.peb + studentTeacherRatio.peb) / 2);

    // --- XP Calculation ---
    const baseXpFinanzas = pebFinanzas * XP_CONVERSION_FACTOR;
    const baseXpReputacion = pebReputacion * XP_CONVERSION_FACTOR;
    const baseXpMoral = pebMoral * XP_CONVERSION_FACTOR;
    
    const xpBonus = getXpBonusFromDecisions(decisions, negotiationSuccess);

    const xpFinanzas = Math.min(XP_AREA_MAX, baseXpFinanzas + xpBonus.finances);
    const xpReputacion = Math.min(XP_AREA_MAX, baseXpReputacion + xpBonus.reputation);
    const xpMoral = Math.min(XP_AREA_MAX, baseXpMoral + xpBonus.morale);

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
            pebBreakdown: [nma.breakdown, marketShare.breakdown],
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
