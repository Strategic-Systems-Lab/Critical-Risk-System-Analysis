import { SimResult } from './types';

export function clamp(v: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Risk categories sorted worst-first. Never mutates input. */
export function sortedRisks(result: SimResult): [string, number][] {
  const risks = result?.risks || {};
  return Object.entries(risks)
    .filter(([, v]) => typeof v === 'number' && !Number.isNaN(v))
    .sort((a, b) => b[1] - a[1]);
}

export function safeAvg(nums: number[]): number {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function isValidResult(r: any): r is SimResult {
  return !!r && typeof r === 'object' && r.risks && typeof r.risks === 'object';
}
