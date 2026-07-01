import React from 'react';
import {
  AudioOutlined, BulbOutlined, LoadingOutlined,
} from '@ant-design/icons';
import './WaveCircle.css';

export type OrbStatus = 'idle' | 'recording' | 'processing';

interface WaveCircleProps {
  status: OrbStatus;
  onClick: () => void;
}

const statusLabel: Record<OrbStatus, string> = {
  idle: 'Ready',
  recording: 'Recording…',
  processing: 'Processing…',
};

const statusSub: Record<OrbStatus, string> = {
  idle: 'Click to record',
  recording: 'Listening… tap to stop',
  processing: 'Transcribing & Translating…',
};

const OrbIcon: React.FC<{ status: OrbStatus }> = ({ status }) => {
  const s: React.CSSProperties = { fontSize: 36, display: 'flex' };
  switch (status) {
    case 'processing': return <LoadingOutlined style={{ ...s, fontSize: 32 }} />;
    default:           return <AudioOutlined style={s} />;
  }
};

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export const WaveCircle: React.FC<WaveCircleProps> = ({ status, onClick }) => {
  const isActive = status === 'recording' || status === 'processing';
  const showRipple = status === 'recording';

  return (
    <div className="ai-orb-zone">
      <div className={`orb-ambient-glow ${isActive ? 'active' : ''}`} />

      {showRipple && (
        <>
          <div className="orb-ripple orb-ripple-1" />
          <div className="orb-ripple orb-ripple-2" />
          <div className="orb-ripple orb-ripple-3" />
        </>
      )}

      {isActive && (
        <div className="orb-particles">
          {PARTICLE_ANGLES.map((angle, i) => (
            <span
              key={i}
              className="orb-particle"
              style={{ '--angle': `${angle}deg`, animationDelay: `${i * 0.3}s` } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <button
        className={`ai-orb status-${status}`}
        onClick={onClick}
        aria-label={statusLabel[status]}
        type="button"
      >
        <div className="orb-inner">
          <div className="orb-icon"><OrbIcon status={status} /></div>
        </div>
      </button>

      <div className={`orb-status-label status-${status}`}>
        <div className="orb-status-label-main">
          {status === 'idle' && <span className="status-dot status-idle" />}
          {statusLabel[status]}
        </div>
        <div className="orb-status-label-sub">{statusSub[status]}</div>
      </div>
    </div>
  );
};
