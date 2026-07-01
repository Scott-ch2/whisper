import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select } from 'antd';
import { SwapOutlined, RightOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchHistory, exportHistory, type HistoryItem } from '../../services/api';
import '../admin/AdminLayout.css';

const { Search } = Input;

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const load = (p = 1) => {
    fetchHistory(p, 10).then(d => {
      setItems(d.records);
      setTotal(d.total);
      setPage(p);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const days = [...new Set(items.map(h => h.createdAt?.slice(0, 10) || 'Unknown'))];

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', width: '100%', paddingBottom: 60 }}>
      <div className="admin-page-header">
        <h1 className="admin-page-title">History</h1>
        <p className="admin-page-sub">{total} translation records</p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <Search placeholder="Search transcriptions..." allowClear style={{ maxWidth: 400 }}
          onSearch={k => { setKeyword(k); load(); }}
          className="dark-dropdown" />
      </div>

      <div className="timeline">
        {days.map(day => (
          <React.Fragment key={day}>
            <div className="timeline-day">{day}</div>
            {items.filter(h => h.createdAt?.slice(0, 10) === day).map(h => (
              <div key={h.id} className="timeline-item" onClick={() => navigate('/app')}>
                <span className="timeline-item-time">{h.createdAt?.slice(11, 16)}</span>
                <span className="timeline-item-lang" style={{ flex: 1 }}>{h.srcLang} → {h.tgtLang}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12 }}>
                  {h.transcription?.slice(0, 40) || '—'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--accent)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12 }}>
                  {h.translation?.slice(0, 40) || '—'}
                </span>
                <span className={`timeline-item-status ${h.status === 'completed' ? 'success' : 'failed'}`}>
                  {h.status}
                </span>
                <DownloadOutlined style={{ marginLeft: 8, fontSize: 12, cursor: 'pointer', color: 'var(--ink-tertiary)' }}
                  onClick={e => { e.stopPropagation(); exportHistory(h.id); }} />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
            <span key={i} onClick={() => load(i + 1)} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8,
              cursor: 'pointer', fontSize: 13,
              background: page === i + 1 ? 'rgba(74,222,128,0.1)' : 'transparent',
              color: page === i + 1 ? 'var(--accent)' : 'var(--ink-secondary)',
              border: page === i + 1 ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent',
              fontWeight: page === i + 1 ? 600 : 400,
            }}>{i + 1}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
