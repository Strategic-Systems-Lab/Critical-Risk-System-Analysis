import { SimResult, RiskEvolution, RiskDelta } from './types';
import { isValidResult } from './helpers';
import { MAJOR_CHANGE_THRESHOLD } from './constants';

const IMPROVE_THRESHOLD = -3;
const DECLINE_THRESHOLD = 3;

function magnitudeOf(delta: number): 'minor' | 'major' {
  return Math.abs(delta) >= MAJOR_CHANGE_THRESHOLD ? 'major' : 'minor';
}

/**
 * Module 3 — Risk Evolution.
 * Compares current vs previous simulation for the SAME entity/class.
 * Gracefully returns a "no previous data" report if history is absent —
 * this must never throw or crash the UI.
 */
export function evolveRisk(current: SimResult, previous?: SimResult | null): RiskEvolution {
  if (!isValidResult(previous)) {
    return {
      hasPrevious: false,
      improved: [], declined: [], stable: [], newRisks: [], resolvedRisks: [],
      trendSummary: 'No previous simulations available.',
      riskMovement: 0,
    };
  }

  const improved: RiskDelta[] = [];
  const declined: RiskDelta[] = [];
  const stable: { category: string; value: number }[] = [];
  const newRisks: { category: string; value: number }[] = [];
  const resolvedRisks: { category: string; value: number }[] = [];
  const categories = new Set([...Object.keys(current.risks || {}), ...Object.keys(previous.risks || {})]);

  let totalDelta = 0;
  let counted = 0;

  categories.forEach((category) => {
    const from = previous.risks[category];
    const to = current.risks[category];
    // Category exists on both sides — normal comparison.
    if (typeof from === 'number' && typeof to === 'number') {
      const delta = to - from;
      totalDelta += delta;
      counted += 1;
      if (delta <= IMPROVE_THRESHOLD) improved.push({ category, from, to, delta, magnitude: magnitudeOf(delta) });
      else if (delta >= DECLINE_THRESHOLD) declined.push({ category, from, to, delta, magnitude: magnitudeOf(delta) });
      else stable.push({ category, value: to });
      return;
    }
    // Category only in current — a future class introduced it, or it's genuinely new.
    if (typeof to === 'number') newRisks.push({ category, value: to });
    // Category only in previous — no longer tracked, treat as resolved (not a failure).
    else if (typeof from === 'number') resolvedRisks.push({ category, value: from });
  });

  improved.sort((a, b) => a.delta - b.delta);
  declined.sort((a, b) => b.delta - a.delta);

  const riskMovement = counted ? Math.round(totalDelta / counted) : 0;
  const trendSummary =
    riskMovement < 0
      ? 'Overall risk is trending down since the last simulation — improvements outweigh new pressures.'
      : riskMovement > 0
      ? 'Overall risk is trending up since the last simulation — new pressures outweigh improvements.'
      : 'Overall risk is holding steady since the last simulation.';

  return { hasPrevious: true, improved, declined, stable, newRisks, resolvedRisks, trendSummary, riskMovement };
}
