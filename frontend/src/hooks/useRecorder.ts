import { useState, useRef } from 'react';
import { message } from 'antd';

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        // 伪装成 File 对象，方便后续统一上传逻辑
        const file = new File([audioBlob], `record_${new Date().getTime()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);

        // 释放麦克风硬件资源
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('获取麦克风失败:', err);
      message.error('无法获取麦克风权限，请检查浏览器设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => setAudioFile(null);

  return { isRecording, audioFile, startRecording, stopRecording, clearAudio };
};