import { SimResult } from './types';

/** Matches Package 1's real output shape exactly — safe to swap in via DEMO_MODE. */
export const DEMO_CURRENT: SimResult = {
  cls: '1',
  label: 'Company',
  icon: '🏢',
  entity: 'Demo Corp',
  years: 5,
  stability: 58,
  avg: 52,
  worst: 'Cyber',
  best: 'Governance',
  risks: {
    Burnout: 61, Financial: 48, Cyber: 74, Governance: 22, Market: 55,
    Dependency: 40, Operational: 35, 'Knowledge loss': 30, Automation: 58, Reputation: 44,
  },
  date: new Date().toLocaleDateString(),
};

export const DEMO_PREVIOUS: SimResult = {
  ...DEMO_CURRENT,
  id: 2,
  stability: 50,
  avg: 58,
  risks: {
    Burnout: 66, Financial: 52, Cyber: 70, Governance: 28, Market: 60,
    Dependency: 46, Operational: 40, 'Knowledge loss': 34, Automation: 50, Reputation: 50,
  },
};

const DEMO_OLDEST: SimResult = {
  ...DEMO_CURRENT,
  id: 1,
  stability: 42,
  avg: 64,
  risks: {
    Burnout: 70, Financial: 58, Cyber: 66, Governance: 34, Market: 64,
    Dependency: 50, Operational: 46, 'Knowledge loss': 40, Automation: 46, Reputation: 54,
  },
};

/** id=1 (oldest) -> id=2 -> id=3 (current), enough points for the Progress Tracker. */
export const DEMO_HISTORY: SimResult[] = [{ ...DEMO_CURRENT, id: 3 }, DEMO_PREVIOUS, DEMO_OLDEST];
