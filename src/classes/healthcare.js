import { risk, stab } from "../formulaHelpers";

export const CLS_HEALTHCARE = {
  icon: "🏥", label: "Healthcare", eLabel: "Hospital / System", color: "#ff6b9d",
  profiles: [
    { n: "National Health", p: { funding: 7, staff: 5000, beds: 8, digitization: 6, cybersec: 5, pharma_supply: 7, prevention: 6, research: 6, equity: 6, crisis_capacity: 6, burnout: 4, regulation: 7 } },
    { n: "Regional Hospital", p: { funding: 5, staff: 600, beds: 5, digitization: 5, cybersec: 4, pharma_supply: 6, prevention: 5, research: 3, equity: 5, crisis_capacity: 4, burnout: 6, regulation: 6 } },
    { n: "Underfunded", p: { funding: 2, staff: 800, beds: 3, digitization: 2, cybersec: 2, pharma_supply: 3, prevention: 2, research: 2, equity: 2, crisis_capacity: 2, burnout: 9, regulation: 3 } },
    { n: "Manual", p: null },
  ],
  fields: [
    { k: "funding", l: "Funding", d: 5 }, { k: "staff", l: "Staff", d: 1000, lo: 1, hi: 3000 }, { k: "beds", l: "Bed Capacity", d: 5 },
    { k: "digitization", l: "Digitization", d: 5 }, { k: "cybersec", l: "Cybersecurity", d: 5 }, { k: "pharma_supply", l: "Pharma Supply", d: 5 },
    { k: "prevention", l: "Prevention", d: 5 }, { k: "research", l: "Research", d: 5 }, { k: "equity", l: "Equity", d: 5 },
    { k: "crisis_capacity", l: "Crisis Capacity", d: 5 }, { k: "burnout", l: "Burnout Risk", d: 4 }, { k: "regulation", l: "Regulation", d: 5 },
  ],
};

export function simHealthcare(p, y) {
  const risks = {
    "Staff burnout": risk(p.burnout * 1.2, (p.funding + Math.min(10, p.staff / 1000)) / 2, y, 1.35, 92, 10),
    "Supply failure": risk(10 - p.pharma_supply, p.funding * .9, y, 1.1, 84, 8),
    Cyber: risk(p.digitization * .95, p.cybersec * 1.1, y, 1.3, 88, 12),
    "Capacity overload": risk(10 - p.beds, p.crisis_capacity, y, 1.2, 86, 8),
    "Equity gap": risk(10 - p.equity, p.funding, y, 1, 80, 8),
    "Prevention failure": risk(10 - p.prevention, p.funding * .8, y, .95, 76, 10),
    "Research lag": risk(10 - p.research, p.digitization * .8, y, .75, 68, 10),
    "Regulation gap": risk(10 - p.regulation, p.funding * .5, y, .85, 72, 7),
    "Financial strain": risk(10 - p.funding, p.regulation * .4, y, 1.15, 88, 8),
    "System collapse": risk((10 - p.funding + 10 - p.crisis_capacity) / 2, p.prevention, y, 1, 80, 7),
  };
  const stability = stab(
    [p.funding, p.prevention, p.regulation, p.crisis_capacity, Math.min(10, p.staff / 1000 + 3)],
    [p.burnout * 1.1, 10 - p.pharma_supply, 10 - p.beds]
  );
  return { risks, stability };
}
