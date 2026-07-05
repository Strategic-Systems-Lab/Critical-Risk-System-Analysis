import { SimResult, RiskEvolution, RiskDelta } from './types';

export function trackRiskEvolution(previous: SimResult | null, current: SimResult): RiskEvolution {
  const improved: RiskDelta[] = [];
  const declined: RiskDelta[] = [];
  const stable: { category: string; value: number }[] = [];
  
  if (!previous) {
    Object.entries(current.risks).forEach(([cat, val]) => {
      if (val < 50) stable.push({ category: cat, value: val });
    });
    return {
      hasPrevious: false,
      improved: [],
      declined: [],
      stable,
      trendSummary: 'No previous data available.',
      riskMovement: 0
    };
  }
  
  let totalDelta = 0;
  let deltaCount = 0;
  
  Object.entries(current.risks).forEach(([cat, currVal]) => {
    const prevVal = previous.risks?.[cat] || currVal;
    const delta = prevVal - currVal;
    totalDelta += delta;
    deltaCount++;
    
    if (delta > 3) improved.push({ category: cat, from: prevVal, to: currVal, delta });
    else if (delta < -3) declined.push({ category: cat, from: prevVal, to: currVal, delta });
    else stable.push({ category: cat, value: currVal });
  });
  
  const avgDelta = deltaCount > 0 ? totalDelta / deltaCount : 0;
  const trendSummary = avgDelta > 5 ? 'Strong improvement' : avgDelta > 0 ? 'Modest improvement' : avgDelta < -5 ? 'Significant deterioration' : 'Relatively stable';
  
  return {
    hasPrevious: true,
    improved,
    declined,
    stable,
    trendSummary,
    riskMovement: -avgDelta
  };
}
