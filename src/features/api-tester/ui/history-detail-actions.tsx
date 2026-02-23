import { useState } from 'react';

import { Check, Copy, Loader2, Pencil, Play, X } from 'lucide-react';

import { generateCurlCommand } from '../lib/generate-curl-command';
import { getIconButtonStyle } from '../lib/icon-button-style';
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
  const iconButtonStyle = getIconButtonStyle(colors);
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
          ...iconButtonStyle,
          backgroundColor: isEditMode
            ? colors.interactive.primary
            : iconButtonStyle.backgroundColor,
          color: isEditMode ? colors.text.onBrand : iconButtonStyle.color,
          width: 'auto',
          padding: '0.4rem 1rem',
          gap: '0.4rem',
          fontSize: '1.1rem',
        }}
        title={isEditMode ? 'Cancel Edit' : 'Edit & Replay'}
      >
        {isEditMode ? <X size={14} /> : <Pencil size={14} />}
        {isEditMode ? 'Cancel' : 'Edit'}
      </button>
      <button
        onClick={handleCopyCurl}
        style={{
          ...iconButtonStyle,
          width: 'auto',
          padding: '0.4rem 1rem',
          gap: '0.4rem',
          fontSize: '1.1rem',
        }}
        title='Copy as cURL'
      >
        {copiedCurl ? <Check size={14} /> : <Copy size={14} />}
        {copiedCurl ? 'Copied' : 'cURL'}
      </button>
      <button
        onClick={handleReplay}
        disabled={isReplaying}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.4rem 1.4rem',
          backgroundColor: isReplaying ? colors.bg.overlayHover : colors.interactive.primary,
          color: colors.text.onBrand,
          border: 'none',
          borderRadius: '0.4rem',
          fontSize: '1.2rem',
          fontWeight: 600,
          cursor: isReplaying ? 'not-allowed' : 'pointer',
        }}
      >
        {isReplaying ? <Loader2 size={14} className='animate-spin' /> : <Play size={14} />}
        {isEditMode ? 'Execute' : 'Replay'}
      </button>
    </div>
  );
}
