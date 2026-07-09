import { SimResult, RiskIntelligence } from './types';
import { generateMissions } from './missionEngine';
import { simulateImpact } from './impactSimulator';
import { evolveRisk } from './riskEvolution';
import { generateInsights } from './systemInsights';
import { findOpportunities } from './opportunityFinder';
import { buildPriorityTimeline } from './priorityTimeline';
import { generateReminders } from './reminderEngine';
import { trackProgress } from './progressTracker';
import { generateDigitalTwin } from './digitalTwin';
import { DEMO_MODE } from './config';
import { FEATURES } from './constants';
import { DEMO_CURRENT, DEMO_PREVIOUS, DEMO_HISTORY } from './demoData';
import { isValidResult } from './helpers';

// Read Package 1 data only once per render; avoids duplicated calculations.
// Keyed on BOTH current and previous — a cache hit only counts if neither changed.
const cache = new WeakMap<object, { prevRef: object | null | undefined; historyLen: number; report: RiskIntelligence }>();

/**
 * PUBLIC API — the only function Package 1 (or any consumer) should call.
 * Never throws. Never mutates its inputs. Never recalculates Package 1's
 * risk model — it only reads the finished simulation output.
 */
export function generateRiskIntelligence(
  simulationResult: SimResult,
  previousSimulation?: SimResult | null,
  historyForClass?: SimResult[]
): RiskIntelligence {
  const current = DEMO_MODE ? DEMO_CURRENT : simulationResult;
  const previous = DEMO_MODE ? DEMO_PREVIOUS : previousSimulation;
  const history = DEMO_MODE ? DEMO_HISTORY : (historyForClass || []);

  if (!isValidResult(current)) return fallback();

  if (!DEMO_MODE) {
    const cached = cache.get(current as object);
    if (cached && cached.prevRef === previous && cached.historyLen === history.length) return cached.report;
  }

  try {
    const missions = generateMissions(current);
    const impact = simulateImpact(current, missions);
    const evolution = evolveRisk(current, previous);
    const insights = generateInsights(current, missions);
    const opportunities = findOpportunities(current);
    const priorityTimeline = buildPriorityTimeline(missions);
    const reminders = generateReminders(missions, evolution);
    const progress = trackProgress(history);
    const digitalTwin = FEATURES.ENABLE_DIGITAL_TWIN ? generateDigitalTwin(current) : undefined;

    const report: RiskIntelligence = {
      missions, impact, evolution, insights, opportunities, priorityTimeline, reminders, progress, digitalTwin,
      generatedAt: new Date().toISOString(),
    };

    if (!DEMO_MODE) cache.set(current as object, { prevRef: previous, historyLen: history.length, report });
    return report;
  } catch {
    return fallback();
  }
}

function fallback(): RiskIntelligence {
  return {
    missions: [],
    impact: { currentStability: 0, projectedStability: 0, currentRisk: 0, projectedRisk: 0, gain: 0, reduction: 0, confidence: 'low' },
    evolution: { hasPrevious: false, improved: [], declined: [], stable: [], newRisks: [], resolvedRisks: [], trendSummary: 'No previous simulations available.', riskMovement: 0 },
    insights: { topOpportunities: [], biggestThreat: 'Unknown', highestLeverage: 'Unknown', quickWins: [], hiddenDependencies: [] },
    opportunities: { topStrengths: [], untappedStrengths: [], reallocationOpportunity: null },
    priorityTimeline: { today: [], thisWeek: [], thisMonth: [], nextQuarter: [] },
    reminders: [],
    progress: { hasEnoughData: false, points: [], longTermImproved: [], longTermDeclined: [], summary: 'No previous simulations available.' },
    digitalTwin: undefined,
    generatedAt: new Date().toISOString(),
  };
}
