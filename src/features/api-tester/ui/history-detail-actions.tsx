import { useState } from 'react';

import { Check, Copy, Loader2, Pencil, Play, X } from 'lucide-react';

import { generateCurlCommand } from '../lib/generate-curl-command';
import { useReplayRequest } from '../model/use-replay-request';
import type { HistoryEntry } from '@/entities/history';
import { copyToClipboard } from '@/shared/lib';
import { useColors } from '@/shared/theme';

export function HistoryDetailActions({
  entry,
  isEditMode,
  onToggleEdit,
  getEditedParams,
  onNavigateToEntry,
}: {
  entry: HistoryEntry;
  isEditMode: boolean;
  onToggleEdit: () => void;
  getEditedParams: () => {
    pathParams: Record<string, string>;
    queryParams: Record<string, string>;
    headers: Record<string, string>;
    body: string;
  };
  onNavigateToEntry: (entry: HistoryEntry) => void;
}) {
  const colors = useColors();
  const { replay, isReplaying } = useReplayRequest();
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleCopyCurl = () => {
    const params = isEditMode ? getEditedParams() : entry.request;

    const baseUrl = entry.path
      ? entry.url.slice(0, entry.url.length - entry.path.length)
      : entry.url;

    const curl = generateCurlCommand({
      baseUrl,
      path: entry.path,
      method: entry.method,
      ...params,
      authConfig: { type: 'none' },
      customCookies: [],
    });

    copyToClipboard(curl, () => {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    });
  };

  const handleReplay = async () => {
    const overrides = isEditMode ? getEditedParams() : undefined;

    const newEntry = await replay(entry, overrides);
    if (newEntry) {
      onNavigateToEntry(newEntry);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        justifyContent: 'flex-end',
      }}
    >
      <button
        onClick={onToggleEdit}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.2rem',
          backgroundColor: isEditMode ? colors.interactive.primary : colors.bg.overlay,
          color: isEditMode ? colors.text.onBrand : colors.text.secondary,
          border: `1px solid ${isEditMode ? colors.interactive.primary : colors.border.default}`,
          borderRadius: '0.6rem',
          fontSize: '1.2rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
        title={isEditMode ? 'Cancel Edit' : 'Edit & Replay'}
      >
        {isEditMode ? <X size={13} /> : <Pencil size={13} />}
        {isEditMode ? 'Cancel' : 'Edit'}
      </button>
      <button
        onClick={handleCopyCurl}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.2rem',
          backgroundColor: colors.bg.overlay,
          color: colors.text.secondary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          fontSize: '1.2rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
        title='Copy as cURL'
      >
        {copiedCurl ? <Check size={13} /> : <Copy size={13} />}
        {copiedCurl ? 'Copied' : 'cURL'}
      </button>
      <button
        onClick={handleReplay}
        disabled={isReplaying}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1.6rem',
          backgroundColor: isReplaying ? colors.bg.overlayHover : colors.interactive.primary,
          color: colors.text.onBrand,
          border: 'none',
          borderRadius: '0.6rem',
          fontSize: '1.2rem',
          fontWeight: 600,
          cursor: isReplaying ? 'not-allowed' : 'pointer',
        }}
      >
        {isReplaying ? <Loader2 size={13} className='animate-spin' /> : <Play size={13} />}
        {isEditMode ? 'Execute' : 'Replay'}
      </button>
    </div>
  );
}
