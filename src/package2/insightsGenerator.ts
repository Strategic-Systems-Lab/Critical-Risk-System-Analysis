import { SimResult, SystemInsights, HiddenDependency } from './types';

export function generateInsights(result: SimResult): SystemInsights {
  const sorted = Object.entries(result.risks).sort((a, b) => b[1] - a[1]);
  
  const topOpportunities = sorted
    .filter(([, v]) => v < 50)
    .slice(0, 3)
    .map(([k]) => k);
  
  const biggestThreat = sorted[0]?.[0] || 'Unknown';
  const highestLeverage = sorted[sorted.length - 1]?.[0] || 'Unknown';
  
  const quickWins = sorted
    .filter(([, v]) => v >= 40 && v < 60)
    .slice(0, 3)
    .map(([k]) => k);
  
  const hiddenDependencies: HiddenDependency[] = [];
  if (sorted.length >= 2) {
    hiddenDependencies.push({
      a: sorted[0][0],
      b: sorted[1][0],
      note: 'Top two risks may reinforce each other'
    });
  }
  
  return {
    topOpportunities,
    biggestThreat,
    highestLeverage,
    quickWins,
    hiddenDependencies
  };
}
