import { SimResult, ImpactProjection } from './types';

export function calculateImpact(current: SimResult, projected: SimResult): ImpactProjection {
  const currentStability = current.stability || 50;
  const projectedStability = projected.stability || currentStability;
  const currentRisk = current.avg || 50;
  const projectedRisk = projected.avg || currentRisk;
  
  const gain = Math.max(0, projectedStability - currentStability);
  const reduction = Math.max(0, currentRisk - projectedRisk);
  
  const confidence: 'low' | 'medium' | 'high' = 
    gain > 15 ? 'high' : gain > 5 ? 'medium' : 'low';
  
  return {
    currentStability,
    projectedStability,
    currentRisk,
    projectedRisk,
    gain,
    reduction,
    confidence
  };
}
