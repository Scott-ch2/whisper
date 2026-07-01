import React, { useEffect, useState } from 'react';
import { fetchHistory } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [totals, setTotals] = useState({ users: '--', translations: '--', languages: '--', today: '--' });
  const [recents, setRecents] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory(1, 5).then(d => {
      setRecents(d.records);
      const langs = new Set(d.records.map((r: any) => r.tgtLang));
      setTotals({
        users: d.records.length ? String(new Set(d.records.map((r: any) => r.userId)).size) : '--',
        translations: String(d.total),
        languages: String(langs.size) || '--',
        today: String(d.records.filter((r: any) => r.createdAt?.startsWith(new Date().toISOString().slice(0, 10))).length),
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { value: totals.users, label: 'Users' },
    { value: totals.translations, label: 'Translations' },
    { value: totals.languages, label: 'Languages' },
    { value: totals.today, label: "Today's" },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">System overview</p>
      </div>

      <div className="stat-cards-row">
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={{ cursor: 'default' }}>
            <div className="stat-card-value" style={{ fontSize: 28 }}>{c.value}</div>
            <div className="stat-card-label" style={{ marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="chart-panel" style={{ marginTop: 20 }}>
        <div className="chart-panel-title">Recent Translations</div>
        {recents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 12 }}>
            <div style={{ display: 'flex', padding: '10px 14px', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ width: 80 }}>User</span>
              <span style={{ width: 80 }}>Direction</span>
              <span style={{ flex: 1 }}>Preview</span>
              <span style={{ width: 80 }}>Time</span>
            </div>
            {recents.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', padding: '10px 14px', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.02)', alignItems: 'center' }}>
                <span style={{ width: 80, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>User #{r.userId}</span>
                <span style={{ width: 80, color: 'var(--accent)', fontSize: 12 }}>{r.srcLang?.toUpperCase()}→{r.tgtLang?.toUpperCase()}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.6)' }}>{r.transcription?.slice(0, 40) || '—'}</span>
                <span style={{ width: 80, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{r.createdAt?.slice(11, 16)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 12 }}>No translations yet</p>
        )}
      </div>
    </div>
  );
};
