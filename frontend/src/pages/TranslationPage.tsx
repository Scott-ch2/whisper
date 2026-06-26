import React, { useState, useEffect } from 'react';
import { Select, Button, message } from 'antd';
import { ClearOutlined, SendOutlined } from '@ant-design/icons';
import { WaveCircle } from '../components/WaveCircle';
import { DragUpload } from '../components/DragUpload';
import { ResultCard } from '../components/ResultCard';
import { useRecorder } from '../hooks/useRecorder';

export const TranslationPage: React.FC = () => {
  // 引入我们自己写的麦克风 Hook
  const { isRecording, audioFile: recordedFile, startRecording, stopRecording, clearAudio } = useRecorder();

  // 页面业务状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // 当前准备处理的文件（无论是录音还是上传的）
  const activeFile = recordedFile || uploadedFile;

  // 触发录音
  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setUploadedFile(null); // 录音前清空可能存在的上传文件
      startRecording();
    }
  };

  // 触发上传
  const handleFileSelect = (file: File) => {
    clearAudio(); // 上传文件前清空可能存在的录音
    setUploadedFile(file);
    message.success(`已选择文件: ${file.name}`);
  };

  // 提交给 AI 处理
  const submitForTranslation = () => {
    if (!activeFile) return;

    setIsTranslating(true);
    // 这里模拟网络请求延迟，未来替换为 axios 调用后端
    setTimeout(() => {
      setIsTranslating(false);
      setResults(prev => [{
        id: Date.now(),
        src: '这是一个测试语音，用来验证机器翻译系统的效果。我们采用了全新的玻璃拟态界面。',
        tgt: 'This is a test voice to verify the effectiveness of the machine translation system. We have adopted a brand new glassmorphism interface.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }, ...prev]); // 新结果插在最前面

      message.success('翻译完成！');
      // 处理完清空当前文件，准备下一次
      clearAudio();
      setUploadedFile(null);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }} className="fade-in-up">

      {/* 顶部语言控制栏 */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Select defaultValue="auto" style={{ width: 140 }} bordered={false}>
            <Select.Option value="auto">🌐 自动检测</Select.Option>
            <Select.Option value="zh">🇨🇳 中文</Select.Option>
            <Select.Option value="en">🇺🇸 英文</Select.Option>
          </Select>
          <span style={{ color: '#ccc' }}>→</span>
          <Select defaultValue="en" style={{ width: 120 }} bordered={false}>
            <Select.Option value="zh">🇨🇳 中文</Select.Option>
            <Select.Option value="en">🇺🇸 英文</Select.Option>
          </Select>
        </div>

        {/* 如果有文件就绪，显示提交按钮 */}
        {activeFile && !isRecording && (
          <Button
            type="primary"
            shape="round"
            icon={<SendOutlined />}
            loading={isTranslating}
            onClick={submitForTranslation}
            style={{ background: 'var(--color-primary-cyan)', borderColor: 'var(--color-primary-cyan)' }}
          >
            开始智能翻译
          </Button>
        )}
      </div>

      {/* 核心交互区 */}
      <div style={{ position: 'relative', marginBottom: 60 }}>
        <WaveCircle
          isRecording={isRecording}
          isLoading={isTranslating}
          onClick={handleRecordClick}
        />

        {/* 当没有在录音，也没有文件准备好时，显示拖拽上传 */}
        {!isRecording && !activeFile && (
          <div className="fade-in-up" style={{ marginTop: 20 }}>
            <DragUpload onFileSelect={handleFileSelect} disabled={isTranslating} />
          </div>
        )}

        {/* 当有文件准备好时，显示文件状态卡片 */}
        {!isRecording && activeFile && (
          <div className="glass-card fade-in-up" style={{ marginTop: 20, padding: '16px', textAlign: 'center', borderColor: 'var(--color-success)' }}>
            <div style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
              🎙️ 音频已就绪: {activeFile.name}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              大小: {(activeFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
            <Button
              type="text"
              danger
              icon={<ClearOutlined />}
              size="small"
              style={{ marginTop: 8 }}
              onClick={() => { clearAudio(); setUploadedFile(null); }}
              disabled={isTranslating}
            >
              重新录制/选择
            </Button>
          </div>
        )}
      </div>

      {/* 翻译结果展示区 */}
      {results.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--color-primary-cyan)', fontWeight: 'bold' }}>
            ✨ 最近翻译结果
          </div>
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