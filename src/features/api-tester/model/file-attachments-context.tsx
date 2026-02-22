import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  FileAttachment,
  FileAttachmentsContextValue,
  FileEntry,
} from './file-attachments.types';
import { fileToBase64 } from '../lib/file-helpers';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MULTI_FILE_SEPARATOR = '__';

const FileAttachmentsContext = createContext<FileAttachmentsContextValue | null>(null);

export function FileAttachmentsProvider({ children }: { children: ReactNode }) {
  const [attachments, setAttachments] = useState<Map<string, FileAttachment>>(new Map());
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const savedAttachmentsRef = useRef<Map<string, Map<string, FileAttachment>>>(new Map());

  const revokePreview = (url: string) => {
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  };

  const createPreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.add(preview);
      return preview;
    }
    return undefined;
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

      next.set(fieldName, { file, fieldName, preview: createPreview(file) });
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

  const addMultipleFile = useCallback((fieldName: string, file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    setAttachments((prev) => {
      const next = new Map(prev);

      // 다음 인덱스 찾기
      let maxIndex = -1;
      for (const key of prev.keys()) {
        if (key === fieldName) {
          maxIndex = Math.max(maxIndex, 0);
        } else if (key.startsWith(fieldName + MULTI_FILE_SEPARATOR)) {
          const idx = parseInt(key.slice(fieldName.length + MULTI_FILE_SEPARATOR.length), 10);
          if (!isNaN(idx)) maxIndex = Math.max(maxIndex, idx);
        }
      }

      const newKey =
        maxIndex === -1 ? fieldName : `${fieldName}${MULTI_FILE_SEPARATOR}${maxIndex + 1}`;
      next.set(newKey, { file, fieldName: newKey, preview: createPreview(file) });
      return next;
    });

    return null;
  }, []);

  const getMultipleAttachments = useCallback(
    (fieldName: string): FileAttachment[] => {
      const result: FileAttachment[] = [];
      for (const [key, attachment] of attachments) {
        if (key === fieldName || key.startsWith(fieldName + MULTI_FILE_SEPARATOR)) {
          result.push(attachment);
        }
      }
      return result;
    },
    [attachments],
  );

  const removeMultipleFile = useCallback((fieldName: string, index: number) => {
    setAttachments((prev) => {
      const keys = Array.from(prev.keys()).filter(
        (k) => k === fieldName || k.startsWith(fieldName + MULTI_FILE_SEPARATOR),
      );
      const keyToRemove = keys[index];
      if (!keyToRemove) return prev;

      const next = new Map(prev);
      const existing = prev.get(keyToRemove);
      if (existing?.preview) {
        revokePreview(existing.preview);
      }
      next.delete(keyToRemove);
      return next;
    });
  }, []);

  const saveForEndpoint = useCallback((endpointKey: string) => {
    setAttachments((current) => {
      if (current.size > 0) {
        savedAttachmentsRef.current.set(endpointKey, new Map(current));
      }
      return current;
    });
  }, []);

  const loadForEndpoint = useCallback((endpointKey: string) => {
    const saved = savedAttachmentsRef.current.get(endpointKey);
    setAttachments(saved ? new Map(saved) : new Map());
  }, []);

  const clearForEndpoint = useCallback((endpointKey: string) => {
    const saved = savedAttachmentsRef.current.get(endpointKey);
    if (saved) {
      for (const attachment of saved.values()) {
        if (attachment.preview) {
          revokePreview(attachment.preview);
        }
      }
      savedAttachmentsRef.current.delete(endpointKey);
    }
  }, []);

  const toBase64Map = async (): Promise<Record<string, FileEntry | FileEntry[]>> => {
    const result: Record<string, FileEntry | FileEntry[]> = {};

    // 다중 파일 키를 원래 필드명으로 그룹핑
    const grouped = new Map<string, { key: string; attachment: FileAttachment }[]>();
    for (const [key, attachment] of attachments) {
      const sepIndex = key.indexOf(MULTI_FILE_SEPARATOR);
      const baseFieldName = sepIndex !== -1 ? key.slice(0, sepIndex) : key;

      if (!grouped.has(baseFieldName)) {
        grouped.set(baseFieldName, []);
      }
      grouped.get(baseFieldName)!.push({ key, attachment });
    }

    for (const [baseField, entries] of grouped) {
      if (entries.length === 1 && entries[0].key === baseField) {
        // 단일 파일
        const { attachment } = entries[0];
        const base64 = await fileToBase64(attachment.file);
        result[baseField] = {
          __file: true,
          name: attachment.file.name,
          type: attachment.file.type || 'application/octet-stream',
          size: attachment.file.size,
          data: base64,
        };
      } else {
        // 다중 파일 → 배열
        const fileEntries: FileEntry[] = [];
        for (const { attachment } of entries) {
          const base64 = await fileToBase64(attachment.file);
          fileEntries.push({
            __file: true,
            name: attachment.file.name,
            type: attachment.file.type || 'application/octet-stream',
            size: attachment.file.size,
            data: base64,
          });
        }
        result[baseField] = fileEntries;
      }
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
      value={{
        attachments,
        setAttachment,
        removeAttachment,
        clearAll,
        toBase64Map,
        saveForEndpoint,
        loadForEndpoint,
        clearForEndpoint,
        addMultipleFile,
        getMultipleAttachments,
        removeMultipleFile,
      }}
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
