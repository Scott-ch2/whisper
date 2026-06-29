import React, { useState } from 'react';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

interface ResultCardProps {
  sourceText: string;
  targetText: string;
  time: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ sourceText, targetText, time }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card" style={{ marginBottom: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ flex: '1 1 280px', borderLeft: '3px solid var(--color-primary-cyan)', paddingLeft: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-primary-cyan)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>原文</div>
          <p style={{ color: '#fff', lineHeight: 1.7 }}>{sourceText}</p>
        </div>
        <div style={{ flex: '1 1 280px', paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--color-primary-cyan)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>译文</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{time}</span>
              <span onClick={handleCopy} style={{ cursor: 'pointer', color: copied ? 'var(--color-primary-cyan)' : 'rgba(255,255,255,0.45)', transition: 'color 0.2s' }}>
                {copied ? <CheckOutlined /> : <CopyOutlined />}
              </span>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{targetText}</p>
        </div>
      </div>
    </div>
  );
};
