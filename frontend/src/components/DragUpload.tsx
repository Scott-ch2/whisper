import React, { useState, useRef } from 'react';
import { CloudUploadOutlined } from '@ant-design/icons';

interface DragUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const DragUpload: React.FC<DragUploadProps> = ({ onFileSelect, disabled }) => {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const cls = `drag-zone${over ? ' drag-over' : ''}${disabled ? ' disabled' : ''}`;

  return (
    <div
      className={cls}
      onDragOver={e => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div className="drag-zone-icon">
        <CloudUploadOutlined />
      </div>
      <div className="drag-zone-title">
        {over ? '释放以上传' : '拖拽音频文件到这里'}
      </div>
      <div className="drag-zone-hint">
        支持 WAV · MP3 · FLAC · M4A · OGG
      </div>
    </div>
  );
};
