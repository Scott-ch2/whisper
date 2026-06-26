import React from 'react';
import { Upload, Typography } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;
const { Text } = Typography;

interface DragUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const DragUpload: React.FC<DragUploadProps> = ({ onFileSelect, disabled }) => {
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'audio/*',
    disabled,
    showUploadList: false, // 我们自己控制 UI，不显示默认列表
    beforeUpload: (file) => {
      onFileSelect(file as File);
      return false; // 拦截默认的自动上传行为
    },
  };

  return (
    <div className="glass-card" style={{ padding: '4px', borderRadius: '16px' }}>
      <Dragger
        {...props}
        style={{
          background: 'transparent',
          border: '2px dashed var(--color-primary-cyan)',
          borderRadius: '12px'
        }}
      >
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined style={{ color: 'var(--color-primary-cyan)' }} />
        </p>
        <p className="ant-upload-text" style={{ color: 'var(--color-primary-dark)' }}>
          点击或将音频文件拖拽到这里上传
        </p>
        <p className="ant-upload-hint" style={{ color: '#888' }}>
          支持 MP3, WAV, M4A 格式，单次最大支持 50MB
        </p>
      </Dragger>
    </div>
  );
};