import { SimResult, Mission } from './types';
import { sortedRisks, slug } from './helpers';
import { priorityFor, difficultyFor, TIME_BY_DIFFICULTY, THRESH } from './constants';
import { getDriverHint } from './driverHints';

const VERBS = ['Reduce', 'Strengthen controls around', 'Mitigate', 'Address', 'Stabilize'];

/**
 * Module 1 — Mission Engine.
 * Turns the worst N risk categories into concrete, generic missions.
 * Works for ANY category name from ANY class — nothing is hardcoded.
 * Only categories at or above THRESH.STABLE become missions — a genuinely
 * healthy simulation should not get fabricated "fixes" for near-zero risks.
 * When a driver hint exists for this class/category (see driverHints.ts),
 * the description names the actual input to adjust instead of staying
 * generic — falls back gracefully when no hint is known (future classes).
 */
export function generateMissions(result: SimResult, max = 5): Mission[] {
  const risks = sortedRisks(result).filter(([, value]) => value >= THRESH.STABLE);
  if (!risks.length) return [];

  return risks.slice(0, max).map(([category, value], i) => {
    const difficulty = difficultyFor(value);
    const priority = priorityFor(value);
    const verb = VERBS[i % VERBS.length];
    const gain = Math.round(clampGain(value));
    const hint = getDriverHint(result, category);
    const description =
      category + ' currently sits at ' + Math.round(value) + '%. ' +
      (hint
        ? 'Try adjusting: ' + hint + '.'
        : 'Focused action here offers the largest available impact on overall stability.');
    return {
      id: 'mission-' + slug(category) + '-' + i,
      category,
      title: verb + ' ' + category,
      description,
      priority,
      difficulty,
      estimatedTime: TIME_BY_DIFFICULTY[difficulty],
      expectedStabilityGain: gain,
      expectedRiskReduction: Math.round(value * 0.25),
      status: 'pending',
      hint,
    };
  });
}

function clampGain(value: number): number {
  return Math.max(2, Math.min(15, value / 6));
}
