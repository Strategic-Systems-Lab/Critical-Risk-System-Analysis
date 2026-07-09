import { useMemo } from 'react';
import { SimResult, RiskIntelligence, Priority } from './types';
import { generateRiskIntelligence } from './engine';
import { PRIORITY_COLOR } from './constants';

/**
 * Package 2 — UI
 * Independent cards. Never touches Package 1's state, routing or styles.
 * Visual language intentionally mirrors Package 1 (dark cards, monospace
 * eyebrow labels, neon accents) so the extension feels native, not bolted on.
 */

interface PanelProps {
  currentResult: SimResult;
  previousResult?: SimResult | null;
  historyForClass?: SimResult[];
  accentColor?: string;
}

const card = (border?: string): React.CSSProperties => ({
  background: '#111827', border: '1px solid ' + (border || '#1e2d40'),
  borderRadius: 8, padding: 16, marginBottom: 12,
});
const lbl: React.CSSProperties = {
  fontSize: 10, color: '#4a5568', letterSpacing: 2, textTransform: 'uppercase',
  fontFamily: 'monospace', marginBottom: 10, display: 'block',
};
const chip = (color: string): React.CSSProperties => ({
  fontSize: 10, padding: '2px 8px', borderRadius: 20, border: '1px solid ' + color, color,
  flexShrink: 0, whiteSpace: 'nowrap', alignSelf: 'flex-start',
});
const bar = (pct: number, color: string) => (
  <div style={{ height: 5, background: '#1e2d40', borderRadius: 3, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: Math.max(0, Math.min(100, pct)) + '%', background: color, borderRadius: 3 }} />
  </div>
);

export function RiskIntelligencePanel({ currentResult, previousResult, historyForClass, accentColor = '#00d4ff' }: PanelProps) {
  const report: RiskIntelligence = useMemo(
    () => generateRiskIntelligence(currentResult, previousResult, historyForClass),
    [currentResult, previousResult, historyForClass]
  );

  if (!currentResult) return null;

  return (
    <div>
      <div style={{ fontFamily: 'monospace', fontSize: 11, color: accentColor, letterSpacing: 2, margin: '20px 0 10px' }}>
        ◈ RISK INTELLIGENCE
      </div>
      <MissionCard missions={report.missions} accentColor={accentColor} />
      <ImpactCard impact={report.impact} accentColor={accentColor} />
      <EvolutionCard evolution={report.evolution} />
      <InsightsCard insights={report.insights} accentColor={accentColor} />
      <OpportunityCard opportunities={report.opportunities} accentColor={accentColor} />
      <TimelineCard timeline={report.priorityTimeline} accentColor={accentColor} />
      <RemindersCard reminders={report.reminders} />
      <ProgressCard progress={report.progress} accentColor={accentColor} />
      {report.digitalTwin && <DigitalTwinCard twin={report.digitalTwin} accentColor={accentColor} />}
    </div>
  );
}

function MissionCard({ missions, accentColor }: { missions: RiskIntelligence['missions']; accentColor: string }) {
  return (
    <div style={card(accentColor + '30')}>
      <span style={lbl}>◈ Mission Engine</span>
      {missions.length === 0 && <div style={{ fontSize: 12, color: '#4a5568' }}>No missions available.</div>}
      {missions.map((m) => (
        <div key={m.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #0d1117' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', minWidth: 0 }}>{m.title}</span>
            <span style={chip(PRIORITY_COLOR[m.priority as Priority])}>{m.priority}</span>
          </div>
          <div style={{ fontSize: 12, color: '#8892a4', lineHeight: 1.6, marginBottom: 6 }}>{m.description}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 10, color: '#4a5568', fontFamily: 'monospace' }}>
            <span>{m.difficulty}</span><span>·</span><span>{m.estimatedTime}</span><span>·</span>
            <span style={{ color: '#00ff9d' }}>+{m.expectedStabilityGain}% stability</span><span>·</span>
            <span style={{ color: '#ff6b35' }}>-{m.expectedRiskReduction}% risk</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ImpactCard({ impact, accentColor }: { impact: RiskIntelligence['impact']; accentColor: string }) {
  return (
    <div style={card(accentColor + '30')}>
      <span style={lbl}>◈ Impact Simulator</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 2 }}>Current Stability</div>
          <div style={{ fontFamily: 'monospace', fontSize: 18, color: '#8892a4', fontWeight: 700 }}>{impact.currentStability}%</div>
        </div>
        <div style={{ fontSize: 18, color: '#00ff9d' }}>→</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 2 }}>Projected Stability</div>
          <div style={{ fontFamily: 'monospace', fontSize: 24, color: '#00ff9d', fontWeight: 800 }}>{impact.projectedStability}%</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#8892a4', marginBottom: 8 }}>
        Estimated risk load: <span style={{ color: '#ff6b35', fontWeight: 700 }}>{impact.currentRisk}%</span> → <span style={{ color: '#00ff9d', fontWeight: 700 }}>{impact.projectedRisk}%</span>
        {' '}(confidence: {impact.confidence})
      </div>
      <div style={{ fontSize: 10, color: '#4a5568', lineHeight: 1.5, paddingTop: 8, borderTop: '1px solid #1e2d40' }}>
        ⚠ Approximation only — assumes generated missions are completed. Does not overwrite the original simulation.
      </div>
    </div>
  );
}

function EvolutionCard({ evolution }: { evolution: RiskIntelligence['evolution'] }) {
  return (
    <div style={card()}>
      <span style={lbl}>◈ Risk Evolution</span>
      {!evolution.hasPrevious ? (
        <div style={{ fontSize: 12, color: '#4a5568' }}>{evolution.trendSummary}</div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: '#c4cfdf', marginBottom: 10 }}>{evolution.trendSummary}</div>
          {evolution.improved.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#00ff9d', marginBottom: 4, fontFamily: 'monospace' }}>IMPROVED</div>
              {evolution.improved.map((d) => (
                <div key={d.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: '#e2e8f0' }}>{d.category}{d.magnitude === 'major' ? ' ⏫' : ''}</span>
                  <span style={{ color: '#00ff9d', fontFamily: 'monospace' }}>{d.from}% → {d.to}%</span>
                </div>
              ))}
            </div>
          )}
          {evolution.declined.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: '#ff2d55', marginBottom: 4, fontFamily: 'monospace' }}>DECLINED</div>
              {evolution.declined.map((d) => (
                <div key={d.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: '#e2e8f0' }}>{d.category}{d.magnitude === 'major' ? ' ⏬' : ''}</span>
                  <span style={{ color: '#ff2d55', fontFamily: 'monospace' }}>{d.from}% → {d.to}%</span>
                </div>
              ))}
            </div>
          )}
          {evolution.newRisks.length > 0 && (
            <div style={{ fontSize: 11, color: '#ff6b35', marginTop: 4 }}>⚠ New: {evolution.newRisks.map((n) => n.category).join(', ')}</div>
          )}
          {evolution.resolvedRisks.length > 0 && (
            <div style={{ fontSize: 11, color: '#4a5568', marginTop: 4 }}>No longer tracked: {evolution.resolvedRisks.map((n) => n.category).join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ opportunities, accentColor }: { opportunities: RiskIntelligence['opportunities']; accentColor: string }) {
  const { topStrengths, untappedStrengths, reallocationOpportunity } = opportunities;
  return (
    <div style={card((topStrengths.length ? '#00ff9d' : accentColor) + '30')}>
      <span style={lbl}>◈ Opportunity Finder</span>
      {topStrengths.length === 0 ? (
        <div style={{ fontSize: 12, color: '#4a5568' }}>No clear strengths — every category shows elevated risk or higher. Focus on risk reduction first.</div>
      ) : (
        <>
          <div style={{ fontSize: 10, color: '#00ff9d', marginBottom: 6, fontFamily: 'monospace' }}>STRENGTHS TO LEVERAGE</div>
          {topStrengths.map((o) => (
            <div key={o.category} style={{ fontSize: 12, color: '#c4cfdf', lineHeight: 1.6, marginBottom: 6 }}>
              <span style={{ color: '#00ff9d', fontWeight: 700 }}>{o.category}</span> — {o.note}
            </div>
          ))}
          {untappedStrengths.length > 0 && untappedStrengths.map((o) => (
            <div key={o.category} style={{ fontSize: 11, color: '#8892a4', lineHeight: 1.6, marginTop: 4 }}>💡 {o.note}</div>
          ))}
          {reallocationOpportunity && (
            <div style={{ fontSize: 11, color: '#8892a4', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid #1e2d40' }}>
              🔄 {reallocationOpportunity.note}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProgressCard({ progress, accentColor }: { progress: RiskIntelligence['progress']; accentColor: string }) {
  return (
    <div style={card(accentColor + '30')}>
      <span style={lbl}>◈ Risk Improvement Tracker</span>
      <div style={{ fontSize: 12, color: '#c4cfdf', marginBottom: progress.recentTrend ? 4 : (progress.hasEnoughData ? 10 : 0) }}>{progress.summary}</div>
      {progress.recentTrend && <div style={{ fontSize: 11, color: '#8892a4', marginBottom: 10 }}>{progress.recentTrend}</div>}
      {progress.hasEnoughData && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60, marginBottom: 8 }}>
          {progress.points.map((p, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: Math.max(4, p.stability * 0.5), background: accentColor, borderRadius: 2, opacity: i === progress.points.length - 1 ? 1 : 0.45 }} />
              <div style={{ fontSize: 8, color: '#4a5568', marginTop: 3 }}>{p.stability}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineCard({ timeline, accentColor }: { timeline: RiskIntelligence['priorityTimeline']; accentColor: string }) {
  const groups: [string, typeof timeline.today, string][] = [
    ['Today', timeline.today, '#ff2d55'], ['This Week', timeline.thisWeek, '#ff6b35'],
    ['This Month', timeline.thisMonth, '#ffd700'], ['Next Quarter', timeline.nextQuarter, '#00ff9d'],
  ];
  const hasAny = groups.some(([, list]) => list.length > 0);
  if (!hasAny) return null;
  return (
    <div style={card()}>
      <span style={lbl}>◈ Priority Timeline</span>
      {groups.filter(([, list]) => list.length > 0).map(([label, list, color]) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color, marginBottom: 4, fontFamily: 'monospace' }}>{label.toUpperCase()}</div>
          {list.map((m) => <div key={m.id} style={{ fontSize: 12, color: '#c4cfdf', marginBottom: 2 }}>• {m.title}</div>)}
        </div>
      ))}
    </div>
  );
}

function RemindersCard({ reminders }: { reminders: RiskIntelligence['reminders'] }) {
  if (!reminders.length) return null;
  const urgColor = { high: '#ff2d55', medium: '#ffd700', low: '#4a5568' };
  return (
    <div style={card()}>
      <span style={lbl}>◈ Smart Reminders</span>
      {reminders.map((r) => (
        <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ color: urgColor[r.urgency], fontSize: 10, marginTop: 3 }}>●</span>
          <span style={{ fontSize: 12, color: '#c4cfdf', lineHeight: 1.5 }}>{r.message}</span>
        </div>
      ))}
    </div>
  );
}

function InsightsCard({ insights, accentColor }: { insights: RiskIntelligence['insights']; accentColor: string }) {
  return (
    <div style={card(accentColor + '30')}>
      <span style={lbl}>◈ System Insights</span>
      <Row label="Biggest Threat" value={insights.biggestThreat} color="#ff2d55" />
      <Row label="Highest Leverage" value={insights.highestLeverage} color="#ffd700" />
      {insights.quickWins.length > 0 && (
        <div style={{ margin: '10px 0' }}>
          <div style={{ fontSize: 10, color: '#4a5568', marginBottom: 6, fontFamily: 'monospace' }}>QUICK WINS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {insights.quickWins.map((w) => <span key={w} style={chip('#00d4ff')}>{w}</span>)}
          </div>
        </div>
      )}
      {insights.hiddenDependencies.map((h, i) => (
        <div key={i} style={{ fontSize: 11, color: '#8892a4', lineHeight: 1.6, marginTop: 6 }}>🔗 {h.note}</div>
      ))}
    </div>
  );
}

function DigitalTwinCard({ twin, accentColor }: { twin: RiskIntelligence['digitalTwin']; accentColor: string }) {
  if (!twin) return null;
  return (
    <div style={card(accentColor + '30')}>
      <span style={lbl}>◈ Digital Twin</span>
      {[
        { l: 'System Health', v: twin.systemHealth, c: '#00ff9d' },
        { l: 'Recovery Potential', v: twin.recoveryPotential, c: '#00d4ff' },
        { l: 'Forecast Confidence', v: twin.forecastConfidence, c: '#ffd700' },
        { l: 'Overall Maturity', v: twin.overallMaturity, c: '#a78bfa' },
      ].map((m) => (
        <div key={m.l} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
            <span style={{ color: '#8892a4' }}>{m.l}</span>
            <span style={{ color: m.c, fontFamily: 'monospace', fontWeight: 700 }}>{m.v}%</span>
          </div>
          {bar(m.v, m.c)}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {twin.criticalNodes.map((n) => <span key={n} style={chip('#ff6b35')}>{n}</span>)}
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#8892a4' }}>{label}</span>
      <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
