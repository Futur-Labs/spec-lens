import { useRef, useState } from 'react';

import { File as FileIcon, Image, Plus, X } from 'lucide-react';

import { formatFileSize } from '../lib/file-helpers';
import { useFileAttachments } from '../model/file-attachments-context';
import { useFileField } from '../model/use-file-field';
import { useColors } from '@/shared/theme';

function SingleFileInput({ fieldName }: { fieldName: string }) {
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

function MultipleFileInput({ fieldName }: { fieldName: string }) {
  const colors = useColors();
  const { addMultipleFile, getMultipleAttachments, removeMultipleFile } = useFileAttachments();
  const files = getMultipleAttachments(fieldName);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList) => {
    setError(null);
    for (const file of Array.from(fileList)) {
      const err = addMultipleFile(fieldName, file);
      if (err) {
        setError(err);
        break;
      }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {files.map((attachment, index) => {
        const isImage = attachment.file.type.startsWith('image/');
        return (
          <div
            key={attachment.fieldName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.5rem 1rem',
              backgroundColor: colors.bg.input,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '0.6rem',
            }}
          >
            {isImage && attachment.preview ? (
              <img
                src={attachment.preview}
                alt={attachment.file.name}
                style={{
                  width: 28,
                  height: 28,
                  objectFit: 'cover',
                  borderRadius: '0.4rem',
                  flexShrink: 0,
                }}
              />
            ) : (
              <FileIcon size={14} style={{ color: colors.text.secondary, flexShrink: 0 }} />
            )}
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
              <span style={{ fontSize: '1rem', color: colors.text.tertiary }}>
                {formatFileSize(attachment.file.size)}
              </span>
            </div>
            <button
              onClick={() => removeMultipleFile(fieldName, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border.default}`,
                borderRadius: '0.4rem',
                color: colors.feedback.error,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      <div
        role='button'
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          padding: files.length > 0 ? '0.8rem' : '1.2rem',
          border: `1.5px dashed ${isDragging ? colors.interactive.primary : colors.border.default}`,
          borderRadius: '0.6rem',
          backgroundColor: isDragging ? `${colors.interactive.primary}10` : 'transparent',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          outline: 'none',
        }}
      >
        <Plus size={14} style={{ color: colors.text.tertiary }} />
        <span style={{ fontSize: '1.1rem', color: colors.text.tertiary }}>
          {files.length > 0 ? 'Add more files' : 'Drop files here or click to browse'}
        </span>
      </div>

      {error && (
        <div
          style={{
            fontSize: '1.1rem',
            color: colors.feedback.error,
            padding: '0.4rem 0.6rem',
          }}
        >
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type='file'
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export function FileFieldInput({
  fieldName,
  multiple,
}: {
  fieldName: string;
  multiple?: boolean;
}) {
  if (multiple) {
    return <MultipleFileInput fieldName={fieldName} />;
  }
  return <SingleFileInput fieldName={fieldName} />;
}
