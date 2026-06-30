import React from 'react';
import {
  AudioOutlined, BulbOutlined, TranslationOutlined,
  SoundOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import './WaveCircle.css';

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

/* ── Sub-label below main status ─────────────────────────────────────── */
const statusSub: Record<string, string> = {
  idle: 'Click to Start',
  listening: 'Recording audio…',
  thinking: 'Processing…',
  translating: 'Generating translation…',
  speaking: 'Playing back…',
  finished: 'Tap to record again',
};

const OrbIcon: React.FC<{ status: string }> = ({ status }) => {
  const s: React.CSSProperties = { fontSize: 36, display: 'flex' };
  switch (status) {
    case 'finished':    return <CheckCircleOutlined style={s} />;
    case 'thinking':    return <BulbOutlined style={s} />;
    case 'translating': return <TranslationOutlined style={s} />;
    case 'speaking':    return <SoundOutlined style={s} />;
    case 'listening':   return <AudioOutlined style={s} />;
    default:            return <AudioOutlined style={s} />;
  }
};

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export const WaveCircle: React.FC<WaveCircleProps> = ({ status, onClick }) => {
  const isActive = status !== 'idle' && status !== 'finished';
  const isIdleOrFinished = status === 'idle' || status === 'finished';
  const showRipple = status === 'listening' || status === 'speaking';

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
          {isIdleOrFinished && <span className={`status-dot status-${status}`} />}
          {statusLabel[status]}
        </div>
        <div className="orb-status-label-sub">{statusSub[status]}</div>
      </div>
    </div>
  );
};
