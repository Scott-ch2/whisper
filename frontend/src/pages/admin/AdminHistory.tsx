import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { CaretRightOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchHistory, exportHistory, type HistoryItem } from '../../services/api';

export const AdminHistory: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetchHistory(1, 50).then(p => setItems(p.records)).catch(() => {});
  }, []);

  const days = [...new Set(items.map(h => h.createdAt?.slice(0, 10) || 'Unknown'))];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">History</h1>
        <p className="admin-page-sub">Translation records</p>
      </div>
      <div className="timeline">
        {days.map(day => (
          <React.Fragment key={day}>
            <div className="timeline-day">{day}</div>
            {items.filter(h => h.createdAt?.slice(0, 10) === day).map(h => (
              <div key={h.id} className="timeline-item" onClick={() => setSelected(h)}>
                <span className="timeline-item-time">{h.createdAt?.slice(11, 16)}</span>
                <span className="timeline-item-user">User #{h.userId}</span>
                <span className="timeline-item-lang">{h.srcLang} → {h.tgtLang}</span>
                <span className={`timeline-item-status ${h.status === 'completed' ? 'success' : 'failed'}`}>
                  {h.status}
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      <Drawer title={`#${selected?.id} · ${selected?.srcLang} → ${selected?.tgtLang}`} open={!!selected} onClose={() => setSelected(null)} width={420}
        styles={{ body: { background: 'transparent', color: 'var(--ink-primary)' } }}>
        {selected && (
          <div>
            <div className="chart-panel" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-tertiary)', marginBottom: 10 }}>Original</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-primary)', margin: 0 }}>{selected.transcription}</p>
            </div>
            <div className="chart-panel" style={{ marginBottom: 16, borderColor: 'rgba(74,222,128,0.12)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>Translation</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-primary)', margin: 0 }}>{selected.translation}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.06)', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                <CaretRightOutlined style={{ marginRight: 6 }} />Play Audio
              </button>
              <button onClick={() => exportHistory(selected.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--ink-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                <DownloadOutlined style={{ marginRight: 6 }} />Download
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
