import React from 'react';

const BAR_DATA = [
  { label: '9', val: 62 },
  { label: '10', val: 85 },
  { label: '11', val: 45 },
  { label: '12', val: 90 },
  { label: '13', val: 55 },
  { label: '14', val: 78 },
  { label: '15', val: 68 },
  { label: '16', val: 82 },
  { label: '17', val: 50 },
  { label: '18', val: 72 },
];
const barMax = Math.max(...BAR_DATA.map(d => d.val));

const DONUT_LEGEND = [
  { color: '#4ADE80', label: 'English', pct: 44 },
  { color: '#2DD4BF', label: 'Chinese', pct: 28 },
  { color: 'rgba(255,255,255,0.3)', label: 'Japanese', pct: 16 },
  { color: 'rgba(255,255,255,0.1)', label: 'Others', pct: 12 },
];
// Conic angles
let angleAcc = 0;
const conicParts = DONUT_LEGEND.map(d => {
  const start = angleAcc;
  angleAcc += d.pct * 3.6;
  return { ...d, start };
});

/* ── Mini line chart data (Users Trend) ──────────────────────────────── */
const TREND = [30, 45, 38, 55, 50, 62, 55, 75, 68, 78];
const trendMax = Math.max(...TREND);
const sw = 200; const sh = 50; const tp = 4;
const trendPts = TREND.map((v, i) => `${(i / (TREND.length - 1)) * (sw - tp * 2) + tp},${sh - tp - (v / trendMax) * (sh - tp * 2)}`).join(' ');

export const AdminAnalytics: React.FC = () => (
  <div>
    <div className="admin-page-header">
      <h1 className="admin-page-title">Analytics</h1>
      <p className="admin-page-sub">Translation metrics & trends</p>
    </div>

    {/* Row 1: mini stat cards */}
    <div className="stat-cards-row">
      {[
        { label: 'Users Trend', val: '↑ 24%', extra: TREND },
        { label: 'Translation Count', val: '8,425', icon: true },
        { label: 'Avg Accuracy', val: '98.4%', icon: true },
        { label: 'Avg Time', val: '1.4s', icon: true },
      ].map(c => (
        <div key={c.label} className="stat-card">
          <div className="stat-card-label">{c.label}</div>
          <div className="stat-card-value" style={{ fontSize: 28 }}>{c.val}</div>
          {c.extra && (
            <svg viewBox={`0 0 ${sw} ${sh}`} style={{ width: '100%', height: 40, marginTop: 8 }}>
              <polyline points={trendPts} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      ))}
    </div>

    {/* Row 2: Bar chart + Donut */}
    <div className="analytics-grid">
      {/* Bar chart — Peak Time */}
      <div className="chart-panel">
        <div className="chart-panel-title">Peak Time</div>
        <div className="bar-chart">
          {BAR_DATA.map(b => (
            <div key={b.label} className="bar-col">
              <div className="bar-fill" style={{ height: `${(b.val / barMax) * 120}px` }} />
              <span className="bar-label">{b.label}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donut — Language Distribution */}
      <div className="chart-panel">
        <div className="chart-panel-title">Language Distribution</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div className="donut-ring">
            <div className="donut-hole">
              <div className="donut-value">72%</div>
              <div className="donut-label">Top 2</div>
            </div>
          </div>
          <div className="legend-list">
            {DONUT_LEGEND.map(d => (
              <div key={d.label} className="legend-item">
                <span className="legend-dot" style={{ background: d.color }} />
                {d.label} {d.pct}%
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Row 3: Model Usage */}
    <div className="chart-panel">
      <div className="chart-panel-title">Model Usage</div>
      <div style={{ display: 'flex', gap: 14 }}>
        {[
          { label: 'GPT-4',   val: 45, color: '#4ADE80' },
          { label: 'Whisper', val: 30, color: '#2DD4BF' },
          { label: 'Claude',  val: 18, color: 'rgba(255,255,255,0.3)' },
          { label: 'DeepSeek',val: 7,  color: 'rgba(255,255,255,0.12)' },
        ].map(m => (
          <div key={m.label} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{m.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-primary)' }}>{m.val}%</span>
            </div>
            <div className="status-bar-track">
              <div className="status-bar-fill" style={{ width: `${m.val}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
