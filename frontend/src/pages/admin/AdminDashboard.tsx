import React from 'react';
import {
  ThunderboltOutlined, TranslationOutlined, SoundOutlined,
  SafetyCertificateOutlined, BarChartOutlined,
} from '@ant-design/icons';

const STAT_CARDS = [
  { icon: <ThunderboltOutlined />, value: '1,254', label: 'Active Users', change: '+12%' },
  { icon: <TranslationOutlined />, value: '8,425', label: 'Today Tasks', change: '+24%' },
  { icon: <SoundOutlined />, value: '73%', label: 'GPU Usage', change: '-3%' },
  { icon: <SafetyCertificateOutlined />, value: '98.4%', label: 'AI Accuracy', change: '+0.2%' },
];

const REQUEST_DATA = [42, 58, 35, 62, 80, 55, 70, 48, 65, 52, 72, 38, 60, 75, 50, 68, 45, 78, 55, 62];
const maxReq = Math.max(...REQUEST_DATA);
const svgW = 600; const svgH = 160; const pad = 10;
const pts = REQUEST_DATA.map((v, i) => `${(i / (REQUEST_DATA.length - 1)) * (svgW - pad * 2) + pad},${svgH - pad - (v / maxReq) * (svgH - pad * 2)}`).join(' ');
const areaPts = `${pad},${svgH - pad} ${pts} ${svgW - pad},${svgH - pad}`;

const SERVER_BARS = [
  { label: 'GPU',   val: 72, cls: 'gpu' },
  { label: 'Memory', val: 54, cls: 'mem' },
  { label: 'Disk',  val: 38, cls: 'gpu' },
];

export const AdminDashboard: React.FC = () => (
  <div>
    <div className="admin-page-header">
      <h1 className="admin-page-title">AI Control Center</h1>
      <p className="admin-page-sub">System overview · Real-time monitoring</p>
    </div>

    {/* Stat cards */}
    <div className="stat-cards-row">
      {STAT_CARDS.map(c => (
        <div key={c.label} className="stat-card">
          <div className="stat-card-icon">{c.icon}</div>
          <div className="stat-card-value">{c.value}</div>
          <div className="stat-card-label">{c.label} · <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{c.change}</span></div>
        </div>
      ))}
    </div>

    {/* Chart + Server */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
      {/* Line chart */}
      <div className="chart-panel">
        <div className="chart-panel-title">Real-time Requests</div>
        <div className="line-chart">
          <svg className="line-chart-svg" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPts} className="line-chart-area" />
            <polyline points={pts} className="line-chart-path" />
          </svg>
        </div>
      </div>

      {/* Server status */}
      <div className="chart-panel">
        <div className="chart-panel-title">Server Status</div>
        {SERVER_BARS.map(b => (
          <div key={b.label} className="status-bar-row">
            <span className="status-bar-label">{b.label}</span>
            <div className={`status-bar-track ${b.cls}`}>
              <div className="status-bar-fill" style={{ width: `${b.val}%` }} />
            </div>
            <span className="status-bar-value">{b.val}%</span>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <div className="status-bar-row">
            <span className="status-bar-label">Network</span>
            <span style={{ marginLeft: 'auto', color: '#4ADE80', fontWeight: 500, fontSize: 12 }}>Online</span>
          </div>
          <div className="status-bar-row">
            <span className="status-bar-label">Model</span>
            <span style={{ marginLeft: 'auto', color: 'var(--ink-primary)', fontWeight: 500, fontSize: 12 }}>GPT-4 Turbo</span>
          </div>
          <div className="status-bar-row">
            <span className="status-bar-label">Whisper</span>
            <span style={{ marginLeft: 'auto', color: '#4ADE80', fontWeight: 500, fontSize: 12 }}>Running</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
