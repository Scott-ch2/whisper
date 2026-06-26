import React, { useState } from 'react';
import { Select, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { WaveCircle } from '../components/WaveCircle';
import { DragUpload } from '../components/DragUpload';
import { ResultCard } from '../components/ResultCard';
import { useRecorder } from '../hooks/useRecorder';

export const TranslationPage: React.FC = () => {
  const { isRecording, audioFile: recordedFile, startRecording, stopRecording, clearAudio } = useRecorder();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [srcLang, setSrcLang] = useState('auto');
  const [tgtLang, setTgtLang] = useState('en');

  const activeFile = recordedFile || uploadedFile;

  const handleRecordClick = () => {
    if (isRecording) stopRecording();
    else { setUploadedFile(null); startRecording(); }
  };

  const handleFileSelect = (file: File) => {
    clearAudio();
    setUploadedFile(file);
    message.success(`已选择: ${file.name}`);
  };

  const submitForTranslation = () => {
    if (!activeFile) return;
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      setResults(prev => [{
        id: Date.now(),
        src: '深夜的麦克风前，录下一段即兴的想法，让语言不再是障碍。',
        tgt: 'Before the microphone in the late hours, recording spontaneous thoughts, letting language no longer be a barrier.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...prev]);
      message.success('翻译完成');
      clearAudio();
      setUploadedFile(null);
    }, 2200);
  };

  return (
    <div>

      {/* 语言选择栏 */}
      <div className="lang-bar stagger">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Select
            value={srcLang}
            onChange={setSrcLang}
            variant="borderless"
            className="lang-select"
          >
            <Select.Option value="auto">🌐 自动检测</Select.Option>
            <Select.Option value="zh">🇨🇳 中文</Select.Option>
            <Select.Option value="en">🇺🇸 English</Select.Option>
            <Select.Option value="ja">🇯🇵 日本語</Select.Option>
            <Select.Option value="ko">🇰🇷 한국어</Select.Option>
          </Select>

          <span className="lang-arrow">→</span>

          <Select
            value={tgtLang}
            onChange={setTgtLang}
            variant="borderless"
            className="lang-select"
          >
            <Select.Option value="zh">🇨🇳 中文</Select.Option>
            <Select.Option value="en">🇺🇸 English</Select.Option>
          </Select>
        </div>

        {activeFile && !isRecording && (
          <Button
            type="primary"
            shape="round"
            icon={<SendOutlined />}
            loading={isTranslating}
            onClick={submitForTranslation}
            className="btn-translate"
          >
            开始翻译
          </Button>
        )}
      </div>

      {/* 录音按钮 */}
      <WaveCircle isRecording={isRecording} isLoading={isTranslating} onClick={handleRecordClick} />

      {/* 无文件时 = 拖拽上传 */}
      {!isRecording && !activeFile && (
        <div className="fade-in-up" style={{ marginTop: -20 }}>
          <DragUpload onFileSelect={handleFileSelect} disabled={isTranslating} />
        </div>
      )}

      {/* 文件就绪 */}
      {!isRecording && activeFile && (
        <div className="fade-in-up file-ready">
          <div className="file-ready-name">🎙 {activeFile.name}</div>
          <div className="file-ready-size">{(activeFile.size / 1024 / 1024).toFixed(2)} MB</div>
          <Button
            type="text"
            size="small"
            style={{ marginTop: 8, color: 'var(--c-ink-muted)' }}
            onClick={() => { clearAudio(); setUploadedFile(null); }}
            disabled={isTranslating}
          >
            重新选择
          </Button>
        </div>
      )}

      {/* 翻译结果 */}
      {results.length > 0 && (
        <div style={{ marginTop: 52 }}>
          <div className="results-header">翻译结果</div>
          {results.map(res => (
            <ResultCard
              key={res.id}
              sourceText={res.src}
              targetText={res.tgt}
              time={res.time}
            />
          ))}
        </div>
      )}

    </div>
  );
};
