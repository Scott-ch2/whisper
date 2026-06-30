import React from 'react';
import { ThunderboltOutlined, SoundOutlined, WifiOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const ACTIVE_REQUESTS = [
  { user: 'Alice Chen', lang: 'Chinese → English', latency: '25ms', gpu: 'A100', running: true },
  { user: 'Bob Wang', lang: 'English → Japanese', latency: '32ms', gpu: 'V100', running: true },
  { user: 'Carol Zhang', lang: 'French → Chinese', latency: '19ms', gpu: 'A100', running: true },
];

const LOGS = [
  { time: '08:31', user: 'Alice', status: 'ok', text: 'Completed' },
  { time: '08:30', user: 'Bob',   status: 'ok', text: 'Running' },
  { time: '08:29', user: 'Carol', status: 'ok', text: 'Completed' },
  { time: '08:28', user: 'David', status: 'ok', text: 'Completed' },
  { time: '08:27', user: 'Eva',   status: 'ok', text: 'Completed' },
  { time: '08:26', user: 'Frank', status: 'warn', text: 'Timeout' },
  { time: '08:25', user: 'Grace', status: 'ok', text: 'Completed' },
  { time: '08:24', user: 'Henry',status: 'ok', text: 'Running' },
];

const QUEUE_STATS = [
  { label: 'Queue',    val: 14, color: 'var(--ink-secondary)' },
  { label: 'Processing', val: 8, color: 'var(--accent)' },
  { label: 'Finished', val: 348, color: '#2DD4BF' },
  { label: 'Failed',  val: 1, color: 'var(--c-red)' },
];

export const AdminMonitor: React.FC = () => (
  <div>
    <div className="admin-page-header">
      <h1 className="admin-page-title">Translation Monitor</h1>
      <p className="admin-page-sub">Real-time translation pipeline</p>
    </div>

    <div className="monitor-grid">
      {/* Left — Active requests + Logs */}
      <div>
        <div className="chart-panel-title">Now Translating</div>
        {ACTIVE_REQUESTS.map(r => (
          <div key={r.user} className="monitor-request">
            <div className="monitor-request-header">
              <span className="monitor-request-user">{r.user}</span>
              <span className="monitor-request-status running">Running</span>
            </div>
            <div className="monitor-request-lang" style={{ marginBottom: 6 }}>{r.lang}</div>
            <div style={{ display: 'flex', gap: 20 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-tertiary)' }}>Latency: <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{r.latency}</span></span>
              <span style={{ fontSize: 11, color: 'var(--ink-tertiary)' }}>GPU: <span style={{ color: 'var(--ink-primary)', fontWeight: 500 }}>{r.gpu}</span></span>
            </div>
          </div>
        ))}

        <div className="chart-panel-title" style={{ marginTop: 24 }}>Recent Logs</div>
        {LOGS.map((l, i) => (
          <div key={i} className="log-line">
            <span className="log-time">{l.time}</span>
            <span className="log-user">{l.user}</span>
            <span style={{ flex: 1 }}>{l.text}</span>
            <span className={`log-status ${l.status}`}>{l.status === 'ok' ? 'OK' : 'WARN'}</span>
          </div>
        ))}
      </div>

      {/* Right — Queue stats */}
      <div className="chart-panel">
        <div className="chart-panel-title">Queue Status</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {QUEUE_STATS.map(s => (
            <div key={s.label} style={{
              textAlign: 'center', padding: 18, borderRadius: 14,
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
