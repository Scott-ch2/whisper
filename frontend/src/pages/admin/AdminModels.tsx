import React from 'react';
import { ThunderboltOutlined } from '@ant-design/icons';

const MODELS = [
  { name: 'GPT-4 Turbo',  latency: '24ms', cost: '$0.018/min', enabled: true },
  { name: 'Whisper v3',   latency: '18ms', cost: '$0.006/min', enabled: true },
  { name: 'Claude Opus',  latency: '32ms', cost: '$0.025/min', enabled: true },
  { name: 'Gemini Pro',   latency: '28ms', cost: '$0.015/min', enabled: false },
  { name: 'DeepSeek V3',  latency: '22ms', cost: '$0.009/min', enabled: false },
];

export const AdminModels: React.FC = () => (
  <div>
    <div className="admin-page-header">
      <h1 className="admin-page-title">AI Models</h1>
      <p className="admin-page-sub">Model management & configuration</p>
    </div>

    <div className="model-grid">
      {MODELS.map(m => (
        <div key={m.name} className="model-card">
          <div className="model-card-header">
            <div className="model-card-name">{m.name}</div>
            <span className={`model-badge ${m.enabled ? 'on' : 'off'}`}>
              {m.enabled ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="model-stats">
            <div className="model-stat">
              <div className="model-stat-label">Latency</div>
              <div className="model-stat-value">{m.latency}</div>
            </div>
            <div className="model-stat">
              <div className="model-stat-label">Cost</div>
              <div className="model-stat-value">{m.cost}</div>
            </div>
          </div>
          <button className="model-toggle">
            <ThunderboltOutlined style={{ marginRight: 6 }} />
            {m.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  </div>
);
