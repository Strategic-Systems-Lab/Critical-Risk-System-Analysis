import { Mission, PriorityTimeline } from './types';

/**
 * Module 6 — Priority Timeline.
 * Pure regrouping of missions already produced by the Mission Engine —
 * intentionally reuses that output instead of recalculating anything.
 */
export function buildPriorityTimeline(missions: Mission[]): PriorityTimeline {
  return {
    today: missions.filter((m) => m.priority === 'critical'),
    thisWeek: missions.filter((m) => m.priority === 'high'),
    thisMonth: missions.filter((m) => m.priority === 'medium'),
    nextQuarter: missions.filter((m) => m.priority === 'low'),
  };
}
