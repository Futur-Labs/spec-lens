import { useEffect, useRef, useState } from 'react';

import { generateCurlCommand } from '../lib/generate-curl-command';
import { generateFetchSnippet } from '../lib/generate-fetch-snippet';
import { generatePythonSnippet } from '../lib/generate-python-snippet';
import type { SnippetParams } from '../lib/snippet-types';
import type { SnippetLang } from './execute-actions.types';
import { copyToClipboard } from '@/shared/lib';

const SNIPPET_GENERATORS: Record<SnippetLang, (params: SnippetParams) => string> = {
  curl: generateCurlCommand,
  javascript: generateFetchSnippet,
  python: generatePythonSnippet,
};

export function useSnippetCopy() {
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [snippetLang, setSnippetLang] = useState<SnippetLang>(
    () => (localStorage.getItem('spec-lens-snippet-lang') as SnippetLang) || 'curl',
  );
  const [snippetMenuOpen, setSnippetMenuOpen] = useState(false);
  const snippetMenuRef = useRef<HTMLDivElement>(null);

  const handleCopySnippet = (lang: SnippetLang, params: SnippetParams) => {
    copyToClipboard(SNIPPET_GENERATORS[lang](params), () => {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    });
  };

  const handleSelectLang = (lang: SnippetLang, params: SnippetParams) => {
    setSnippetLang(lang);
    localStorage.setItem('spec-lens-snippet-lang', lang);
    setSnippetMenuOpen(false);
    handleCopySnippet(lang, params);
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!snippetMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (snippetMenuRef.current && !snippetMenuRef.current.contains(e.target as Node)) {
        setSnippetMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [snippetMenuOpen]);

  return {
    copiedSnippet,
    snippetLang,
    snippetMenuOpen,
    setSnippetMenuOpen,
    snippetMenuRef,
    handleCopySnippet,
    handleSelectLang,
  };
}
