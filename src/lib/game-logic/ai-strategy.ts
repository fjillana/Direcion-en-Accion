

import type { Game, RoundDecisions } from "@/hooks/use-games";
import type { TeamState, TeamDecisions, InvestmentDecision } from "./types";
import { investments as fullInvestmentsList } from '@/app/teacher/catalog/investment-data';
import { crises as fullCrisesList } from '@/app/teacher/catalog/crises-data';


/**
 * Generates decisions for an AI team based on its archetype and the game's difficulty level.
 * The quality of decisions scales with `aiDifficulty`.
 * @param teamState The current state of the AI team.
 * @param game The current game object, containing settings.
 * @returns The decisions made by the AI for the current round.
 */
export function getAIDecisions(teamState: TeamState, game: Game): RoundDecisions {
    const { kpis, archetype } = teamState;
    const { aiDifficulty, round, roundSettings } = game;

    // --- Rationality Factor ---
    // Scales from 0.2 (very irrational) at difficulty 1, to 1.0 (fully rational) at difficulty 5.
    const rationality = aiDifficulty / 5;

    const availableInvestments = roundSettings?.[round]?.investments || [];
    const decisions: RoundDecisions = {
        actions: [],
        tuitionPrice: 120,
        crisisResponse: null,
        roundConfirmed: true,
        investmentCosts: {},
    };

    // --- 1. Price Decision ---
    let basePrice = 120;
    if (archetype === 'AGGRESSIVE_GROWTH') {
        basePrice = 110;
    } else if (archetype === 'FINANCE_CONSERVATIVE') {
        basePrice = 135;
    } else if (archetype === 'QUALITY_FOCUSED') {
        basePrice = 125;
    }

    // High-difficulty AI adjusts price based on needs
    if (rationality > 0.6 && kpis.cash < game.initialFunds * 0.4) {
        basePrice += 15; // Urgently need cash
    }
    
    // Low-difficulty AI adds randomness
    const priceRandomness = (1 - rationality) * 20; // Up to 20 CC variance for difficulty 1
    decisions.tuitionPrice = Math.round(basePrice + (Math.random() * priceRandomness) - (priceRandomness / 2));


    // --- 2. Investment Decisions ---
    let budget = kpis.cash * (0.15 + (rationality * 0.2)); // Spend between 15% and 35% of cash

    const investmentPriorities: Record<string, number> = {
        // Finance
        'F1': archetype === 'FINANCE_CONSERVATIVE' ? 0.8 : 0.4,
        // Reputation
        'R1': archetype === 'AGGRESSIVE_GROWTH' ? 0.9 : 0.5,
        'R2': archetype === 'QUALITY_FOCUSED' ? 0.8 : 0.5,
        // Personnel
        'P1': archetype === 'QUALITY_FOCUSED' ? 0.9 : 0.6,
        'P2': (archetype === 'QUALITY_FOCUSED' && kpis.studentTeacherRatio > 26) ? 0.9 : 0.3,
    };

    const sortedInvestments = [...availableInvestments].sort((a, b) => {
        const priorityA = investmentPriorities[a.id] || 0.2;
        const priorityB = investmentPriorities[b.id] || 0.2;
        return priorityB - priorityA;
    });

    for (const investment of sortedInvestments) {
        const investmentInfo = fullInvestmentsList.find(i => i.id === investment.id);
        if (!investmentInfo) continue;

        const [minCost, maxCost] = investmentInfo.cost.type === 'range'
            ? (investmentInfo.cost.value as [number, number])
            : [investmentInfo.cost.value as number, investmentInfo.cost.value as number];

        if (budget < minCost) continue;

        const investmentChance = (investmentPriorities[investment.id] || 0.2) * rationality;
        
        if (Math.random() < investmentChance) {
            const investmentAmount = investmentInfo.cost.type === 'range'
                ? Math.round(minCost + (maxCost - minCost) * rationality)
                : maxCost;
            
            if (budget >= investmentAmount) {
                decisions.actions.push(investment.id);
                if (!decisions.investmentCosts) {
                    decisions.investmentCosts = {};
                }
                decisions.investmentCosts[investment.id] = investmentAmount;
                budget -= investmentAmount;
            }
        }
    }
    
    // --- 3. Center Actions ---
    // Hire teacher
    if (kpis.studentTeacherRatio > 26.0 && (archetype === 'QUALITY_FOCUSED' || archetype === 'BALANCED')) {
        const hireChance = rationality * 0.8;
        if (Math.random() < hireChance && budget > 7500) {
            decisions.actions.push('P2');
        }
    }
    // Fire teacher (only if finances are dire and AI is rational enough)
    else if (kpis.cash < game.initialFunds * 0.1 && kpis.studentTeacherRatio < 24.0 && rationality > 0.7) {
        decisions.actions.push('P7');
    }

    // --- 4. Crisis Response ---
    const teamCrisisSetting = roundSettings?.[round]?.teamCrises.find(tc => tc.teamName === teamState.name);
    if (teamCrisisSetting && teamCrisisSetting.crisisIds.length > 0) {
        const crisisId = teamCrisisSetting.crisisIds[0];
        const crisisData = fullCrisesList.find(c => c.id === crisisId);
        if (crisisData && crisisData.options.length > 0) {
            let chosenOption = crisisData.options[0];
            
            if (rationality > 0.4) {
                let availableOptions = crisisData.options;
                if (crisisId === 'C1') {
                    // Filter out C1_op3 (ignore) and C1_op5 (dismiss leaders)
                    availableOptions = crisisData.options.filter(o => o.id !== 'C1_op3' && o.id !== 'C1_op5');
                }
                
                if (archetype === 'FINANCE_CONSERVATIVE') {
                    availableOptions = [...availableOptions].sort((a, b) => a.cost - b.cost);
                    chosenOption = availableOptions[0];
                } else {
                    const idx = Math.floor(Math.random() * availableOptions.length);
                    chosenOption = availableOptions[idx];
                }
            } else {
                const idx = Math.floor(Math.random() * crisisData.options.length);
                chosenOption = crisisData.options[idx];
            }

            decisions.crisisResponse = {
                crisisId: crisisData.id,
                crisisName: crisisData.name,
                option: chosenOption.label,
                optionId: chosenOption.id,
                cost: chosenOption.cost,
                justification: `Decisión tomada por la IA Rival (${archetype}).`,
                outcomeDescription: "",
            };
        }
    }

    return decisions;
}
