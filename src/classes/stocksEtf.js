import { risk, stab } from "../formulaHelpers";

export const CLS_STOCKS = {
  icon: "📈", label: "Stocks/ETF", eLabel: "Portfolio name", color: "#f472b6",
  profiles: [
    { n: "Balanced ETF", p: { capital: 15000, monthly_savings: 400, stock_pct: 40, diversification: 8, hedging: 6, leverage: 2, liquidity: 8, sector_concentration: 3, fx_exposure: 3, rate_sensitivity: 4, volatility: 4, discipline: 7, tax_efficiency: 6 } },
    { n: "Growth/Tech", p: { capital: 8000, monthly_savings: 600, stock_pct: 80, diversification: 4, hedging: 3, leverage: 3, liquidity: 7, sector_concentration: 8, fx_exposure: 5, rate_sensitivity: 7, volatility: 8, discipline: 5, tax_efficiency: 5 } },
    { n: "Leveraged Trader", p: { capital: 5000, monthly_savings: 200, stock_pct: 95, diversification: 2, hedging: 2, leverage: 8, liquidity: 5, sector_concentration: 7, fx_exposure: 6, rate_sensitivity: 8, volatility: 9, discipline: 3, tax_efficiency: 3 } },
    { n: "Manual", p: null },
  ],
  fields: [
    { k: "capital", l: "Starting Capital (€)", d: 10000, lo: 0, hi: 100000 }, { k: "monthly_savings", l: "Monthly Savings (€)", d: 300, lo: 0, hi: 3000 },
    { k: "stock_pct", l: "Stocks Alloc. (%)", d: 50, lo: 0, hi: 100 }, { k: "diversification", l: "Diversification", d: 5 }, { k: "hedging", l: "Hedging", d: 5 },
    { k: "leverage", l: "Leverage", d: 5 }, { k: "liquidity", l: "Liquidity", d: 5 }, { k: "sector_concentration", l: "Sector Concentration", d: 5 },
    { k: "fx_exposure", l: "FX Exposure", d: 5 }, { k: "rate_sensitivity", l: "Rate Sensitivity", d: 5 }, { k: "volatility", l: "Volatility", d: 5 },
    { k: "discipline", l: "Discipline", d: 5 }, { k: "tax_efficiency", l: "Tax Efficiency", d: 5 },
  ],
};

export function simStocks(p, y) {
  const risks = {
    "Market volatility": risk(p.volatility * 1.15, p.diversification * .9, y, 1.3, 90, 8),
    "Concentration risk": risk((10 - p.diversification) + Math.abs(p.stock_pct - 50) / 10, p.hedging * .6, y, 1.1, 84, 8),
    "Leverage risk": risk(p.leverage * 1.2, p.liquidity * .6, y, 1.35, 92, 8),
    "Liquidity risk": risk(10 - p.liquidity, p.discipline * .6, y, 1, 80, 8),
    "Sector exposure": risk(p.sector_concentration * 1.1, p.diversification * .7, y, 1.05, 82, 8),
    "Currency risk": risk(p.fx_exposure, p.hedging * .8, y, .95, 78, 7),
    "Interest rate sensitivity": risk(p.rate_sensitivity * 1.1, p.hedging * .7, y, 1.15, 86, 8),
    "Drawdown risk": risk(p.volatility, (p.monthly_savings * 12 / Math.max(1, p.capital) * 10) + p.discipline * .5, y, 1.1, 84, 8),
    "Behavioural risk": risk(10 - p.discipline, p.volatility * .6, y, .9, 76, 8),
    "Tax inefficiency": risk(10 - p.tax_efficiency, p.discipline * .5, y, .75, 68, 7),
  };
  const stability = stab(
    [p.diversification, p.hedging, p.discipline, p.liquidity, p.tax_efficiency],
    [p.volatility * 1.1, p.leverage * 1.1, p.sector_concentration * .8]
  );
  return { risks, stability };
}
