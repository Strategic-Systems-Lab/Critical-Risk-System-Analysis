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
/**
 * Real period life expectancy (remaining years at a given current age),
 * blended unisex approximation representative of Western Europe / Germany
 * (broadly consistent with published Destatis/OECD period life tables —
 * a blend, not one exact official table, since those differ by sex and
 * exact year). Linear interpolation between anchor points.
 */
const LIFE_TABLE = [[20,61],[30,51],[40,42],[50,33],[60,24],[65,20],[70,16],[75,12],[80,9],[85,6.5],[90,4.5]];
function remainingLifeExpectancy(age) {
  if (age <= LIFE_TABLE[0][0]) return LIFE_TABLE[0][1];
  if (age >= LIFE_TABLE[LIFE_TABLE.length - 1][0]) return LIFE_TABLE[LIFE_TABLE.length - 1][1];
  for (let i = 0; i < LIFE_TABLE.length - 1; i++) {
    const [a0, r0] = LIFE_TABLE[i], [a1, r1] = LIFE_TABLE[i + 1];
    if (age >= a0 && age <= a1) { const t = (age - a0) / (a1 - a0); return r0 + t * (r1 - r0); }
  }
}
/**
 * Years a retirement needs to be funded for, grounded in the real life
 * table above. The "family longevity" input (1-10, midpoint 5 = average)
 * applies a modest adjustment — real research shows hereditary longevity
 * effects exist but are limited, so this deliberately stays small
 * (±1.2 years per point from midpoint, capped at realistic 5-point swings)
 * rather than letting a subjective slider dominate real actuarial data.
 */
export function yearsInRetirement(age, retireAge, familyLongevity) {
  const base = remainingLifeExpectancy(age);
  const adjusted = base + (cl(familyLongevity, 1, 10) - 5) * 1.2;
  return Math.max(1, (age + adjusted) - retireAge);
}

export function mkY(st, y) { return Array.from({ length: y }, (_, i) => ({ year: i + 1, stability: i === y - 1 ? st : cl(st + (y - 1 - i) * 2 - i * 1.2 + Math.sin(i * 1.7 + st * .3) * 2.5, 15, 95) })); }

/**
 * Monte Carlo wealth projection, grounded in real historical market statistics
 * instead of an arbitrary formula.
 *
 * Return/volatility assumptions (nominal, annual, USD/EUR-denominated long-run
 * historical averages, widely cited in academic and industry sources, e.g.
 * Ibbotson/Damodaran historical return series spanning ~1926-present):
 *   - Equities (broad market index):       mean ≈ 10.0%, stdev ≈ 19.0%
 *   - Bonds/cash blend ("safe" allocation): mean ≈ 4.5%,  stdev ≈ 6.0%
 * Portfolio blend is linear in equityPct (0-100), variance blended assuming
 * independence (a simplifying, conservative assumption — real assets are
 * imperfectly correlated, so true diversification benefit is understated,
 * not overstated).
 *
 * Determinism: the simulation is seeded from a hash of the input parameters,
 * so identical inputs always produce identical output — same principle as
 * the rest of the app's forecasting, despite using genuine random sampling
 * internally.
 */
const EQUITY_MEAN = 0.10, EQUITY_STDEV = 0.19;
const SAFE_MEAN = 0.045, SAFE_STDEV = 0.06;
const MC_PATHS = 500;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randNormal(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return h >>> 0;
}

export function monteCarloWealth(start, monthlyContribution, years, equityPct) {
  const w = cl(equityPct, 0, 100) / 100;
  const mean = w * EQUITY_MEAN + (1 - w) * SAFE_MEAN;
  const stdev = Math.sqrt(w * w * EQUITY_STDEV * EQUITY_STDEV + (1 - w) * (1 - w) * SAFE_STDEV * SAFE_STDEV);
  const seed = hashSeed(`${start}|${monthlyContribution}|${years}|${equityPct}`);
  const rng = mulberry32(seed);

  const finals = [];
  const allPaths = [];
  for (let sim = 0; sim < MC_PATHS; sim++) {
    let v = start;
    const path = [v];
    for (let y = 1; y <= years; y++) {
      const r = mean + randNormal(rng) * stdev;
      v = Math.max(0, v * (1 + r) + monthlyContribution * 12);
      path.push(v);
    }
    finals.push(v);
    allPaths.push(path);
  }

  // Median path, year by year (for the existing chart — one representative line)
  const medianPath = [];
  for (let y = 0; y <= years; y++) {
    const valuesAtYear = allPaths.map(p => p[y]).sort((a, b) => a - b);
    medianPath.push(valuesAtYear[Math.floor(valuesAtYear.length / 2)]);
  }

  finals.sort((a, b) => a - b);
  const pct = (p) => finals[Math.min(finals.length - 1, Math.floor(p * finals.length))];

  return {
    start: Math.round(start),
    final: Math.round(pct(0.5)),
    p10: Math.round(pct(0.10)),
    p90: Math.round(pct(0.90)),
    pts: medianPath.map((v, i) => ({ year: i, value: Math.round(v) })),
    meanReturn: mean,
    stdevReturn: stdev,
    method: 'monte-carlo',
  };
}
