import { SimResult, RiskIntelligence } from './types';
import { generateMissions } from './missionGenerator';
import { calculateImpact } from './impactCalculator';
import { trackRiskEvolution } from './riskEvolutionTracker';
import { generateInsights } from './insightsGenerator';
import { computeDigitalTwin } from './digitalTwinEngine';

export function createRiskIntelligence(
  current: SimResult,
  previous: SimResult | null = null
): RiskIntelligence {
  const missions = generateMissions(current);
  const impact = calculateImpact(current, current);
  const evolution = trackRiskEvolution(previous, current);
  const insights = generateInsights(current);
  const digitalTwin = computeDigitalTwin(current);
  
  return {
    missions,
    impact,
    evolution,
    insights,
    digitalTwin,
    generatedAt: new Date().toISOString()
  };
}
