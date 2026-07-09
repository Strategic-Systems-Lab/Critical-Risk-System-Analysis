/**
 * PACKAGE 2 — PUBLIC ENTRY POINT
 * ================================
 * Integration into Package 1 requires exactly ONE import and ONE render call:
 *
 *   import { RiskIntelligencePanel } from './package2';
 *   ...
 *   <RiskIntelligencePanel
 *     currentResult={result}
 *     previousResult={history.find(h=>h.cls===result.cls&&h.id!==result.id)||null}
 *     historyForClass={history.filter(h=>h.cls===result.cls)}
 *     accentColor={CLS[result.cls]?.color}
 *   />
 *
 * historyForClass is optional — omit it and the Progress Tracker card just
 * shows "run at least 2 simulations" instead of erroring.
 *
 * Place it below the existing Result Page content. Package 1 is never
 * imported by Package 2, and Package 2 never touches Package 1's state,
 * routing, CSS or calculations — it only reads the finished simulation
 * object(s) that Package 1 already produces.
 */
export { generateRiskIntelligence } from './engine';
export { RiskIntelligencePanel } from './ui';
export type {
  SimResult, RiskIntelligence, Mission, ImpactProjection,
  RiskEvolution, SystemInsights, OpportunityReport, PriorityTimeline,
  Reminder, ProgressTracker, DigitalTwin,
} from './types';
