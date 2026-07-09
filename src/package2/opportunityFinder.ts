import { SimResult, OpportunityReport, Opportunity } from './types';
import { sortedRisks, safeAvg } from './helpers';
import { THRESH } from './constants';

const STRONG_THRESHOLD = 20;
const UNTAPPED_GAP = 25;

/**
 * Module 5 — Opportunity Finder.
 * Deliberately the mirror-opposite lens of System Insights: that module
 * looks at HIGH-risk categories (threats). This module looks at LOW-risk
 * categories (strengths) — no shared computation, no duplicated logic.
 * A category must be below THRESH.ELEVATED to be called a "strength" —
 * in an all-elevated system, nothing gets mislabeled as good news.
 */
export function findOpportunities(result: SimResult): OpportunityReport {
  const risks = sortedRisks(result); // worst-first
  if (!risks.length) return { topStrengths: [], untappedStrengths: [], reallocationOpportunity: null };

  const ascending = [...risks].sort((a, b) => a[1] - b[1]); // best-first
  const avg = safeAvg(risks.map((r) => r[1]));
  const strongCandidates = ascending.filter(([, v]) => v < THRESH.ELEVATED);

  const topStrengths: Opportunity[] = strongCandidates.slice(0, 3).map(([category, value]) => ({
    category, value,
    note: category + ' is a strength at ' + Math.round(value) + '% risk — build on it to reinforce the rest of the system.',
  }));

  const untappedStrengths: Opportunity[] = ascending
    .filter(([, v]) => v <= STRONG_THRESHOLD && avg - v >= UNTAPPED_GAP)
    .slice(0, 2)
    .map(([category, value]) => ({
      category, value,
      note: category + ' is far stronger than the system average — consider actively leveraging it as a competitive advantage.',
    }));

  const [bestCat, bestVal] = ascending[0];
  const reallocationOpportunity: Opportunity | null = (bestVal < THRESH.ELEVATED && avg - bestVal >= 15) ? {
    category: bestCat, value: bestVal,
    note: 'Resources currently protecting ' + bestCat + ' (already strong) could be partially reallocated toward weaker areas for greater overall impact.',
  } : null;

  return { topStrengths, untappedStrengths, reallocationOpportunity };
}
