import React, { useRef } from 'react';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';

interface WaveCircleProps {
  isRecording: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const WaveCircle: React.FC<WaveCircleProps> = ({ isRecording, isLoading, onClick }) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    onClick();
    const btn = btnRef.current;
    if (!btn) return;
    // 触发水波纹
    btn.classList.remove('ripple');
    void btn.offsetWidth;
    btn.classList.add('ripple');
  };

  return (
    <div className="record-zone">
      <div className="wave-wrapper">
        {isRecording && (
          <>
            <div className="wave-ring wave-ring-1" />
            <div className="wave-ring wave-ring-2" />
            <div className="wave-ring wave-ring-3" />
          </>
        )}
        <button
          ref={btnRef}
          className={`record-btn ${isRecording ? 'recording' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleClick}
          disabled={isLoading}
          aria-label={isRecording ? '停止录音' : '开始录音'}
        >
          {isLoading
            ? <LoadingOutlined style={{ fontSize: 36 }} />
            : <AudioOutlined style={{ fontSize: 36 }} />
          }
        </button>
      </div>
    </div>
  );
};
