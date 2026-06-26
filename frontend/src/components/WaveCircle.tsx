import React from 'react';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';
import './WaveCircle.css'; // 将下方 css 内容放入此文件

interface WaveCircleProps {
  isRecording: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const WaveCircle: React.FC<WaveCircleProps> = ({ isRecording, isLoading, onClick }) => {
  return (
    <div className="wave-wrapper">
      {isRecording && (
        <>
          <div className="wave-ring wave-ring-1"></div>
          <div className="wave-ring wave-ring-2"></div>
          <div className="wave-ring wave-ring-3"></div>
        </>
      )}
      <button
        className={`record-btn ${isRecording ? 'recording' : ''}`}
        onClick={onClick}
        disabled={isLoading}
      >
        {isLoading ? <LoadingOutlined style={{ fontSize: 40 }} /> : <AudioOutlined style={{ fontSize: 40 }} />}
      </button>
    </div>
  );
};