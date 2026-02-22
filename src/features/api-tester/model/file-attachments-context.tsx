import { type ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

import type {
  FileAttachment,
  FileAttachmentsContextValue,
  FileEntry,
} from './file-attachments.types';
import { fileToBase64 } from '../lib/file-helpers';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FileAttachmentsContext = createContext<FileAttachmentsContextValue | null>(null);

export function FileAttachmentsProvider({ children }: { children: ReactNode }) {
  const [attachments, setAttachments] = useState<Map<string, FileAttachment>>(new Map());
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const revokePreview = (url: string) => {
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  };

  const setAttachment = (fieldName: string, file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    setAttachments((prev) => {
      const next = new Map(prev);
      const existing = prev.get(fieldName);
      if (existing?.preview) {
        revokePreview(existing.preview);
      }

      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
        previewUrlsRef.current.add(preview);
      }

      next.set(fieldName, { file, fieldName, preview });
      return next;
    });

    return null;
  };

  const removeAttachment = (fieldName: string) => {
    setAttachments((prev) => {
      const next = new Map(prev);
      const existing = prev.get(fieldName);
      if (existing?.preview) {
        revokePreview(existing.preview);
      }
      next.delete(fieldName);
      return next;
    });
  };

  const clearAll = () => {
    setAttachments((prev) => {
      for (const attachment of prev.values()) {
        if (attachment.preview) {
          revokePreview(attachment.preview);
        }
      }
      return new Map();
    });
  };

  const toBase64Map = async (): Promise<Record<string, FileEntry>> => {
    const result: Record<string, FileEntry> = {};

    for (const [fieldName, attachment] of attachments) {
      const base64 = await fileToBase64(attachment.file);

      result[fieldName] = {
        __file: true,
        name: attachment.file.name,
        type: attachment.file.type || 'application/octet-stream',
        size: attachment.file.size,
        data: base64,
      };
    }

    return result;
  };

  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return (
    <FileAttachmentsContext
      value={{ attachments, setAttachment, removeAttachment, clearAll, toBase64Map }}
    >
      {children}
    </FileAttachmentsContext>
  );
}

export function useFileAttachments() {
  const ctx = useContext(FileAttachmentsContext);
  if (!ctx) throw new Error('useFileAttachments must be used within FileAttachmentsProvider');
  return ctx;
}
