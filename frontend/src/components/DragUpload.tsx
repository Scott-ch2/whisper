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
    if (file) onFileSelect(file);
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
      <input ref={inputRef} type="file" accept=".wav,.mp3,.flac,.m4a,.ogg,.webm,audio/*" style={{ display: 'none' }} onChange={handleChange} />
      <div className="drag-zone-icon"><CloudUploadOutlined /></div>
      <div className="drag-zone-title">{over ? 'Release to upload' : 'Drop audio file or click to browse'}</div>
      <div className="drag-zone-hint">WAV · MP3 · FLAC · M4A · OGG · WebM</div>
    </div>
  );
};
