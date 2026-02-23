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

// 엔드포인트별 첨부파일 비활성 후 자동 정리 설정
const CLEANUP_INTERVAL_MS = 60_000; // 1분마다 정리 체크
const STALE_THRESHOLD_MS = 30 * 60_000; // 30분 비활성 시 정리

const FileAttachmentsContext = createContext<FileAttachmentsContextValue | null>(null);

export function FileAttachmentsProvider({ children }: { children: ReactNode }) {
  const [attachments, setAttachments] = useState<Map<string, FileAttachment>>(new Map());
  const previewUrlsRef = useRef<Set<string>>(new Set());
  const savedAttachmentsRef = useRef<Map<string, Map<string, FileAttachment>>>(new Map());
  const lastAccessTimeRef = useRef<Map<string, number>>(new Map());

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
        lastAccessTimeRef.current.set(endpointKey, Date.now());
      }
      return current;
    });
  }, []);

  const loadForEndpoint = useCallback((endpointKey: string) => {
    const saved = savedAttachmentsRef.current.get(endpointKey);
    if (saved) {
      lastAccessTimeRef.current.set(endpointKey, Date.now());
    }
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

  // 비활성 엔드포인트의 첨부파일 자동 정리
  const cleanupStaleAttachments = useCallback(() => {
    const now = Date.now();
    const staleKeys: string[] = [];

    for (const [key, lastAccess] of lastAccessTimeRef.current) {
      if (now - lastAccess > STALE_THRESHOLD_MS) {
        staleKeys.push(key);
      }
    }

    for (const key of staleKeys) {
      const saved = savedAttachmentsRef.current.get(key);
      if (saved) {
        for (const attachment of saved.values()) {
          if (attachment.preview) {
            URL.revokeObjectURL(attachment.preview);
            previewUrlsRef.current.delete(attachment.preview);
          }
        }
      }
      savedAttachmentsRef.current.delete(key);
      lastAccessTimeRef.current.delete(key);
    }
  }, []);

  // 주기적으로 비활성 첨부파일 정리
  useEffect(() => {
    const timer = setInterval(cleanupStaleAttachments, CLEANUP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [cleanupStaleAttachments]);

  useEffect(() => {
    const urls = previewUrlsRef.current;
    const saved = savedAttachmentsRef.current;
    return () => {
      // 컴포넌트 언마운트 시 모든 preview URL 해제
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      // 저장된 첨부파일의 preview URL도 해제
      for (const endpointMap of saved.values()) {
        for (const attachment of endpointMap.values()) {
          if (attachment.preview) {
            URL.revokeObjectURL(attachment.preview);
          }
        }
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
