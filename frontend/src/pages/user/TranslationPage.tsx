import React, { useState, useRef, useEffect } from 'react';
import { Select, Button, message, Tooltip } from 'antd';
import {
  SwapOutlined, CopyOutlined, SoundOutlined, StarOutlined,
  ReloadOutlined, ClearOutlined, PlayCircleOutlined, CheckCircleOutlined,
  ExportOutlined, SearchOutlined, StarFilled, EditOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import { WaveCircle } from '../../components/WaveCircle';

type OrbStatus = 'idle' | 'listening' | 'thinking' | 'translating' | 'speaking' | 'finished';

const TOOL_ITEMS = [
  { key: 'auto-detect', icon: <SearchOutlined />, label: '自动识别' },
  { key: 'subtitle',    icon: <EditOutlined />,  label: '实时字幕' },
  { key: 'meeting',     icon: <SoundOutlined />,  label: '会议模式' },
  { key: 'fav',         icon: <StarOutlined />,   label: '收藏' },
  { key: 'export',      icon: <ExportOutlined />, label: '导出' },
  { key: 'clear',       icon: <ClearOutlined />,  label: '清空' },
  { key: 'new',         icon: <ReloadOutlined />, label: '新会话' },
];

export const TranslationPage: React.FC = () => {
  const [status, setStatus] = useState<OrbStatus>('idle');
  const [srcLang, setSrcLang] = useState('auto');
  const [tgtLang, setTgtLang] = useState('zh');
  const [srcText, setSrcText] = useState('');
  const [tgtText, setTgtText] = useState('');
  const [summary, setSummary] = useState('');
  const [isFav, setIsFav] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // 模拟实时波形
  useEffect(() => {
    if (status !== 'listening' && status !== 'speaking') {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width = canvas.offsetWidth * 2;
      const h = canvas.height = canvas.offsetHeight * 2;
      ctx.clearRect(0, 0, w, h);

      const bars = 40;
      const barW = w / bars - 2;
      for (let i = 0; i < bars; i++) {
        const amp = Math.sin(Date.now() * 0.005 + i * 0.5) * 0.5 + 0.5;
        const hBar = (status === 'speaking' ? amp * 0.7 : amp) * h * 0.8;
        const x = i * (w / bars) + 1;
        const y = (h - hBar) / 2;
        const grad = ctx.createLinearGradient(x, y, x, y + hBar);
        grad.addColorStop(0, '#53FF88');
        grad.addColorStop(1, '#2DD4BF');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, hBar, 4);
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [status]);

  const handleOrbClick = () => {
    if (status === 'idle' || status === 'finished') {
      setStatus('listening');
      setSrcText(''); setTgtText(''); setSummary('');
      // 模拟录音 3s → thinking 1.5s → translating 2s → speaking 3s → finished
      setTimeout(() => setStatus('thinking'), 3000);
      setTimeout(() => setStatus('translating'), 4500);
      setTimeout(() => { setStatus('speaking'); setSrcText('Hello everyone, welcome to the AI translation demo.'); setTgtText('大家好,欢迎体验 AI 实时翻译演示。'); }, 6500);
      setTimeout(() => { setStatus('finished'); setSummary('• 会议讨论了 API 接口\n• 确认开发计划\n• 下一步进行测试'); }, 9500);
    } else {
      setStatus('idle');
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
  };

  const handleSwapLang = () => {
    if (srcLang === 'auto') return;
    setSrcLang(tgtLang); setTgtLang(srcLang);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 60 }}>
      {/* ====== 顶部标题 ====== */}
      <div style={{ textAlign: 'center', marginBottom: 28 }} className="fade-in-up">
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#fff', fontFamily: "'Amigate', serif", letterSpacing: 2 }}>
          AI Translator
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--c-ink-muted)' }}>Real-time Speech Translation</p>
      </div>

      {/* ====== 语言选择器 ====== */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }} className="fade-in-up">
        <div className="glass-card" style={{ padding: '8px 22px', borderRadius: 50, display: 'inline-flex', gap: 10, alignItems: 'center' }}>
          <Select value={srcLang} onChange={setSrcLang} style={{ width: 130 }} bordered={false} popupClassName="dark-dropdown">
            <Select.Option value="auto">🌐 自动检测</Select.Option>
            <Select.Option value="en">🇺🇸 English</Select.Option>
            <Select.Option value="zh">🇨🇳 中文</Select.Option>
            <Select.Option value="ja">🇯🇵 日本語</Select.Option>
          </Select>
          <Tooltip title="交换语言">
            <span onClick={handleSwapLang} style={{ color: 'var(--neon-green)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
              <SwapOutlined />
            </span>
          </Tooltip>
          <Select value={tgtLang} onChange={setTgtLang} style={{ width: 130 }} bordered={false} popupClassName="dark-dropdown">
            <Select.Option value="zh">🇨🇳 中文</Select.Option>
            <Select.Option value="en">🇺🇸 English</Select.Option>
            <Select.Option value="ja">🇯🇵 日本語</Select.Option>
          </Select>
        </div>
      </div>

      {/* ====== AI 录音球 ====== */}
      <WaveCircle status={status} onClick={handleOrbClick} />

      {/* ====== 实时波形 ====== */}
      {(status === 'listening' || status === 'speaking') && (
        <div className="fade-in-up" style={{ marginTop: -10, marginBottom: 24, textAlign: 'center' }}>
          <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 400, height: 48, borderRadius: 10, background: 'rgba(0,0,0,0.2)' }} />
        </div>
      )}

      {/* ====== 双语翻译卡片 ====== */}
      {srcText && (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          {/* Original */}
          <div className="glass-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--c-ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Original</div>
            <p style={{ color: '#fff', fontSize: 16, lineHeight: 1.6, margin: '0 0 12px' }}>{srcText}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Tooltip title="复制"><CopyOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} onClick={() => { navigator.clipboard.writeText(srcText); message.success('已复制'); }} /></Tooltip>
              <Tooltip title="播放"><SoundOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} /></Tooltip>
              <Tooltip title="收藏"><StarOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} /></Tooltip>
            </div>
          </div>

          {/* Translation */}
          <div className="glass-card" style={{ padding: '20px 24px', borderColor: 'rgba(83,255,136,0.2)' }}>
            <div style={{ fontSize: 12, color: 'var(--neon-green)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Translation</div>
            <p style={{ color: '#fff', fontSize: 16, lineHeight: 1.6, margin: '0 0 12px' }}>{tgtText}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Tooltip title="复制"><CopyOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} onClick={() => { navigator.clipboard.writeText(tgtText); message.success('已复制'); }} /></Tooltip>
              <Tooltip title="播放"><SoundOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} /></Tooltip>
              <Tooltip title="收藏"><StarOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} /></Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* ====== AI 总结 ====== */}
      {summary && (
        <div className="glass-card fade-in-up" style={{ marginTop: 20, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--neon-cyan)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Summary</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tooltip title="重新生成"><ReloadOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} /></Tooltip>
              <Tooltip title="复制"><CopyOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} /></Tooltip>
              <Tooltip title="导出 Markdown"><ExportOutlined style={{ cursor: 'pointer', color: 'var(--c-ink-muted)' }} /></Tooltip>
            </div>
          </div>
          <pre style={{ color: 'var(--c-ink)', fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{summary}</pre>
        </div>
      )}

      {/* ====== 底部工具栏 ====== */}
      <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 36 }}>
        {TOOL_ITEMS.map(t => (
          <Button
            key={t.key}
            type="text"
            icon={t.icon}
            style={{ color: 'var(--c-ink-muted)', fontSize: 13, borderRadius: 20, padding: '4px 16px' }}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
