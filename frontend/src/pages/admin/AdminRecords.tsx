import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchHistory, exportHistory, type HistoryItem } from '../../services/api';

export const AdminRecords: React.FC = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const load = (p = 1, kw = keyword) => {
    fetchHistory(p, 20).then(d => {
      const filtered = kw ? d.records.filter(r =>
        r.transcription?.toLowerCase().includes(kw.toLowerCase()) ||
        r.translation?.toLowerCase().includes(kw.toLowerCase())
      ) : d.records;
      setItems(filtered);
      setTotal(kw ? filtered.length : d.total);
      setPage(p);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id: number) => {
    // In a real app: DELETE /api/history/{id}
    setItems(prev => prev.filter(i => i.id !== id));
    message.success('Record deleted');
  };

  const handleExport = (id: number) => {
    exportHistory(id).then(() => message.success('Exported')).catch(() => {});
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Translation Records</h1>
        <p className="admin-page-sub">{total} records</p>
      </div>

      <div className="records-toolbar">
        <div className="records-search">
          <SearchOutlined style={{ color: 'rgba(255,255,255,0.2)' }} />
          <input
            type="text"
            placeholder="Search by text content…"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1, keyword)}
            className="records-search-input"
          />
        </div>
      </div>

      <div className="records-table">
        <div className="records-table-header">
          <span style={{ width: 60 }}>User</span>
          <span style={{ width: 80 }}>Direction</span>
          <span style={{ flex: 1 }}>Original</span>
          <span style={{ flex: 1 }}>Translation</span>
          <span style={{ width: 100 }}>Time</span>
          <span style={{ width: 60 }}>Action</span>
        </div>
        {items.map(h => (
          <div key={h.id} className="records-table-row">
            <span style={{ width: 60, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>#{h.userId}</span>
            <span style={{ width: 80, color: 'var(--accent)', fontSize: 12 }}>{h.srcLang?.toUpperCase()}→{h.tgtLang?.toUpperCase()}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.transcription?.slice(0, 50) || '—'}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.6)' }}>{h.translation?.slice(0, 50) || '—'}</span>
            <span style={{ width: 100, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{h.createdAt?.slice(0, 10)}</span>
            <span style={{ width: 60, display: 'flex', gap: 6 }}>
              <button type="button" className="records-action-btn" onClick={() => handleExport(h.id)} title="Export TXT" style={{ fontSize: 11 }}>TXT</button>
              <button type="button" className="records-action-btn del" onClick={() => handleDelete(h.id)} title="Delete"><DeleteOutlined /></button>
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No records found</div>
        )}
      </div>

      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
            <span key={i} onClick={() => load(i + 1)} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 12,
              background: page === i + 1 ? 'rgba(74,222,128,0.1)' : 'transparent',
              color: page === i + 1 ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
              border: page === i + 1 ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent',
            }}>{i + 1}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRecords;
