import { File as FileIcon, Image, X } from 'lucide-react';

import { formatFileSize } from '../lib/file-helpers';
import { useFileField } from '../model/use-file-field';
import { useColors } from '@/shared/theme';

export function FileFieldInput({ fieldName }: { fieldName: string }) {
  const colors = useColors();
  const {
    attachment,
    isDragging,
    error,
    inputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
    handleInputChange,
    handleRemove,
    handleClick,
  } = useFileField(fieldName);

  // 파일 선택 완료 상태
  if (attachment) {
    const isImage = attachment.file.type.startsWith('image/');

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.6rem 1rem',
          backgroundColor: colors.bg.input,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          flex: 1,
        }}
      >
        {/* 이미지 썸네일 or 파일 아이콘 */}
        {isImage && attachment.preview ? (
          <img
            src={attachment.preview}
            alt={attachment.file.name}
            style={{
              width: 32,
              height: 32,
              objectFit: 'cover',
              borderRadius: '0.4rem',
              flexShrink: 0,
            }}
          />
        ) : (
          <FileIcon size={16} style={{ color: colors.text.secondary, flexShrink: 0 }} />
        )}

        {/* 파일 메타 정보 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '1.2rem',
              fontFamily: 'monospace',
              color: colors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {attachment.file.name}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.6rem',
              fontSize: '1rem',
              color: colors.text.tertiary,
              marginTop: '0.2rem',
            }}
          >
            <span>{formatFileSize(attachment.file.size)}</span>
            <span>·</span>
            <span>{attachment.file.type || 'unknown'}</span>
          </div>
        </div>

        {/* Replace 버튼 */}
        <button
          onClick={handleClick}
          style={{
            padding: '0.3rem 0.8rem',
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border.default}`,
            borderRadius: '0.4rem',
            color: colors.text.secondary,
            fontSize: '1.1rem',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Replace
        </button>

        {/* 제거 버튼 */}
        <button
          onClick={handleRemove}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.2rem',
            height: '2.2rem',
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border.default}`,
            borderRadius: '0.4rem',
            color: colors.feedback.error,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>

        <input
          ref={inputRef}
          type='file'
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  // 파일 미선택 상태 (드롭존)
  return (
    <div style={{ flex: 1 }}>
      <div
        role='button'
        tabIndex={0}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: '1.2rem',
          border: `1.5px dashed ${isDragging ? colors.interactive.primary : colors.border.default}`,
          borderRadius: '0.6rem',
          backgroundColor: isDragging ? `${colors.interactive.primary}10` : 'transparent',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          outline: 'none',
        }}
      >
        <Image size={18} style={{ color: colors.text.tertiary }} />
        <span style={{ fontSize: '1.1rem', color: colors.text.tertiary }}>
          Drop file here or click to browse
        </span>
        <span style={{ fontSize: '1rem', color: colors.text.disabled }}>
          Paste from clipboard (Ctrl+V) · Max 10MB
        </span>
      </div>

      {error && (
        <div
          style={{
            marginTop: '0.4rem',
            fontSize: '1.1rem',
            color: colors.feedback.error,
            padding: '0.4rem 0.6rem',
          }}
        >
          {error}
        </div>
      )}

      <input ref={inputRef} type='file' onChange={handleInputChange} style={{ display: 'none' }} />
    </div>
  );
}
