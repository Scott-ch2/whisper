import React, { useEffect, useState } from 'react';
import { fetchMonitor, fetchAdminLogs } from '../../services/api';

export const AdminMonitor: React.FC = () => {
  const [monitor, setMonitor] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchMonitor().then(setMonitor).catch(() => {});
    fetchAdminLogs(1, 20).then(d => setLogs(d.records)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Translation Monitor</h1>
        <p className="admin-page-sub">Real-time translation pipeline</p>
      </div>
      <div className="monitor-grid">
        <div>
          <div className="chart-panel-title">Now Translating</div>
          {monitor?.activeRequests?.length ? monitor.activeRequests.map((r: any) => (
            <div key={r.id} className="monitor-request">
              <div className="monitor-request-header">
                <span className="monitor-request-user">Task #{r.id}</span>
                <span className="monitor-request-status running">{r.status}</span>
              </div>
              <div className="monitor-request-lang" style={{ marginBottom: 6 }}>{r.srcLang} → {r.tgtLang}</div>
            </div>
          )) : <div style={{ color: 'var(--ink-tertiary)', fontSize: 12 }}>No active requests</div>}

          <div className="chart-panel-title" style={{ marginTop: 24 }}>Recent Logs</div>
          {logs.map((l: any, i: number) => (
            <div key={i} className="log-line">
              <span className="log-time">{l.createdAt?.slice(11, 16)}</span>
              <span className="log-user">{l.action}</span>
              <span style={{ flex: 1 }}>{l.detail}</span>
              <span className="log-status ok">OK</span>
            </div>
          ))}
        </div>
        <div className="chart-panel">
          <div className="chart-panel-title">Queue Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Queue', val: monitor?.queueCount ?? '--', color: 'var(--ink-secondary)' },
              { label: 'Processing', val: monitor?.processingCount ?? '--', color: 'var(--accent)' },
              { label: 'Finished', val: monitor?.completedCount ?? '--', color: '#2DD4BF' },
              { label: 'Failed', val: monitor?.failedCount ?? '--', color: 'var(--c-red)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 18, borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 32, fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
