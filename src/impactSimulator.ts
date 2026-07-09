import { SimResult, Mission, ImpactProjection } from './types';
import { clamp } from './helpers';
import { STABILITY_CEILING } from './constants';

/**
 * Module 2 — Impact Simulator.
 * Approximates the effect of completing the generated missions.
 * This NEVER recalculates Package 1's risk model — it is a lightweight,
 * clearly-labelled estimate layered on top of it.
 */
export function simulateImpact(result: SimResult, missions: Mission[]): ImpactProjection {
  const currentStability = result.stability ?? 0;
  const currentRisk = result.avg ?? 0;

  // Diminishing returns: missions rarely deliver their full theoretical gain.
  const gainRaw = missions.reduce((s, m) => s + m.expectedStabilityGain, 0) * 0.55;
  const reductionRaw = missions.reduce((s, m) => s + m.expectedRiskReduction, 0) * 0.4;

  // Capped at STABILITY_CEILING, not an arbitrary 99 — Package 1's own stab()
  // formula can never itself produce a stability above this, so Package 2
  // must not promise something Package 1 could never deliver.
  const projectedStability = Math.round(clamp(currentStability + gainRaw, 0, STABILITY_CEILING));
  const projectedRisk = Math.round(clamp(currentRisk - reductionRaw, 5, 100));

  const confidence: ImpactProjection['confidence'] =
    missions.length >= 4 ? 'high' : missions.length >= 2 ? 'medium' : 'low';

  return {
    currentStability,
    projectedStability,
    currentRisk,
    projectedRisk,
    gain: projectedStability - currentStability,
    reduction: currentRisk - projectedRisk,
    confidence,
  };
}
