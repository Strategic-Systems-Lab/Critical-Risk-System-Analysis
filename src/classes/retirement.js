import { risk, stab, yearsInRetirement } from "../formulaHelpers";

export const CLS_RETIREMENT = {
  icon: "🏦", label: "Retirement", eLabel: "Your name / plan", color: "#a78bfa", maxYears: 60,
  profiles: [
    { n: "Early Planner", p: { age: 30, retire_age: 65, pension_assets: 25000, monthly_contribution: 400, equity_pct: 80, diversification: 7, inflation_protection: 6, healthcare_buffer: 5, state_pension_reliance: 4, life_expectancy: 6, discipline: 7 } },
    { n: "Mid-Career Catchup", p: { age: 45, retire_age: 67, pension_assets: 90000, monthly_contribution: 600, equity_pct: 55, diversification: 6, inflation_protection: 5, healthcare_buffer: 5, state_pension_reliance: 6, life_expectancy: 6, discipline: 6 } },
    { n: "Pre-Retirement", p: { age: 58, retire_age: 65, pension_assets: 280000, monthly_contribution: 800, equity_pct: 30, diversification: 5, inflation_protection: 6, healthcare_buffer: 6, state_pension_reliance: 7, life_expectancy: 7, discipline: 7 } },
    { n: "Manual", p: null },
  ],
  fields: [
    { k: "age", l: "Current Age", d: 35, lo: 18, hi: 75 }, { k: "retire_age", l: "Target Retirement Age", d: 65, lo: 50, hi: 75 },
    { k: "pension_assets", l: "Current Pension Assets (€)", d: 40000, lo: 0, hi: 500000 }, { k: "monthly_contribution", l: "Monthly Contribution (€)", d: 400, lo: 0, hi: 3000 },
    { k: "equity_pct", l: "Equity Allocation (%)", d: 60, lo: 0, hi: 100 }, { k: "diversification", l: "Diversification", d: 5 },
    { k: "inflation_protection", l: "Inflation Protection", d: 5 }, { k: "healthcare_buffer", l: "Healthcare Buffer", d: 5 },
    { k: "state_pension_reliance", l: "State Pension Reliance", d: 5 }, { k: "life_expectancy", l: "Family Longevity", d: 5 }, { k: "discipline", l: "Contribution Discipline", d: 5 },
  ],
};

export function simRetirement(p, y) {
  const yrsLeft = Math.max(1, p.retire_age - p.age);
  const risks = {
    "Sequence-of-returns risk": risk(p.equity_pct / 10, (10 - Math.max(0, 10 - yrsLeft / 3)) * .6 + p.diversification * .4, y, 1.25, 90, 8),
    "Inflation erosion": risk(10 - p.inflation_protection, p.equity_pct / 12, y, 1.1, 84, 8),
    "Contribution gap": risk(10 - (p.monthly_contribution / Math.max(1, p.pension_assets / 100 + 50) * 10), p.discipline * .5, y, 1.05, 82, 8),
    "Longevity risk": risk(yearsInRetirement(p.age, p.retire_age, p.life_expectancy) / 3.5, p.pension_assets / Math.max(1, p.monthly_contribution * 150) * 2 + p.diversification * .3, y, 1.15, 86, 8),
    "Healthcare cost exposure": risk(10 - p.healthcare_buffer, p.diversification * .4, y, 1.1, 84, 8),
    "State pension shortfall": risk(10 - p.state_pension_reliance, p.pension_assets / Math.max(1, p.monthly_contribution * 100) * 2, y, .95, 78, 8),
    "Early retirement risk": risk(Math.max(0, 10 - yrsLeft), p.pension_assets / Math.max(1, p.monthly_contribution * 1000) * 2, y, 1, 80, 7),
    "Market concentration": risk(10 - p.diversification, p.equity_pct < 80 ? 6 : 3, y, .9, 76, 8),
    "Withdrawal rate risk": risk(p.equity_pct / 15 + 3, p.diversification * .5 + p.healthcare_buffer * .3, y, 1.05, 82, 8),
    "Behavioural risk": risk(10 - p.discipline, p.diversification * .4, y, .85, 74, 8),
  };
  const stability = stab(
    [p.discipline, p.diversification, p.inflation_protection, p.healthcare_buffer, Math.min(10, yrsLeft / 3 + 3)],
    [p.equity_pct / 12, 10 - p.state_pension_reliance, p.life_expectancy / 12]
  );
  return { risks, stability };
}
