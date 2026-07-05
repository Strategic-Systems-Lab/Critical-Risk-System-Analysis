/**
 * Package 2 — Types
 * Mirrors Package 1's generic simulation output. Never redefines Package 1
 * logic — this is a read-only view of the shape Package 1 already produces.
 * The index signature guarantees future classes / new fields never break
 * type-checking here.
 */

export interface SimResult {
  id?: number | string;
  cls: string;
  label: string;
  icon?: string;
  entity: string;
  years: number;
  stability: number;          // Overall Stability
  avg: number;                 // Overall Risk
  worst: string;                // Weakest Area / dominant risk category
  best: string;                  // Strongest Area
  risks: Record<string, number>; // Risk Categories -> Risk Percentages
  yearly?: { year: number; stability: number }[]; // Forecast
  date?: string;
  [k: string]: any; // unknown fields from future classes are ignored safely
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface Mission {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: Priority;
  difficulty: Difficulty;
  estimatedTime: string;
  expectedStabilityGain: number;
  expectedRiskReduction: number;
  status: 'pending';
}

export interface ImpactProjection {
  currentStability: number;
  projectedStability: number;
  currentRisk: number;
  projectedRisk: number;
  gain: number;
  reduction: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface RiskDelta { category: string; from: number; to: number; delta: number }

export interface RiskEvolution {
  hasPrevious: boolean;
  improved: RiskDelta[];
  declined: RiskDelta[];
  stable: { category: string; value: number }[];
  trendSummary: string;
  riskMovement: number; // average delta, positive = worse
}

export interface HiddenDependency { a: string; b: string; note: string }

export interface SystemInsights {
  topOpportunities: string[];
  biggestThreat: string;
  highestLeverage: string;
  quickWins: string[];
  hiddenDependencies: HiddenDependency[];
}

export interface DigitalTwin {
  systemHealth: number;
  recoveryPotential: number;
  forecastConfidence: number;
  criticalNodes: string[];
  overallMaturity: number;
}

export interface RiskIntelligence {
  missions: Mission[];
  impact: ImpactProjection;
  evolution: RiskEvolution;
  insights: SystemInsights;
  digitalTwin?: DigitalTwin;
  generatedAt: string;
}
