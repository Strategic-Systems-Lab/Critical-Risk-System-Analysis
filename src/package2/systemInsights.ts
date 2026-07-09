import { SimResult, SystemInsights, HiddenDependency, Mission } from './types';
import { sortedRisks } from './helpers';

const CORRELATION_GAP = 4; // categories within this % of each other, both elevated

/**
 * Module 4 — System Insights.
 * Everything here is derived purely from the numeric risk values already
 * present in the simulation output — no invented / random filler text.
 * highestLeverage reuses Mission Engine's own expectedStabilityGain instead
 * of guessing from list position — no duplicated computation.
 */
export function generateInsights(result: SimResult, missions: Mission[]): SystemInsights {
  const risks = sortedRisks(result);
  if (!risks.length) {
    return { topOpportunities: [], biggestThreat: 'Unknown', highestLeverage: 'Unknown', quickWins: [], hiddenDependencies: [] };
  }

  const biggestThreat = risks[0][0];
  const topOpportunities = risks.slice(0, 3).map(([c]) => c);

  // Highest leverage: the mission (excluding the biggest threat itself) with
  // the largest expected stability gain — a real, computed value, not a guess.
  const leverageCandidates = missions.filter((m) => m.category !== biggestThreat);
  const bestLeverageMission = [...leverageCandidates].sort((a, b) => b.expectedStabilityGain - a.expectedStabilityGain)[0];
  const highestLeverage = bestLeverageMission ? bestLeverageMission.category : (risks.length > 1 ? risks[1][0] : risks[0][0]);

  const quickWins = risks.filter(([, v]) => v >= 30 && v < 50).slice(0, 3).map(([c]) => c);

  const hiddenDependencies: HiddenDependency[] = [];
  for (let i = 0; i < risks.length && hiddenDependencies.length < 3; i++) {
    for (let j = i + 1; j < risks.length && hiddenDependencies.length < 3; j++) {
      const [a, va] = risks[i];
      const [b, vb] = risks[j];
      if (va >= 50 && Math.abs(va - vb) <= CORRELATION_GAP) {
        hiddenDependencies.push({ a, b, note: a + ' and ' + b + ' move together and may share a root cause.' });
      }
    }
  }

  return { topOpportunities, biggestThreat, highestLeverage, quickWins, hiddenDependencies };
}
