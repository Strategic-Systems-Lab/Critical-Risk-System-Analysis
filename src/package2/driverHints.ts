import { SimResult } from './types';

/**
 * Module — Driver Hints.
 * Maps risk categories to the input parameter(s) that actually drive them
 * in Package 1's simAny() formulas — extracted directly from the "bad"/
 * "good" arguments of each risk() call, not guessed. This is what turns a
 * generic "Focused action here offers the largest impact" into a concrete
 * "Increase pension_assets or state_pension_reliance".
 *
 * Lives entirely in Package 2. Package 1 needed ZERO changes for this —
 * result.cls and the risk category names are already part of the finished
 * simulation output Package 2 reads. If a future class isn't in this table,
 * lookups simply return undefined and callers fall back to generic text
 * (fail-safe, per the original Package 2 spec).
 */
export const DRIVER_HINTS: Record<string, Record<string, string>> = {
  '1': { // Company
    Burnout: 'risk_tolerance↓ / training↑',
    Financial: 'cash_reserves↑ / debt↓ (Altman Z-Score based)',
    Cyber: 'cybersec↑',
    Governance: 'compliance↑ / transparency↑',
    Market: 'adaptability↑ / transparency↑',
    Dependency: 'redundancy↑',
    Operational: 'compliance↑ / redundancy↑',
    'Knowledge loss': 'training↑',
    Automation: 'compliance↑',
    Reputation: 'transparency↑',
  },
  '4': { // Healthcare
    'Staff burnout': 'burnout↓ / funding↑',
    'Supply failure': 'pharma_supply↑',
    Cyber: 'cybersec↑',
    'Capacity overload': 'beds↑ / crisis_capacity↑',
    'Equity gap': 'equity↑',
    'Prevention failure': 'prevention↑',
    'Research lag': 'research↑',
    'Regulation gap': 'regulation↑',
    'Financial strain': 'funding↑',
    'System collapse': 'funding↑ / crisis_capacity↑',
  },
  '7': { // Real Estate
    'Price correction': 'leverage↓',
    'Vacancy risk': 'occupancy↑',
    'Interest rate exposure': 'leverage↓ / mortgage↓',
    'Maintenance backlog': 'maintenance↑',
    'Liquidity risk': 'leverage↓ / market_liquidity↑',
    'Regulatory risk': 'regulation_fit↑',
    'Tenant default': 'tenant_quality↑',
    'Insurance gap': 'insurance↑',
    'Concentration risk': 'diversification↑',
    'Climate exposure': 'insurance↑',
  },
  '8': { // Stocks/ETF
    'Market volatility': 'diversification↑',
    'Concentration risk': 'diversification↑',
    'Leverage risk': 'leverage↓',
    'Liquidity risk': 'liquidity↑',
    'Sector exposure': 'sector_concentration↓',
    'Currency risk': 'hedging↑',
    'Interest rate sensitivity': 'hedging↑',
    'Drawdown risk': 'monthly_savings↑ / discipline↑',
    'Behavioural risk': 'discipline↑',
    'Tax inefficiency': 'tax_efficiency↑',
  },
  '9': { // Lifestyle
    'Income shock': 'income↑ / savings↑',
    'Lifestyle inflation': 'discipline↑',
    'Emergency preparedness': 'savings↑',
    'Debt burden': 'debt↓',
    'Career stability': 'income↑',
    'Dependent load': 'income↑',
    'Housing exposure': 'savings↑',
    'Health cost exposure': 'savings↑',
    'Retirement gap': 'discipline↑ / savings↑',
    'Lifestyle volatility': 'discipline↑',
  },
  '10': { // Retirement
    'Sequence-of-returns risk': 'equity_pct↓ / diversification↑',
    'Inflation erosion': 'inflation_protection↑',
    'Contribution gap': 'monthly_contribution↑',
    'Longevity risk': 'pension_assets↑ / diversification↑',
    'Healthcare cost exposure': 'healthcare_buffer↑',
    'State pension shortfall': 'state_pension_reliance↑ / pension_assets↑',
    'Early retirement risk': 'pension_assets↑',
    'Market concentration': 'diversification↑',
    'Withdrawal rate risk': 'equity_pct↓ / diversification↑',
    'Behavioural risk': 'discipline↑',
  },
};

/** Safe lookup — returns undefined for unknown class/category, never throws. */
export function getDriverHint(result: SimResult, category: string): string | undefined {
  return DRIVER_HINTS[result.cls]?.[category];
}
