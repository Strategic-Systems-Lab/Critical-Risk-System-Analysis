import { risk, stab } from "../formulaHelpers";

export const CLS_LIFESTYLE = {
  icon: "🧍", label: "Lifestyle", eLabel: "Your name / household", color: "#fbbf24", hasTraits: true,
  profiles: [
    { n: "Young Professional", p: { income: 3200, expenses: 2400, savings: 8000, monthly_savings: 350, debt: 5000, discipline: 6, traits: ["variable", "noEmergency"] } },
    { n: "Family Household", p: { income: 5500, expenses: 4600, savings: 15000, monthly_savings: 450, debt: 180000, discipline: 6, traits: ["dependents", "highDebt"] } },
    { n: "Freelancer", p: { income: 2800, expenses: 2200, savings: 4000, monthly_savings: 250, debt: 2000, discipline: 5, traits: ["variable", "single", "careerRisk"] } },
    { n: "Manual", p: null },
  ],
  fields: [
    { k: "income", l: "Monthly Net Income (€)", d: 3000, lo: 0, hi: 15000 }, { k: "expenses", l: "Monthly Expenses (€)", d: 2400, lo: 0, hi: 12000 },
    { k: "savings", l: "Current Savings (€)", d: 5000, lo: 0, hi: 25000 }, { k: "monthly_savings", l: "Monthly Savings Rate (€)", d: 300, lo: 0, hi: 5000 },
    { k: "debt", l: "Total Debt (€)", d: 0, lo: 0, hi: 500000 }, { k: "discipline", l: "Financial Discipline", d: 5 },
  ],
};

export const TRAITS = [
  { k: "single", l: "Single Income" }, { k: "dependents", l: "Has Dependents" }, { k: "variable", l: "Variable Income" },
  { k: "highDebt", l: "High Debt Load" }, { k: "noEmergency", l: "No Emergency Fund" }, { k: "renting", l: "Renting (not Owning)" },
  { k: "healthCond", l: "Ongoing Health Costs" }, { k: "careerRisk", l: "Career Instability" },
];

export function simLifestyle(p, y) {
  const tr = p.traits || [];
  const has = (t) => (tr.includes(t) ? 1 : 0);
  const sv = (p.income - p.expenses) / Math.max(1, p.income);
  const risks = {
    "Income shock": risk(5 + has("variable") * 2.5 + has("single") * 1.5, p.income / 1000 + sv * 10, y, 1.2, 90, 8),
    "Lifestyle inflation": risk(10 - p.discipline, sv * 10, y, 1, 82, 8),
    "Emergency preparedness": risk(5 + has("noEmergency") * 3, p.savings / Math.max(1, p.expenses) * 2, y, 1.25, 88, 8),
    "Debt burden": risk(p.debt / Math.max(1, p.income * 12) * 10 + has("highDebt") * 2, p.discipline * .6, y, 1.2, 86, 8),
    "Career stability": risk(5 + has("careerRisk") * 2.5 + has("variable") * 1.5, p.income / 1200, y, 1.05, 82, 8),
    "Dependent load": risk(5 + has("dependents") * 3, p.income / 1000, y, .95, 78, 8),
    "Housing exposure": risk(5 + has("renting") * 2, p.savings / Math.max(1, p.expenses), y, .85, 74, 8),
    "Health cost exposure": risk(5 + has("healthCond") * 3, p.savings / Math.max(1, p.expenses) * 1.5, y, 1, 80, 8),
    "Retirement gap": risk(10 - p.discipline, sv * 8 + p.savings / Math.max(1, p.income * 12), y, .9, 78, 8),
    "Lifestyle volatility": risk(has("variable") * 3 + has("careerRisk") * 2 + 5, p.discipline * .5, y, 1, 80, 8),
  };
  const pen = tr.length * 3;
  const stability = stab(
    [p.discipline, sv * 10 + 5, p.savings / Math.max(1, p.expenses) + 3, 8, 8],
    [pen, p.debt / Math.max(1, p.income * 12) * 5, 5]
  );
  return { risks, stability };
}
