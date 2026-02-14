import { useState, type ChangeEvent, type DragEvent as ReactDragEvent } from 'react';

import { setSpecWithExpanded } from '../lib/set-spec-with-expanded';
import { specStoreActions, validateOpenAPISpec, type OpenAPISpec } from '@/entities/api-spec';

export function useFileHandler() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setFileName(file.name);
    specStoreActions.setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const validation = validateOpenAPISpec(json);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setSpecWithExpanded(json as OpenAPISpec, { type: 'file', name: file.name });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse file';
      setError(message);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: ReactDragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: ReactDragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: ReactDragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
      processFile(file);
    } else {
      setError('Please drop a JSON file');
    }
  };

  return {
    error,
    fileName,
    isDragging,
    handleFileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
