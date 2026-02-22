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
  toBase64Map: () => Promise<Record<string, FileEntry | FileEntry[]>>;
  saveForEndpoint: (endpointKey: string) => void;
  loadForEndpoint: (endpointKey: string) => void;
  clearForEndpoint: (endpointKey: string) => void;
  addMultipleFile: (fieldName: string, file: File) => string | null;
  getMultipleAttachments: (fieldName: string) => FileAttachment[];
  removeMultipleFile: (fieldName: string, index: number) => void;
}
