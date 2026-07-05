import { SimResult, DigitalTwin } from './types';

export function computeDigitalTwin(result: SimResult): DigitalTwin {
  const systemHealth = Math.min(100, Math.max(0, 100 - (result.avg || 50)));
  const recoveryPotential = Math.max(0, 90 - (result.stability || 50)) * 1.5;
  const forecastConfidence = result.yearly && result.yearly.length > 0 ? 85 : 60;
  
  const risks = result.risks || {};
  const criticalNodes = Object.entries(risks)
    .filter(([, v]) => v >= 70)
    .map(([k]) => k);
  
  const avgStability = result.stability || 50;
  const overallMaturity = Math.min(100, avgStability * 1.2);
  
  return {
    systemHealth,
    recoveryPotential,
    forecastConfidence,
    criticalNodes,
    overallMaturity
  };
}
