

import type { Game } from "@/hooks/use-games";
import type { TeamState, TeamDecisions, InvestmentDecision } from "./types";

/**
 * Genera las decisiones para un equipo de IA basado en su arquetipo y la dificultad del juego.
 * @param teamState El estado actual del equipo de IA.
 * @param game El objeto del juego actual, que contiene la configuración de la partida.
 * @returns Las decisiones tomadas por la IA para la ronda actual.
 */
export function getAIDecisions(teamState: TeamState, game: Game): TeamDecisions {
    const { kpis, archetype } = teamState;
    const { aiDifficulty } = game;

    const availableInvestments = game.roundSettings?.[game.round]?.investments || [];
    const decisions: TeamDecisions = {
        investments: [],
        tuitionPrice: 120,
        selectedCenterActions: [],
        crisisResponse: null,
    };

    // --- Price Decision ---
    // Adjusts price based on archetype
    if (archetype === 'AGGRESSIVE_GROWTH') {
        decisions.tuitionPrice = 110 - (aiDifficulty * 2); // Lower price to attract more students
    } else if (archetype === 'FINANCE_CONSERVATIVE') {
        decisions.tuitionPrice = 130 + (aiDifficulty * 2); // Higher price for more income
    } else {
        decisions.tuitionPrice = 115 + Math.floor(Math.random() * 10);
    }
    
    // Higher difficulty AI might adjust price based on cash reserves
    if (aiDifficulty > 3 && kpis.cash < game.initialFunds * 0.5) {
        decisions.tuitionPrice += 10; // Increase price if cash is low
    }


    // --- Investment Decisions ---
    let budget = kpis.cash * (0.2 + (aiDifficulty * 0.05)); // AI uses a % of cash for investments
    
    const potentialInvestments: Record<string, number> = {};

    // Prioritize investments based on archetype
    switch (archetype) {
        case 'AGGRESSIVE_GROWTH':
            potentialInvestments['R1'] = 0.7; // High priority for marketing
            potentialInvestments['R2'] = 0.5;
            break;
        case 'QUALITY_FOCUSED':
            potentialInvestments['P1'] = 0.8; // High priority for teacher training
            potentialInvestments['R2'] = 0.6; // TIC
            potentialInvestments['P2'] = 0.5; // Hire teachers
            break;
        case 'FINANCE_CONSERVATIVE':
            potentialInvestments['F1'] = 0.6; // ERP to reduce costs
            // This archetype is less likely to invest
            break;
        case 'BALANCED':
            potentialInvestments['R1'] = 0.4;
            potentialInvestments['P1'] = 0.4;
            potentialInvestments['R2'] = 0.4;
            break;
    }
    
    // Higher difficulty AI is more likely to make investments
    const investmentLikelihood = 0.5 + (aiDifficulty * 0.1);

    for (const investment of availableInvestments) {
        const priority = potentialInvestments[investment.id] || 0.2; // Base priority for non-listed investments
        const costRange = investment.costRange.replace(/[^0-9-]/g, '').split('-').map(Number);
        
        // AI always invests the maximum amount for simplicity and impact
        const cost = costRange.length > 1 ? costRange[1] : costRange[0];

        if (Math.random() < investmentLikelihood * priority && budget >= cost) {
            // Higher difficulty AI checks if it can afford it more strictly
            if (aiDifficulty > 3 && (kpis.cash - cost) < (game.initialFunds * 0.2)) {
                continue; // Skip if it leaves cash too low
            }
            
            decisions.investments.push({ ...investment, cost });
            budget -= cost;
        }
    }

    // --- Center Actions ---
    // AI might hire teachers if ratio is bad, especially if quality-focused
    if (kpis.studentTeacherRatio > 26.0 && (archetype === 'QUALITY_FOCUSED' || archetype === 'BALANCED')) {
        if (aiDifficulty > 2 && budget > 7500) {
            decisions.selectedCenterActions.push('P2'); // Contratar docente
        }
    }


    // Ensure arrays are always defined
    return {
        ...decisions,
        investments: decisions.investments || [],
        selectedCenterActions: decisions.selectedCenterActions || [],
    };
}
