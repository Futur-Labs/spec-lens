import { useRef, useState } from 'react';

import { useFileAttachments } from './file-attachments-context';

export function useFileField(fieldName: string) {
  const { attachments, setAttachment, removeAttachment } = useFileAttachments();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attachment = attachments.get(fieldName);

  const handleFile = (file: File) => {
    setError(null);
    const err = setAttachment(fieldName, file);
    if (err) {
      setError(err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0];
    if (file) {
      e.preventDefault();
      handleFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    removeAttachment(fieldName);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return {
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
  };
}
