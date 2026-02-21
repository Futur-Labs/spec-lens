import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface FileAttachment {
  file: File;
  fieldName: string;
  preview?: string;
}

export interface FileEntry {
  __file: true;
  name: string;
  type: string;
  size: number;
  data: string;
}

interface FileAttachmentsContextValue {
  attachments: Map<string, FileAttachment>;
  setAttachment: (fieldName: string, file: File) => string | null;
  removeAttachment: (fieldName: string) => void;
  clearAll: () => void;
  toBase64Map: () => Promise<Record<string, FileEntry>>;
}

const FileAttachmentsContext = createContext<FileAttachmentsContextValue | null>(null);

export function FileAttachmentsProvider({ children }: { children: ReactNode }) {
  const [attachments, setAttachments] = useState<Map<string, FileAttachment>>(new Map());
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const revokePreview = useCallback((url: string) => {
    URL.revokeObjectURL(url);
    previewUrlsRef.current.delete(url);
  }, []);

  const setAttachment = useCallback(
    (fieldName: string, file: File): string | null => {
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
    },
    [revokePreview],
  );

  const removeAttachment = useCallback(
    (fieldName: string) => {
      setAttachments((prev) => {
        const next = new Map(prev);
        const existing = prev.get(fieldName);
        if (existing?.preview) {
          revokePreview(existing.preview);
        }
        next.delete(fieldName);
        return next;
      });
    },
    [revokePreview],
  );

  const clearAll = useCallback(() => {
    setAttachments((prev) => {
      for (const attachment of prev.values()) {
        if (attachment.preview) {
          revokePreview(attachment.preview);
        }
      }
      return new Map();
    });
  }, [revokePreview]);

  const toBase64Map = useCallback(async (): Promise<Record<string, FileEntry>> => {
    const result: Record<string, FileEntry> = {};

    for (const [fieldName, attachment] of attachments) {
      const arrayBuffer = await attachment.file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      result[fieldName] = {
        __file: true,
        name: attachment.file.name,
        type: attachment.file.type || 'application/octet-stream',
        size: attachment.file.size,
        data: base64,
      };
    }

    return result;
  }, [attachments]);

  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  return (
    <FileAttachmentsContext.Provider
      value={{ attachments, setAttachment, removeAttachment, clearAll, toBase64Map }}
    >
      {children}
    </FileAttachmentsContext.Provider>
  );
}

export function useFileAttachments() {
  const ctx = useContext(FileAttachmentsContext);
  if (!ctx) throw new Error('useFileAttachments must be used within FileAttachmentsProvider');
  return ctx;
}
