import { Priority, Difficulty } from './types';

export const THRESH = { CRITICAL: 70, ELEVATED: 50, STABLE: 30 };

export const FEATURES = { ENABLE_DIGITAL_TWIN: true };

// Matches the real ceiling of Package 1's own stab() formula — Package 2
// must never project a stability value Package 1 could never itself produce.
export const STABILITY_CEILING = 91;

// A category move of this magnitude or more is flagged as a "major" shift
// in Risk Evolution, vs. a smaller/gradual "minor" shift.
export const MAJOR_CHANGE_THRESHOLD = 10;

export const TIME_BY_DIFFICULTY: Record<Difficulty, string> = {
  hard: '3-6 months',
  moderate: '1-2 months',
  easy: '1-2 weeks',
};

export function priorityFor(value: number): Priority {
  if (value >= THRESH.CRITICAL) return 'critical';
  if (value >= THRESH.ELEVATED) return 'high';
  if (value >= THRESH.STABLE) return 'medium';
  return 'low';
}

export function difficultyFor(value: number): Difficulty {
  if (value >= THRESH.CRITICAL) return 'hard';
  if (value >= THRESH.ELEVATED) return 'moderate';
  return 'easy';
}

export const PRIORITY_COLOR: Record<Priority, string> = {
  critical: '#ff2d55',
  high: '#ff6b35',
  medium: '#ffd700',
  low: '#00ff9d',
};
