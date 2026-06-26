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
    <div className="result-card fade-in-up">
      <div className="result-row">
        {/* 原文 */}
        <div className="result-col-src">
          <div className="result-label">原文</div>
          <p className="result-text">{sourceText}</p>
        </div>

        {/* 译文 */}
        <div className="result-col-tgt">
          <div className="result-meta">
            <span className="result-label">译文</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="result-time">{time}</span>
              <span
                className={`result-copy${copied ? ' copied' : ''}`}
                onClick={handleCopy}
                title="复制译文"
              >
                {copied ? <CheckOutlined /> : <CopyOutlined />}
              </span>
            </div>
          </div>
          <p className="result-text-tgt">{targetText}</p>
        </div>
      </div>
    </div>
  );
};
