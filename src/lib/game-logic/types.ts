
import type { RoundDecisions, TeamPerformanceData } from "@/hooks/use-games";


export interface InvestmentDecision {
  id: string;
  name: string;
  cost: number;
}

export interface CrisisDecision {
  crisisName: string;
  option: string;
  justification: string;
}

export interface TeamDecisions {
  actions: string[];
  tuitionPrice: number;
  crisisResponse: CrisisDecision | null;
  poachingSuccess?: boolean;
}

export interface TeamKPIs {
    cash: number;
    personnelCost: number;
    income: number;
    privateIncome: number;
    publicIncome: number;
    baseNma?: number; // NMA before ratio modifiers
    nma: number;
    marketShare: number;
    morale: number;
    studentTeacherRatio: number;
    numStudents: number;
    numTeachers: number;
    capacity: number;
    loanInterest?: number;
    loanIncome?: number;
    loanRepayment?: number;
    crisisImpact?: number;
    cashInjection?: number;
}

export type AIArchetype = 'BALANCED' | 'AGGRESSIVE_GROWTH' | 'FINANCE_CONSERVATIVE' | 'QUALITY_FOCUSED';

export interface StrategicPlan {
  confirmed: boolean;
  rankingGoal: string;
  targets: {
    cash: { target: number; operator: 'min' | 'max' };
    personnelCost: { target: number; operator: 'min' | 'max' };
    nma: { target: number; operator: 'min' | 'max' };
    marketShare: { target: number; operator: 'min' | 'max' };
    morale: { target: number; operator: 'min' | 'max' };
    studentTeacherRatio: { target: number; operator: 'min' | 'max' };
  }
}

export interface TeamState {
  name: string;
  type: 'H' | 'IA';
  kpis: TeamKPIs;
  decisions: RoundDecisions;
  archetype?: AIArchetype;
  performanceHistory: TeamPerformanceData[];
}
