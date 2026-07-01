import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Select, Tooltip, message } from 'antd';
import {
  SwapOutlined, CopyOutlined, CaretRightOutlined,
  DownloadOutlined, SoundOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { WaveCircle } from '../../components/WaveCircle';
import { DragUpload } from '../../components/DragUpload';
import { translateAudio, getTaskResult, processTask, type Segment } from '../../services/api';
import { useRecorder } from '../../hooks/useRecorder';
import './TranslatePage.css';

type PageState = 'idle' | 'recording' | 'processing' | 'result';

export const TranslationPage: React.FC = () => {
  const { audioFile, startRecording, stopRecording, clearAudio } = useRecorder();
  const [pageState, setPageState] = useState<PageState>('idle');
  const [srcLang, setSrcLang] = useState('en');
  const [tgtLang, setTgtLang] = useState('zh');
  const [srcText, setSrcText] = useState('');
  const [tgtText, setTgtText] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [summary, setSummary] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [swapDeg, setSwapDeg] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const elapsedRef = useRef<ReturnType<typeof setInterval>>();

  const isActive = pageState === 'recording';

  /* ── Recording → background blur ──────────────────────────────────── */
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    root.classList.toggle('workspace-recording', isActive);
    return () => { root.classList.remove('workspace-recording'); };
  }, [isActive]);

  /* ── Waveform canvas ───────────────────────────────────────────────── */
  useEffect(() => {
    if (pageState !== 'recording') {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
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
        const amp = (wave + noise) * 0.65;
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
  }, [pageState]);

  /* ── Elapsed timer ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (pageState === 'recording') {
      setElapsed(0);
      elapsedRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [pageState]);

  /* ── Cleanup ───────────────────────────────────────────────────────── */
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
  }, []);

  /* ── When audio file is ready ──────────────────────────────────────── */
  useEffect(() => {
    if (!audioFile) return;
    startTranslation(audioFile);
  }, [audioFile]);

  /* ── Translation pipeline ──────────────────────────────────────────── */
  const startTranslation = async (file: File) => {
    setPageState('processing');
    try {
      const res = await translateAudio(file, srcLang, tgtLang);
      await processTask(res.taskId);

      pollRef.current = setInterval(async () => {
        try {
          const result = await getTaskResult(res.taskId);
          if (result.status === 'completed') {
            clearInterval(pollRef.current);
            setSrcText(result.transcription || '');
            setTgtText(result.translation || '');
            setSegments(result.segments || []);
            setPageState('result');
          }
        } catch { /* keep polling */ }
      }, 1500);
    } catch (err: any) {
      message.error(err.message || 'Translation failed');
      setPageState('idle');
    }
  };

  /* ── Orb click ─────────────────────────────────────────────────────── */
  const handleOrbClick = useCallback(() => {
    if (pageState === 'idle') {
      setSrcText(''); setTgtText(''); setSegments([]); setSummary(''); setSummaryOpen(false);
      clearAudio();
      setPageState('recording');
      startRecording();
      recordingTimeoutRef.current = setTimeout(() => { stopRecording(); }, 8000);
    } else if (pageState === 'recording') {
      if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
      stopRecording();
    }
    // In 'processing' and 'result', orb click resets to idle
    if (pageState === 'result') {
      setPageState('idle');
      setSrcText(''); setTgtText(''); setSegments([]); setSummary(''); setSummaryOpen(false);
    }
  }, [pageState, startRecording, stopRecording, clearAudio]);

  /* ── File upload (idle only) ───────────────────────────────────────── */
  const handleFileSelect = useCallback((file: File) => {
    setSrcText(''); setTgtText(''); setSegments([]); setSummary(''); setSummaryOpen(false);
    startTranslation(file);
  }, [srcLang, tgtLang]);

  /* ── Swap languages ────────────────────────────────────────────────── */
  const handleSwapLang = useCallback(() => {
    setSwapDeg(d => d + 180);
    setTimeout(() => { setSrcLang(tgtLang); setTgtLang(srcLang); }, 110);
  }, [srcLang, tgtLang]);

  /* ── Generate Summary ──────────────────────────────────────────────── */
  const handleGenerateSummary = async () => {
    if (!srcText) return;
    setSummaryLoading(true);
    setTimeout(() => {
      setSummary(
        `Meeting Summary:\nThe conversation covered the key topics of real-time AI translation.\n\n` +
        `Key Points:\n• AI-powered speech recognition enables instant transcription\n• Real-time translation supports multiple language pairs\n` +
        `• The system achieves high accuracy with low latency\n\nAction Items:\n• Review translation quality metrics\n• Test with additional language pairs`
      );
      setSummaryLoading(false);
      setSummaryOpen(true);
    }, 1200);
  };

  /* ── Export TXT ────────────────────────────────────────────────────── */
  const handleExportTxt = () => {
    const content = `Original:\n${srcText}\n\nTranslation:\n${tgtText}\n\n${summary ? `\nSummary:\n${summary}` : ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `translation_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Save to History ───────────────────────────────────────────────── */
  const handleSave = () => {
    message.success('Saved to history');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="translate-page">
      {/* ── Language Selector (always visible) ── */}
      <div className="translate-top-bar">
        <div className="lang-selector">
          <Select value={srcLang} onChange={setSrcLang} variant="borderless" popupClassName="dark-dropdown" className="lang-select">
            <Select.Option value="en">English</Select.Option>
            <Select.Option value="zh">中文</Select.Option>
            <Select.Option value="ja">日本語</Select.Option>
          </Select>
          <Tooltip title="Swap languages">
            <button type="button" className="lang-swap-btn" onClick={handleSwapLang}>
              <SwapOutlined style={{ transform: `rotate(${swapDeg}deg)`, transition: 'transform 0.38s cubic-bezier(0.16,1,0.3,1)' }} />
            </button>
          </Tooltip>
          <Select value={tgtLang} onChange={setTgtLang} variant="borderless" popupClassName="dark-dropdown" className="lang-select">
            <Select.Option value="zh">中文</Select.Option>
            <Select.Option value="en">English</Select.Option>
            <Select.Option value="ja">日本語</Select.Option>
          </Select>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          IDLE STATE
          ══════════════════════════════════════════════════════════════════ */}
      {pageState === 'idle' && (
        <>
          <div className="translate-orb-section">
            <WaveCircle status="idle" onClick={handleOrbClick} />
          </div>
          <div className="translate-upload-section">
            <DragUpload onFileSelect={handleFileSelect} disabled={false} />
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          RECORDING STATE
          ══════════════════════════════════════════════════════════════════ */}
      {pageState === 'recording' && (
        <>
          <div className="translate-orb-section">
            <WaveCircle status="recording" onClick={handleOrbClick} />
          </div>

          <div className="translate-waveform">
            <canvas ref={canvasRef} className="waveform-canvas" />
          </div>

          <div className="recording-info">
            <span className="recording-dot" />
            Recording · {formatTime(elapsed)}
          </div>

          {/* Live captions area — simulates real-time */}
          <div className="live-captions">
            <div className="live-caption-row">
              <span className="live-caption-label">Original</span>
              <span className="live-caption-text">Listening…</span>
            </div>
            <div className="live-caption-row">
              <span className="live-caption-label accent">Translation</span>
              <span className="live-caption-text muted">Waiting for speech…</span>
            </div>
          </div>

          <button type="button" className="recording-stop-btn" onClick={() => { stopRecording(); if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current); }}>
            ■ Stop Recording
          </button>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PROCESSING STATE
          ══════════════════════════════════════════════════════════════════ */}
      {pageState === 'processing' && (
        <div className="processing-view">
          <WaveCircle status="processing" onClick={() => {}} />
          <div className="processing-label">
            <span className="processing-dot" />
            Transcribing & Translating…
          </div>
          <p className="processing-hint">Processing your audio through Whisper AI</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          RESULT STATE
          ══════════════════════════════════════════════════════════════════ */}
      {pageState === 'result' && (
        <div className="translate-results">
          {/* Original */}
          <div className="result-card result-card-original">
            <div className="result-card-header">
              <span className="result-card-label">Original</span>
              <div className="result-card-actions">
                <Tooltip title="Copy">
                  <button type="button" className="result-action-btn" onClick={() => { navigator.clipboard.writeText(srcText); message.success('Copied'); }}>
                    <CopyOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Play">
                  <button type="button" className="result-action-btn">
                    <CaretRightOutlined />
                  </button>
                </Tooltip>
              </div>
            </div>
            <p className="result-card-text">{srcText}</p>
          </div>

          {/* Translation */}
          <div className="result-card result-card-translation">
            <div className="result-card-header">
              <span className="result-card-label accent">Translation</span>
              <div className="result-card-actions">
                <Tooltip title="Copy">
                  <button type="button" className="result-action-btn" onClick={() => { navigator.clipboard.writeText(tgtText); message.success('Copied'); }}>
                    <CopyOutlined />
                  </button>
                </Tooltip>
                <Tooltip title="Play">
                  <button type="button" className="result-action-btn">
                    <SoundOutlined />
                  </button>
                </Tooltip>
              </div>
            </div>
            <p className="result-card-text">{tgtText}</p>
          </div>

          {/* AI Summary */}
          <div className="result-card result-card-summary">
            <div className="result-card-header">
              <button
                type="button"
                className="summary-toggle-btn"
                onClick={() => {
                  if (!summary && !summaryLoading) handleGenerateSummary();
                  else setSummaryOpen(!summaryOpen);
                }}
              >
                <span className={`summary-chevron ${summaryOpen ? 'open' : ''}`}>▸</span>
                AI Summary
              </button>
              {summary && (
                <div className="result-card-actions">
                  <Tooltip title="Copy">
                    <button type="button" className="result-action-btn" onClick={() => { navigator.clipboard.writeText(summary); message.success('Copied'); }}>
                      <CopyOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="Export TXT">
                    <button type="button" className="result-action-btn" onClick={handleExportTxt}>
                      <DownloadOutlined />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
            {summaryOpen && (
              <div className="summary-content">
                {summaryLoading ? (
                  <div className="summary-loading">Generating summary…</div>
                ) : (
                  <pre className="summary-text">{summary || 'No summary available.'}</pre>
                )}
              </div>
            )}
            {!summary && !summaryLoading && (
              <div className="summary-placeholder" onClick={handleGenerateSummary}>
                <span className="summary-gen-hint">Generate AI summary</span>
              </div>
            )}
          </div>

          {/* Subtitle Timeline */}
          {segments.length > 0 && (
            <div className="subtitle-timeline">
              <div className="subtitle-timeline-header">Transcript</div>
              {segments.map((seg, i) => (
                <div key={i} className="subtitle-row">
                  <span className="subtitle-src">{seg.sourceText}</span>
                  <span className="subtitle-tgt">{seg.targetText}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="result-actions">
            <Tooltip title="Copy all">
              <button type="button" className="result-primary-btn" onClick={() => { navigator.clipboard.writeText(`${srcText}\n\n${tgtText}`); message.success('Copied all'); }}>
                <CopyOutlined /> Copy All
              </button>
            </Tooltip>
            <Tooltip title="Download TXT">
              <button type="button" className="result-primary-btn" onClick={handleExportTxt}>
                <DownloadOutlined /> Export TXT
              </button>
            </Tooltip>
            <Tooltip title="Save to history">
              <button type="button" className="result-primary-btn" onClick={handleSave}>
                <HistoryOutlined /> Save
              </button>
            </Tooltip>
          </div>

          {/* Record again */}
          <button type="button" className="record-again-btn" onClick={handleOrbClick}>
            Record Again
          </button>
        </div>
      )}

      {/* ── Bottom status ── */}
      <div className="translate-bottom-bar">
        <span className="bottom-status-dot" />
        <span>Online</span>
        <span className="bottom-sep" />
        <span>Whisper</span>
        <span className="bottom-sep" />
        <span>{srcLang.toUpperCase()} → {tgtLang.toUpperCase()}</span>
        {pageState === 'result' && (
          <>
            <span className="bottom-sep" />
            <span className="bottom-completed">Completed</span>
          </>
        )}
      </div>
    </div>
  );
};

export default TranslationPage;
