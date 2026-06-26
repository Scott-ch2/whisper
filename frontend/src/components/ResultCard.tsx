import React from 'react';
import { Typography, Row, Col } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ResultCardProps {
  sourceText: string;
  targetText: string;
  time: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ sourceText, targetText, time }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card fade-in-up" style={{ marginBottom: 20, overflow: 'hidden' }}>
      <Row>
        {/* 左侧原文区 */}
        <Col xs={24} md={12} style={{
          padding: '20px 24px',
          borderLeft: '4px solid var(--color-primary-cyan)',
          borderRight: '1px solid var(--color-border)'
        }}>
          <div style={{ marginBottom: 8, fontSize: 12, color: '#888', fontWeight: 'bold' }}>原文</div>
          <Text style={{ fontSize: 16, lineHeight: 1.6 }}>{sourceText}</Text>
        </Col>

        {/* 右侧译文区 */}
        <Col xs={24} md={12} style={{
          padding: '20px 24px',
          background: 'rgba(0, 194, 255, 0.02)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--color-primary-cyan)', fontWeight: 'bold' }}>译文</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#aaa' }}>{time}</span>
              <div
                onClick={handleCopy}
                style={{ cursor: 'pointer', color: copied ? 'var(--color-success)' : '#888' }}
              >
                {copied ? <CheckOutlined /> : <CopyOutlined />}
              </div>
            </div>
          </div>
          <Text style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-primary-dark)' }}>
            {targetText}
          </Text>
        </Col>
      </Row>
    </div>
  );
};