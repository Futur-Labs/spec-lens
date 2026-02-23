import { useState } from 'react';

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

  const handleSelectLang = (lang: SnippetLang) => {
    setSnippetLang(lang);
    localStorage.setItem('spec-lens-snippet-lang', lang);
  };

  const handleCopySnippet = (lang: SnippetLang, params: SnippetParams) => {
    copyToClipboard(SNIPPET_GENERATORS[lang](params), () => {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    });
  };

  return {
    copiedSnippet,
    snippetLang,
    handleSelectLang,
    handleCopySnippet,
  };
}
