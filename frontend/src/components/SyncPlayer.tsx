import React, { useState, useRef, useEffect } from 'react';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

interface Segment {
  id: number;
  start: number;
  end: number;
  src: string;
  tgt: string;
}

interface SyncPlayerProps {
  audioSrc: string;
  segments: Segment[];
}

export const SyncPlayer: React.FC<SyncPlayerProps> = ({ audioSrc, segments }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tick = () => {
      setCurrentTime(audio.currentTime);
      const idx = segments.findIndex(
        (seg) => audio.currentTime >= seg.start && audio.currentTime < seg.end
      );
      setActiveIndex(idx);
    };

    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', tick);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', tick);
      audio.removeEventListener('ended', onEnded);
    };
  }, [segments, audioSrc]);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = (start: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = start;
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24, marginTop: 20 }}>
      <audio ref={audioRef} src={audioSrc} preload="auto" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div onClick={togglePlay} style={{ cursor: 'pointer', fontSize: 36, color: 'var(--color-primary-cyan)', display: 'flex', alignItems: 'center' }}>
          {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--color-primary-cyan)', marginBottom: 4 }}>识别与翻译结果</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            {isPlaying ? '播放中…' : '点击播放'} · {segments.length} 个句子 · 点击任意行跳转
          </div>
        </div>
      </div>

      <div ref={listRef} style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
        {segments.map((seg, i) => (
          <div
            key={seg.id}
            onClick={() => seekTo(seg.start)}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 6,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              background: i === activeIndex ? 'rgba(74, 222, 128, 0.12)' : 'transparent',
              border: i === activeIndex ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid transparent',
            }}
          >
            <div style={{
              color: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.7)',
              fontSize: i === activeIndex ? 16 : 14,
              fontWeight: i === activeIndex ? 600 : 400,
              marginBottom: 4,
              transition: 'all 0.3s'
            }}>
              {seg.src}
            </div>
            <div style={{
              color: i === activeIndex ? 'var(--color-primary-cyan)' : 'rgba(255,255,255,0.4)',
              fontSize: i === activeIndex ? 14 : 12,
              transition: 'all 0.3s'
            }}>
              {seg.tgt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
