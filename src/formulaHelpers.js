/**
 * Shared formula helpers — used by App.jsx (Company class) and every file
 * in classes/. Lives outside App.jsx so it has no size constraint and so
 * class modules don't need to import from App.jsx itself (avoids circular
 * imports — App.jsx imports classes/*, classes/* import this file, never
 * the other way around).
 */
export function cl(v, lo = 1, hi = 100) { return Math.min(hi, Math.max(lo, Math.round(v))); }
export function risk(bad, good, y, s = 1, ceil = 88, fl = 8) { return cl(Math.max(fl, (38 + (bad - good) / 10 * 55 * s) * (1 + (y - 1) * .01)), fl, ceil); }
export function stab(g, b, base = 65) { return cl(base + (g.reduce((a, v) => a + v, 0) / g.length - 5) * 3.5 - (b.reduce((a, v) => a + v, 0) / b.length - 5) * 4, 24, 91); }
export function mkY(st, y) { return Array.from({ length: y }, (_, i) => ({ year: i + 1, stability: i === y - 1 ? st : cl(st + (y - 1 - i) * 2 - i * 1.2 + Math.sin(i * 1.7 + st * .3) * 2.5, 15, 95) })); }
