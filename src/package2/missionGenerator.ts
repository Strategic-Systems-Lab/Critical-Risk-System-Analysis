import { Mission, Priority, Difficulty, SimResult } from './types';

export function generateMissions(result: SimResult): Mission[] {
  const missions: Mission[] = [];
  const sorted = Object.entries(result.risks).sort((a, b) => b[1] - a[1]);
  
  sorted.slice(0, 3).forEach(([category, risk], idx) => {
    const priority: Priority = risk >= 70 ? 'critical' : risk >= 50 ? 'high' : 'medium';
    const difficulty: Difficulty = idx === 0 ? 'hard' : idx === 1 ? 'moderate' : 'easy';
    
    missions.push({
      id: `mission-${idx + 1}`,
      category,
      title: `Address ${category}`,
      description: `Targeted intervention to reduce ${category} risk from ${Math.round(risk)}% to below 50%.`,
      priority,
      difficulty,
      estimatedTime: difficulty === 'hard' ? '3-6 months' : difficulty === 'moderate' ? '1-3 months' : '2-4 weeks',
      expectedStabilityGain: Math.round((90 - result.stability) * 0.3),
      expectedRiskReduction: Math.round(risk * 0.4),
      status: 'pending'
    });
  });
  
  return missions;
}
