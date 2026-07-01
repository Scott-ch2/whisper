import React, { useEffect, useState } from 'react';
import { ThunderboltOutlined, TranslationOutlined } from '@ant-design/icons';
import { fetchDashboard, type DashboardData } from '../../services/api';

const REQUEST_DATA_FALLBACK = [42, 58, 35, 62, 80, 55, 70, 48, 65, 52, 72, 38, 60, 75, 50, 68, 45, 78, 55, 62];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboard().then(setData).catch(console.error);
  }, []);

  const reqData = data?.recentRequests || REQUEST_DATA_FALLBACK;
  const maxReq = Math.max(...reqData);
  const svgW = 600; const svgH = 160; const pad = 10;
  const pts = reqData.map((v, i) => `${(i / (reqData.length - 1)) * (svgW - pad * 2) + pad},${svgH - pad - (v / maxReq) * (svgH - pad * 2)}`).join(' ');
  const areaPts = `${pad},${svgH - pad} ${pts} ${svgW - pad},${svgH - pad}`;

  const stats = [
    { icon: <ThunderboltOutlined />, value: data ? data.totalUsers.toLocaleString() : '--', label: 'Active Users', change: '' },
    { icon: <TranslationOutlined />, value: data ? data.todayTasks.toLocaleString() : '--', label: 'Today Tasks', change: '' },
    { icon: <ThunderboltOutlined />, value: data ? data.gpuUsage + '%' : '--', label: 'GPU Usage', change: '' },
    { icon: <ThunderboltOutlined />, value: data ? data.accuracy + '%' : '--', label: 'AI Accuracy', change: '' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">AI Control Center</h1>
        <p className="admin-page-sub">System overview · Real-time monitoring</p>
      </div>
      <div className="stat-cards-row">
        {stats.map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-card-icon">{c.icon}</div>
            <div className="stat-card-value">{c.value}</div>
            <div className="stat-card-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
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
        <div className="chart-panel">
          <div className="chart-panel-title">Server Status</div>
          {[{ label: 'GPU', val: data?.gpuUsage || 72 }, { label: 'Memory', val: 54 }, { label: 'Disk', val: 38 }].map(b => (
            <div key={b.label} className="status-bar-row">
              <span className="status-bar-label">{b.label}</span>
              <div className="status-bar-track"><div className="status-bar-fill" style={{ width: `${b.val}%` }} /></div>
              <span className="status-bar-value">{b.val}%</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div className="status-bar-row"><span className="status-bar-label">Network</span><span style={{ marginLeft: 'auto', color: '#4ADE80', fontWeight: 500, fontSize: 12 }}>Online</span></div>
            <div className="status-bar-row"><span className="status-bar-label">Model</span><span style={{ marginLeft: 'auto', color: 'var(--ink-primary)', fontWeight: 500, fontSize: 12 }}>GPT-4 Turbo</span></div>
            <div className="status-bar-row"><span className="status-bar-label">Whisper</span><span style={{ marginLeft: 'auto', color: '#4ADE80', fontWeight: 500, fontSize: 12 }}>Running</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
