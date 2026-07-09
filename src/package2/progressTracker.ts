import { SimResult, ProgressTracker } from './types';
import { evolveRisk } from './riskEvolution';

/**
 * Module 8 — Risk Improvement Tracker.
 * Takes ALL past runs for one class (not just current vs. previous) and
 * shows the long-term trajectory. Reuses evolveRisk() for the first-vs-last
 * category comparison instead of re-implementing that logic.
 */
export function trackProgress(historyForClass: SimResult[]): ProgressTracker {
  const valid = (historyForClass || []).filter((r) => r && r.risks);
  if (valid.length < 2) {
    return {
      hasEnoughData: false,
      points: [],
      longTermImproved: [],
      longTermDeclined: [],
      summary: 'Run at least 2 simulations for this class to see your progress over time.',
    };
  }

  // Package 1 prepends new entries (id = Date.now()), so sort oldest -> newest.
  const chronological = [...valid].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

  const points = chronological.map((r, i) => ({
    label: r.date || 'Run ' + (i + 1),
    stability: r.stability ?? 0,
    avg: r.avg ?? 0,
  }));

  const first = chronological[0];
  const last = chronological[chronological.length - 1];
  const longTerm = evolveRisk(last, first);

  const stabilityDelta = (last.stability ?? 0) - (first.stability ?? 0);
  const summary =
    stabilityDelta > 0
      ? 'Stability has improved by ' + stabilityDelta + '% across ' + chronological.length + ' simulations.'
      : stabilityDelta < 0
      ? 'Stability has declined by ' + Math.abs(stabilityDelta) + '% across ' + chronological.length + ' simulations.'
      : 'Stability has held steady across ' + chronological.length + ' simulations.';

  // Recent (last 2 runs) trend — only meaningfully different from the overall
  // summary once there are 3+ points; with exactly 2, they'd just repeat.
  let recentTrend: string | undefined;
  if (chronological.length >= 3) {
    const secondLast = chronological[chronological.length - 2];
    const recentDelta = (last.stability ?? 0) - (secondLast.stability ?? 0);
    recentTrend =
      recentDelta > 0
        ? 'Short-term: stability rose ' + recentDelta + '% in the most recent run.'
        : recentDelta < 0
        ? 'Short-term: stability dropped ' + Math.abs(recentDelta) + '% in the most recent run.'
        : 'Short-term: stability was unchanged in the most recent run.';
  }

  return { hasEnoughData: true, points, longTermImproved: longTerm.improved, longTermDeclined: longTerm.declined, summary, recentTrend };
}
