import React, { useEffect, useState } from 'react';
import { ThunderboltOutlined } from '@ant-design/icons';
import { fetchModels, updateModel } from '../../services/api';

export const AdminModels: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);

  useEffect(() => {
    fetchModels().then(setModels).catch(() => {});
  }, []);

  const toggle = async (id: number, current: number) => {
    await updateModel(id, { isEnabled: current === 1 ? 0 : 1 });
    fetchModels().then(setModels).catch(() => {});
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">AI Models</h1>
        <p className="admin-page-sub">Model management & configuration</p>
      </div>
      <div className="model-grid">
        {models.map((m: any) => (
          <div key={m.id} className="model-card">
            <div className="model-card-header">
              <div className="model-card-name">{m.modelName}</div>
              <span className={`model-badge ${m.isEnabled ? 'on' : 'off'}`}>
                {m.isEnabled ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="model-stats">
              <div className="model-stat">
                <div className="model-stat-label">Type</div>
                <div className="model-stat-value">{m.modelType}</div>
              </div>
              <div className="model-stat">
                <div className="model-stat-label">Config</div>
                <div className="model-stat-value" style={{ fontSize: 11 }}>{m.configJson?.slice(0, 30) || '—'}</div>
              </div>
            </div>
            <button className="model-toggle" onClick={() => toggle(m.id, m.isEnabled)}>
              <ThunderboltOutlined style={{ marginRight: 6 }} />
              {m.isEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
