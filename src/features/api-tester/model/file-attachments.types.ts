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

export interface FileAttachmentsContextValue {
  attachments: Map<string, FileAttachment>;
  setAttachment: (fieldName: string, file: File) => string | null;
  removeAttachment: (fieldName: string) => void;
  clearAll: () => void;
  toBase64Map: () => Promise<Record<string, FileEntry>>;
}
