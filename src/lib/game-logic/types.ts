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
    nma: number;
    marketShare: number;
    morale: number;
    studentTeacherRatio: number;
    numStudents: number;
    numTeachers: number;
}

export type AIArchetype = 'BALANCED' | 'AGGRESSIVE_GROWTH' | 'FINANCE_CONSERVATIVE' | 'QUALITY_FOCUSED';


export interface TeamState {
  name: string;
  type: 'H' | 'IA';
  kpis: TeamKPIs;
  decisions: TeamDecisions;
  archetype?: AIArchetype;
}

export type StrategicPlan = {
  confirmed: boolean;
  rankingGoal: string;
  targets: {
    [key: string]: {
      target: number;
      operator: 'min' | 'max' | 'range';
      range_max?: number;
    }
  }
}
