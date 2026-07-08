import { risk, stab } from "../formulaHelpers";

export const CLS_REALESTATE = {
  icon: "🏠", label: "Real Estate", eLabel: "Property / Portfolio name", color: "#34d399",
  profiles: [
    { n: "Rental Portfolio", p: { location_quality: 7, mortgage: 400000, rent_income: 3200, monthly_costs: 1400, occupancy: 8, tenant_quality: 7, cashflow: 6, leverage: 5, maintenance: 6, market_liquidity: 5, regulation_fit: 6, insurance: 6, diversification: 5, climate_exposure: 4 } },
    { n: "Commercial RE", p: { location_quality: 6, mortgage: 650000, rent_income: 5000, monthly_costs: 2600, occupancy: 6, tenant_quality: 5, cashflow: 5, leverage: 7, maintenance: 5, market_liquidity: 4, regulation_fit: 5, insurance: 5, diversification: 4, climate_exposure: 5 } },
    { n: "Overleveraged", p: { location_quality: 4, mortgage: 900000, rent_income: 2200, monthly_costs: 2100, occupancy: 5, tenant_quality: 4, cashflow: 3, leverage: 9, maintenance: 3, market_liquidity: 2, regulation_fit: 4, insurance: 3, diversification: 2, climate_exposure: 6 } },
    { n: "Manual", p: null },
  ],
  fields: [
    { k: "location_quality", l: "Location Quality", d: 5 }, { k: "mortgage", l: "Mortgage / Debt (€)", d: 300000, lo: 0, hi: 2000000 },
    { k: "rent_income", l: "Monthly Rent (€)", d: 2500, lo: 0, hi: 20000 }, { k: "monthly_costs", l: "Monthly Costs (€)", d: 1200, lo: 0, hi: 10000 },
    { k: "occupancy", l: "Occupancy Rate", d: 5 }, { k: "tenant_quality", l: "Tenant Quality", d: 5 }, { k: "cashflow", l: "Cashflow", d: 5 },
    { k: "leverage", l: "Leverage / LTV", d: 5 }, { k: "maintenance", l: "Maintenance", d: 5 }, { k: "market_liquidity", l: "Market Liquidity", d: 5 },
    { k: "regulation_fit", l: "Regulation Fit", d: 5 }, { k: "insurance", l: "Insurance Coverage", d: 5 }, { k: "diversification", l: "Diversification", d: 5 },
    { k: "climate_exposure", l: "Climate Exposure", d: 5 },
  ],
};

export function simRealEstate(p, y) {
  const risks = {
    "Price correction": risk(p.leverage * 1.1, p.location_quality * .9, y, 1.2, 88, 8),
    "Vacancy risk": risk(10 - p.occupancy, p.location_quality * .7, y, 1, 80, 8),
    "Interest rate exposure": risk(p.leverage * 1.2 + (p.mortgage / Math.max(1, p.rent_income * 12)) * 0.15, p.cashflow * .8, y, 1.3, 90, 8),
    "Maintenance backlog": risk(10 - p.maintenance, p.cashflow * .6, y, .9, 75, 8),
    "Liquidity risk": risk(p.leverage, p.market_liquidity + Math.max(0, (p.rent_income - p.monthly_costs) / Math.max(1, p.rent_income) * 10), y, 1, 80, 8),
    "Regulatory risk": risk(10 - p.regulation_fit, p.location_quality * .5, y, .85, 72, 7),
    "Tenant default": risk(10 - p.tenant_quality, p.cashflow * .7, y, 1.05, 82, 8),
    "Insurance gap": risk(10 - p.insurance, p.maintenance * .5, y, .8, 70, 7),
    "Concentration risk": risk(10 - p.diversification, p.market_liquidity * .6, y, .95, 78, 8),
    "Climate exposure": risk(p.climate_exposure * 1.1, p.insurance * .6, y, 1.1, 84, 7),
  };
  const stability = stab(
    [p.location_quality, p.occupancy, p.tenant_quality, p.cashflow, p.diversification],
    [p.leverage * 1.1, 10 - p.maintenance, p.climate_exposure * .8]
  );
  return { risks, stability };
}
