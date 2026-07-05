import { useState, useEffect } from 'react';
import { SimResult, RiskIntelligence } from '../types';
import { createRiskIntelligence } from '../riskIntelligenceFactory';

export function useRiskIntelligence(current: SimResult | null) {
  const [intelligence, setIntelligence] = useState<RiskIntelligence | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!current) {
      setIntelligence(null);
      return;
    }
    
    setLoading(true);
    try {
      const ri = createRiskIntelligence(current);
      setIntelligence(ri);
    } catch (err) {
      console.error('Error generating risk intelligence:', err);
      setIntelligence(null);
    } finally {
      setLoading(false);
    }
  }, [current?.id]);

  return { intelligence, loading };
}
