import { Mission, RiskEvolution, Reminder } from './types';

/**
 * Module 7 — Smart Reminder Engine.
 * Purely interprets already-computed data (missions, evolution) into
 * actionable, non-spammy reminders. No fresh risk calculation happens here.
 */
export function generateReminders(missions: Mission[], evolution: RiskEvolution): Reminder[] {
  const reminders: Reminder[] = [];

  if (missions.length > 0) {
    reminders.push({
      id: 'reminder-open-missions',
      type: 'mission',
      message: 'You have ' + missions.length + ' open mission' + (missions.length > 1 ? 's' : '') + '. Revisit progress in 7 days.',
      urgency: missions.some((m) => m.priority === 'critical') ? 'high' : 'medium',
    });
  }

  if (evolution.hasPrevious && evolution.riskMovement > 0) {
    reminders.push({
      id: 'reminder-risk-increase',
      type: 'alert',
      message: 'Risk has increased since your last simulation — worth reviewing now rather than waiting.',
      urgency: 'high',
    });
  }

  if (evolution.newRisks.length > 0) {
    reminders.push({
      id: 'reminder-new-risks',
      type: 'alert',
      message: evolution.newRisks.length + ' new risk categor' + (evolution.newRisks.length > 1 ? 'ies' : 'y') + ' appeared since last time.',
      urgency: 'medium',
    });
  }

  // Recheck cadence responds to actual urgency instead of a flat, sometimes
  // contradictory "30 days" even when other cards above are flashing red.
  const urgent = missions.some((m) => m.priority === 'critical') || (evolution.hasPrevious && evolution.riskMovement > 5);
  reminders.push({
    id: 'reminder-recheck',
    type: 'schedule',
    message: urgent
      ? 'Given the current risk level, a new simulation in about 14 days is recommended instead of the usual 30.'
      : 'A new simulation is recommended in about 30 days to keep your risk profile current.',
    urgency: urgent ? 'medium' : 'low',
  });

  return reminders;
}
