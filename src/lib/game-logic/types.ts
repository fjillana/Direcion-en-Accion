export interface InvestmentDecision {
  id: string;
  name: string;
  cost: number;
  effect: string;
}

export interface CrisisDecision {
  crisisName: string;
  option: string;
  justification: string;
}

export interface TeamDecisions {
  investments: InvestmentDecision[];
  tuitionPrice: number;
  crisisResponse: CrisisDecision | null;
  selectedCenterActions: string[];
}

export interface TeamKPIs {
    cash: number;
    personnelCost: number;
    income: number;
    privateIncome: number;
    publicIncome: number;
    nma: number;
    marketShare: number;
    morale: number;
    studentTeacherRatio: number;
    numStudents: number;
    numTeachers: number;
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
  decisions: TeamDecisions;
  archetype?: AIArchetype;
}
