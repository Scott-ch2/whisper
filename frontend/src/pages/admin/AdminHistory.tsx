import React, { useState } from 'react';
import { Drawer, Descriptions } from 'antd';
import { SwapOutlined, CaretRightOutlined, DownloadOutlined } from '@ant-design/icons';

interface HistoryItem { id: number; time: string; user: string; src: string; tgt: string; srcLang: string; tgtLang: string; status: 'success' | 'failed'; day: string; }

const HISTORY: HistoryItem[] = [
  { id: 1, time: '09:31', user: 'Alice', src: 'Hello everyone', tgt: '大家好', srcLang: 'EN', tgtLang: 'CN', status: 'success', day: 'Today' },
  { id: 2, time: '09:29', user: 'Bob',   src: 'おはようございます', tgt: 'Good morning', srcLang: 'JP', tgtLang: 'EN', status: 'success', day: 'Today' },
  { id: 3, time: '09:15', user: 'Carol', src: 'Merci beaucoup', tgt: '非常感谢', srcLang: 'FR', tgtLang: 'CN', status: 'success', day: 'Today' },
  { id: 4, time: '09:02', user: 'David', src: 'Guten Tag', tgt: 'Good day', srcLang: 'DE', tgtLang: 'EN', status: 'failed', day: 'Today' },
  { id: 5, time: '18:45', user: 'Eva',   src: 'See you later', tgt: '再见', srcLang: 'EN', tgtLang: 'CN', status: 'success', day: 'Yesterday' },
  { id: 6, time: '16:20', user: 'Frank', src: 'Buenos días', tgt: '早上好', srcLang: 'ES', tgtLang: 'CN', status: 'success', day: 'Yesterday' },
];

const days = [...new Set(HISTORY.map(h => h.day))];

export const AdminHistory: React.FC = () => {
  const [selected, setSelected] = useState<HistoryItem | null>(null);

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
            {HISTORY.filter(h => h.day === day).map(h => (
              <div key={h.id} className="timeline-item" onClick={() => setSelected(h)}>
                <span className="timeline-item-time">{h.time}</span>
                <span className="timeline-item-user">{h.user}</span>
                <span className="timeline-item-lang">{h.srcLang} → {h.tgtLang}</span>
                <span className={`timeline-item-status ${h.status}`}>
                  {h.status === 'success' ? 'Success' : 'Failed'}
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <Drawer
        title={`${selected?.user || ''} · ${selected?.srcLang} → ${selected?.tgtLang}`}
        open={!!selected}
        onClose={() => setSelected(null)}
        width={420}
        styles={{ body: { background: 'transparent', color: 'var(--ink-primary)' } }}
      >
        {selected && (
          <div>
            <div className="chart-panel" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-tertiary)', marginBottom: 10 }}>Original</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-primary)', margin: 0 }}>{selected.src}</p>
            </div>
            <div className="chart-panel" style={{ marginBottom: 16, borderColor: 'rgba(74,222,128,0.12)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>Translation</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--ink-primary)', margin: 0 }}>{selected.tgt}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.06)',
                color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
              }}>
                <CaretRightOutlined style={{ marginRight: 6 }} />Play Audio
              </button>
              <button style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                color: 'var(--ink-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-sans)',
              }}>
                <DownloadOutlined style={{ marginRight: 6 }} />Download
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
