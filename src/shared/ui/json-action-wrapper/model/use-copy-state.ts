import { useState } from 'react';

export function useCopyState(content: string) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    copied,
    handleCopy,
  };
}
