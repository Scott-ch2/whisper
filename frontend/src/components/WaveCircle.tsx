import React from 'react';

interface WaveCircleProps {
  status: 'idle' | 'listening' | 'thinking' | 'translating' | 'speaking' | 'finished';
  onClick: () => void;
}

const statusLabel: Record<string, string> = {
  idle: 'Ready',
  listening: 'Listening…',
  thinking: 'Thinking…',
  translating: 'Translating…',
  speaking: 'Speaking…',
  finished: 'Finished',
};

export const WaveCircle: React.FC<WaveCircleProps> = ({ status, onClick }) => {
  const isActive = status !== 'idle' && status !== 'finished';

  return (
    <div className="ai-orb-zone">
      {/* 粒子光点 (仅活跃状态) */}
      {isActive && (
        <div className="orb-particles">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className={`orb-particle p-${i + 1}`} />
          ))}
        </div>
      )}

      {/* 波纹扩散 (listening + speaking) */}
      {(status === 'listening' || status === 'speaking') && (
        <>
          <div className="orb-wave orb-wave-1" />
          <div className="orb-wave orb-wave-2" />
          <div className="orb-wave orb-wave-3" />
        </>
      )}

      {/* 核心 AI 球 */}
      <button
        className={`ai-orb status-${status}`}
        onClick={onClick}
        aria-label={statusLabel[status]}
      >
        <div className="orb-inner">
          <svg viewBox="0 0 24 24" className="orb-icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {status === 'finished' ? (
              <path d="M20 6 9 17l-5-5" />
            ) : status === 'thinking' || status === 'translating' ? (
              <>
                <circle cx="12" cy="4" r="2" />
                <path d="M10.4 8.4a4 4 0 0 1 6.3 4.9" />
                <path d="M16.8 18A7 7 0 0 1 5.2 13" />
              </>
            ) : (
              <>
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </>
            )}
          </svg>
        </div>
      </button>

      {/* 状态标签 */}
      <div className={`orb-status-label status-${status}`}>{statusLabel[status]}</div>
    </div>
  );
};
