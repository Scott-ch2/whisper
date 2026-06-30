import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Select, Tooltip, message } from 'antd';
import {
  SwapOutlined, CopyOutlined, CaretRightOutlined,
  StarOutlined, FileTextOutlined, DownloadOutlined,
  ReloadOutlined, DesktopOutlined,
} from '@ant-design/icons';
import { WaveCircle } from '../../components/WaveCircle';

type OrbStatus = 'idle' | 'listening' | 'thinking' | 'translating' | 'speaking' | 'finished';

/* ── Top nav tabs ──────────────────────────────────────────────────────── */
const TOP_TABS = [
  { key: 'meeting',  icon: <DesktopOutlined />,    label: 'Meeting' },
  { key: 'subtitle', icon: <FileTextOutlined />,    label: 'Subtitle' },
  { key: 'export',   icon: <DownloadOutlined />,    label: 'Export' },
  { key: 'summary',  icon: <StarOutlined />,        label: 'Summary' },
];
const ACTIVE_TAB = 'subtitle';

/* ── Dock status items ────────────────────────────────────────────────── */
const DOCK_ITEMS = [
  { label: 'Online', sticky: true },
  null,
  { label: 'GPT-4 Turbo', sticky: false },
  null,
  { label: '26ms', sticky: false },
  null,
  { label: 'CN → EN', sticky: false },
];

/* ── Progressive subtitle feed ────────────────────────────────────────── */
const SUBTITLE_SEGMENTS = [
  { src: 'Hello everyone,',               tgt: '大家好，',               delay: 3000 },
  { src: 'welcome to the AI',             tgt: '欢迎体验 AI',            delay: 4200 },
  { src: 'real-time translation demo.',   tgt: '实时翻译演示。',          delay: 5400 },
];

export const TranslationPage: React.FC = () => {
  const [status, setStatus]       = useState<OrbStatus>('idle');
  const [srcLang, setSrcLang]     = useState('auto');
  const [tgtLang, setTgtLang]     = useState('zh');
  const [srcText, setSrcText]     = useState('');
  const [tgtText, setTgtText]     = useState('');
  const [summary, setSummary]     = useState('');
  const [swapDeg, setSwapDeg]     = useState(0);
  const canvasRef                 = useRef<HTMLCanvasElement>(null);
  const animRef                   = useRef<number>(0);
  const segTimers                 = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isRecording = status === 'listening' || status === 'speaking';
  const isActive    = status !== 'idle' && status !== 'finished';
  const showCards   = status === 'finished' || status === 'speaking';

  /* ── Recording → background blur ──────────────────────────────────── */
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.classList.toggle('workspace-recording', isActive);
    return () => { root.classList.remove('workspace-recording'); };
  }, [isActive]);

  /* ── Waveform ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isRecording) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr); ctx.clearRect(0, 0, rect.width, rect.height);
      const bars = 72, gap = 1.25;
      const barW = rect.width / bars - gap;
      const t = Date.now() * 0.003;
      for (let i = 0; i < bars; i++) {
        const wave = Math.sin(t + i * 0.1) * 0.35 + 0.5;
        const noise = Math.sin(t * 2.8 + i * 0.22) * 0.18;
        const amp = status === 'speaking' ? wave * 0.5 + noise : (wave + noise) * 0.65;
        const hBar = Math.max(amp * rect.height * 0.7, 2);
        const x = i * (rect.width / bars) + gap / 2;
        const y = (rect.height - hBar) / 2;
        const grad = ctx.createLinearGradient(x, y, x, y + hBar);
        grad.addColorStop(0, 'rgba(74,222,128,0.92)');
        grad.addColorStop(0.5, 'rgba(74,222,128,0.5)');
        grad.addColorStop(1, 'rgba(45,212,191,0.35)');
        ctx.fillStyle = grad; ctx.beginPath();
        ctx.roundRect(x, y, barW, hBar, 1.5); ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isRecording, status]);

  useEffect(() => () => segTimers.current.forEach(clearTimeout), []);

  /* ── Orb click ────────────────────────────────────────────────────── */
  const handleOrbClick = useCallback(() => {
    if (status === 'idle' || status === 'finished') {
      segTimers.current.forEach(clearTimeout);
      segTimers.current = [];
      setStatus('listening');
      setSrcText(''); setTgtText(''); setSummary('');
      SUBTITLE_SEGMENTS.forEach(seg =>
        segTimers.current.push(setTimeout(() => {
          setSrcText(p => p + (p ? ' ' : '') + seg.src);
          setTgtText(p => p + (p ? ' ' : '') + seg.tgt);
        }, seg.delay))
      );
      segTimers.current.push(setTimeout(() => setStatus('thinking'),    3200));
      segTimers.current.push(setTimeout(() => setStatus('translating'), 5000));
      segTimers.current.push(setTimeout(() => setStatus('speaking'),    7200));
      segTimers.current.push(setTimeout(() => {
        setStatus('finished');
        setSummary('• API integration architecture reviewed\n• Q3 development timeline confirmed\n• Prototype testing begins Monday\n• Team: 3 frontend + 2 backend engineers');
      }, 10600));
    } else {
      segTimers.current.forEach(clearTimeout);
      setStatus('idle');
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
  }, [status]);

  /* ── Swap with rotation ───────────────────────────────────────────── */
  const handleSwapLang = useCallback(() => {
    if (srcLang === 'auto') return;
    setSwapDeg(d => d + 180);
    setTimeout(() => { setSrcLang(tgtLang); setTgtLang(srcLang); }, 110);
  }, [srcLang, tgtLang]);

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', width: '100%', paddingBottom: 56 }}>
      {/* ════════ Logo — small, subtle ════════ */}
      <div className="fade-in-up logo-breath" style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{
          margin: 0, fontSize: 30, fontWeight: 400, color: '#fff',
          fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
          textShadow: '0 0 36px rgba(74,222,128,0.25), 0 0 70px rgba(74,222,128,0.08), 0 2px 4px rgba(0,0,0,0.5)',
          lineHeight: 1.15,
        }}>
          AI Translator
        </h1>
        <p style={{
          margin: '6px 0 0', fontSize: 12, fontWeight: 400,
          color: 'var(--ink-secondary)', opacity: 0.45,
          fontFamily: 'var(--font-sans)', letterSpacing: '0.08em',
        }}>
          Speech Translation
        </p>
      </div>

      {/* ════════ Top Tabs — active green pill ════════ */}
      <div className="fade-in-up" style={{
        display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18, animationDelay: '60ms',
      }}>
        {TOP_TABS.map(t => {
          const active = t.key === ACTIVE_TAB;
          return (
            <button key={t.key} type="button" className="top-tab" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 22,
              background: active ? 'rgba(74,222,128,0.12)' : 'transparent',
              border: active ? '1px solid rgba(74,222,128,0.25)' : '1px solid transparent',
              color: active ? 'var(--accent)' : 'var(--ink-secondary)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', letterSpacing: '0.02em',
              transition: 'all 0.3s var(--ease-out-expo)',
              boxShadow: active ? '0 0 14px rgba(74,222,128,0.1)' : 'none',
              position: 'relative',
            }}
              onMouseEnter={e => {
                if (active) return;
                const el = e.currentTarget;
                el.style.borderColor = 'rgba(74,222,128,0.2)';
                el.style.color = '#fff';
                el.style.background = 'rgba(74,222,128,0.05)';
                el.style.boxShadow = '0 0 12px rgba(74,222,128,0.06)';
              }}
              onMouseLeave={e => {
                if (active) return;
                const el = e.currentTarget;
                el.style.borderColor = 'transparent';
                el.style.color = 'var(--ink-secondary)';
                el.style.background = 'transparent';
                el.style.boxShadow = 'none';
              }}
            >
              {t.icon}
              {t.label}
              {active && <span style={{
                position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 2, borderRadius: 1,
                background: 'var(--accent)', boxShadow: '0 0 6px var(--accent-glow)',
              }} />}
            </button>
          );
        })}
      </div>

      {/* ════════ Language Selector ════════ */}
      <div className="fade-in-up" style={{
        display: 'flex', justifyContent: 'center', marginBottom: 8, animationDelay: '120ms',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 50,
          background: 'rgba(10,16,14,0.4)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 18px', borderRadius: 24,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.05)',
            minWidth: 140, justifyContent: 'center',
          }}>
            <Select value={srcLang} onChange={setSrcLang}
              style={{ width: 140 }} variant="borderless" popupClassName="dark-dropdown">
              <Select.Option value="auto">🌐 Auto Detect</Select.Option>
              <Select.Option value="en">🇺🇸 English</Select.Option>
              <Select.Option value="zh">🇨🇳 中文</Select.Option>
              <Select.Option value="ja">🇯🇵 日本語</Select.Option>
            </Select>
          </div>
          <Tooltip title="Swap">
            <span onClick={handleSwapLang} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.25)',
              cursor: 'pointer', color: 'var(--accent)',
              transform: `rotate(${swapDeg}deg)`,
              transition: 'transform 0.38s var(--ease-out-expo), background 0.3s, box-shadow 0.3s',
              flexShrink: 0,
            }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(74,222,128,0.18)';
                el.style.boxShadow = '0 0 28px rgba(74,222,128,0.35)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(74,222,128,0.1)';
                el.style.boxShadow = 'none';
              }}
            >
              <SwapOutlined style={{ fontSize: 16 }} />
            </span>
          </Tooltip>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 18px', borderRadius: 24,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.05)',
            minWidth: 140, justifyContent: 'center',
          }}>
            <Select value={tgtLang} onChange={setTgtLang}
              style={{ width: 140 }} variant="borderless" popupClassName="dark-dropdown">
              <Select.Option value="zh">🇨🇳 中文</Select.Option>
              <Select.Option value="en">🇺🇸 English</Select.Option>
              <Select.Option value="ja">🇯🇵 日本語</Select.Option>
            </Select>
          </div>
        </div>
      </div>

      {/* ════════ Core Orb — protagonist ════════ */}
      <div className="fade-in-up" style={{ animationDelay: '180ms' }}>
        <WaveCircle status={status} onClick={handleOrbClick} />
      </div>

      {/* ════════ Waveform (recording) ════════ */}
      {isRecording && (
        <div className="fade-in" style={{ marginTop: -8, marginBottom: 14, textAlign: 'center' }}>
          <canvas ref={canvasRef} style={{
            width: '100%', maxWidth: 460, height: 44,
            borderRadius: 12, background: 'rgba(0,0,0,0.1)', margin: '0 auto',
          }} />
        </div>
      )}

      {/* ════════ Bilingual Cards ════════ */}
      {showCards && (
        <div className="stagger" style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <div className="fade-in-up glass-card" style={{
            flex: '1 1 320px', padding: '20px 24px', borderRadius: 20,
            background: 'rgba(7,12,9,0.48)', backdropFilter: 'blur(26px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-card)', minWidth: 260,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-tertiary)', marginBottom: 12 }}>Original</div>
            <p style={{ color: '#fff', fontSize: 15, lineHeight: 1.7, margin: '0 0 14px', fontWeight: 450, minHeight: 36 }}>{srcText}</p>
            <div style={{ display: 'flex', gap: 14 }}>
              <Tooltip title="Copy"><CopyOutlined style={{ cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: 15 }} onClick={() => { navigator.clipboard.writeText(srcText); message.success('Copied'); }} /></Tooltip>
              <Tooltip title="Play"><CaretRightOutlined style={{ cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: 15 }} /></Tooltip>
            </div>
          </div>
          <div className="fade-in-up glass-card" style={{
            flex: '1 1 320px', padding: '20px 24px', borderRadius: 20,
            background: 'rgba(7,12,9,0.48)', backdropFilter: 'blur(26px) saturate(180%)',
            border: '1px solid rgba(74,222,128,0.12)', boxShadow: 'var(--shadow-card)', minWidth: 260,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>Translation</div>
            <p style={{ color: '#fff', fontSize: 15, lineHeight: 1.7, margin: '0 0 14px', fontWeight: 450, minHeight: 36 }}>{tgtText}</p>
            <div style={{ display: 'flex', gap: 14 }}>
              <Tooltip title="Copy"><CopyOutlined style={{ cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: 15 }} onClick={() => { navigator.clipboard.writeText(tgtText); message.success('Copied'); }} /></Tooltip>
              <Tooltip title="Play"><CaretRightOutlined style={{ cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: 15 }} /></Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* ════════ AI Summary ════════ */}
      {summary && (
        <div className="fade-in-up glass-card" style={{
          marginTop: 16, padding: '20px 24px', borderRadius: 20,
          background: 'rgba(7,12,9,0.48)', backdropFilter: 'blur(26px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2DD4BF' }}>AI Summary</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Tooltip title="Regenerate"><ReloadOutlined style={{ cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: 14 }} /></Tooltip>
              <Tooltip title="Copy"><CopyOutlined style={{ cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: 14 }} /></Tooltip>
              <Tooltip title="Export"><DownloadOutlined style={{ cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: 14 }} /></Tooltip>
            </div>
          </div>
          <pre style={{ color: 'var(--ink-primary)', fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{summary}</pre>
        </div>
      )}

      {/* ════════ Mac Dock — Glass Capsule ════════ */}
      <div className="fade-in-up dock-bar" style={{ animationDelay: '350ms' }}>
        <div className="dock-bar-inner">
          {DOCK_ITEMS.map((item, i) =>
            item === null ? (
              <span key={`sep-${i}`} className="dock-sep" />
            ) : (
              <div key={item.label} className="dock-item">
                <span className="dock-dot" />
                {item.label}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
