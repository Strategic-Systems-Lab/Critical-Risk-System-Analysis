import { SimResult, DigitalTwin } from './types';
import { sortedRisks } from './helpers';

/**
 * Module 9 (OPTIONAL) — Digital Twin.
 * Composite, approximate metrics only. First candidate for removal if the
 * artifact ever exceeds the 59.99 KB limit — Modules 1-8 never depend on it.
 */
export function generateDigitalTwin(result: SimResult): DigitalTwin {
  const risks = sortedRisks(result);
  const systemHealth = result.stability ?? 0;
  const avg = result.avg ?? 50;

  const recoveryPotential = Math.min(99, Math.round(Math.max(10, 100 - avg) * 0.8 + systemHealth * 0.2));

  const values = risks.map((r) => r[1]);
  const variance = values.length > 1 ? Math.max(...values) - Math.min(...values) : 0;
  const forecastConfidence = Math.max(30, Math.round(100 - variance));

  const criticalNodes = risks.slice(0, 3).map(([c]) => c);
  const overallMaturity = Math.round((systemHealth + forecastConfidence + recoveryPotential) / 3);

  return { systemHealth, recoveryPotential, forecastConfidence, criticalNodes, overallMaturity };
}
