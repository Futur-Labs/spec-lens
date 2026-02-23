import { useEffect, useState } from 'react';

import { ArrowLeft, Check, Copy, Loader2, Pencil, Play, X } from 'lucide-react';

import { HistoryKeyValueTable } from './history-key-value-table';
import { generateCurlCommand } from '../lib/generate-curl-command';
import { getIconButtonStyle } from '../lib/icon-button-style';
import { useReplayRequest } from '../model/use-replay-request';
import { getMethodColor, getStatusCodeColor, getStatusText } from '@/entities/api-spec';
import type { HistoryEntry } from '@/entities/history';
import { copyToClipboard, formatBytes } from '@/shared/lib';
import { useColors } from '@/shared/theme';
import { CollapsibleSection } from '@/shared/ui/section';

function formatBody(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

export function HistoryDetail({
  entry,
  onBack,
  onNavigateToEntry,
}: {
  entry: HistoryEntry;
  onBack: () => void;
  onNavigateToEntry: (entry: HistoryEntry) => void;
}) {
  const colors = useColors();
  const iconButtonStyle = getIconButtonStyle(colors);
  const { replay, isReplaying } = useReplayRequest();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPathParams, setEditedPathParams] = useState(entry.request.pathParams);
  const [editedQueryParams, setEditedQueryParams] = useState(entry.request.queryParams);
  const [editedHeaders, setEditedHeaders] = useState(entry.request.headers);
  const [editedBody, setEditedBody] = useState(entry.request.body);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    setIsEditMode(false);
    setEditedPathParams(entry.request.pathParams);
    setEditedQueryParams(entry.request.queryParams);
    setEditedHeaders(entry.request.headers);
    setEditedBody(entry.request.body);
  }, [entry.id]);

  const hasPathParams = Object.keys(entry.request.pathParams).length > 0;
  const hasQueryParams = Object.keys(entry.request.queryParams).length > 0;
  const hasHeaders = Object.keys(entry.request.headers).length > 0;
  const hasBody = !!entry.request.body?.trim();
  const statusColor = entry.error
    ? colors.feedback.error
    : entry.response?.status && entry.response.status >= 400
      ? colors.feedback.warning
      : colors.feedback.success;

  const formattedTime = new Date(entry.timestamp).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleCopyCurl = () => {
    const params = isEditMode
      ? {
          pathParams: editedPathParams,
          queryParams: editedQueryParams,
          headers: editedHeaders,
          body: editedBody,
        }
      : entry.request;

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

  const handleCopyResponseBody = () => {
    if (!entry.response) return;
    const text =
      typeof entry.response.data === 'string'
        ? entry.response.data
        : JSON.stringify(entry.response.data, null, 2);

    copyToClipboard(text, () => {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    });
  };

  const handleReplay = async () => {
    const overrides = isEditMode
      ? {
          pathParams: editedPathParams,
          queryParams: editedQueryParams,
          headers: editedHeaders,
          body: editedBody,
        }
      : undefined;

    const newEntry = await replay(entry, overrides);
    if (newEntry) {
      onNavigateToEntry(newEntry);
    }
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      setEditedPathParams(entry.request.pathParams);
      setEditedQueryParams(entry.request.queryParams);
      setEditedHeaders(entry.request.headers);
      setEditedBody(entry.request.body);
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.text.secondary,
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.4rem 0',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div style={{ flex: 1 }} />
        <span
          style={{
            padding: '0.2rem 0.6rem',
            backgroundColor: getMethodColor(entry.method),
            borderRadius: '0.3rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          {entry.method}
        </span>
        <span
          style={{
            color: colors.text.primary,
            fontSize: '1.2rem',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={entry.url}
        >
          {entry.path}
        </span>
      </div>

      {/* Meta bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {entry.response ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.8rem',
              borderRadius: '0.4rem',
              backgroundColor: `${getStatusCodeColor(entry.response.status)}18`,
              border: `1px solid ${getStatusCodeColor(entry.response.status)}30`,
              fontWeight: 700,
              fontSize: '1.2rem',
              color: getStatusCodeColor(entry.response.status),
            }}
          >
            {entry.response.status}
            {getStatusText(entry.response.status) && (
              <span style={{ fontWeight: 500, marginLeft: '0.4rem', fontSize: '1.1rem' }}>
                {getStatusText(entry.response.status)}
              </span>
            )}
          </span>
        ) : entry.error ? (
          <span
            style={{
              padding: '0.2rem 0.8rem',
              borderRadius: '0.4rem',
              backgroundColor: `${statusColor}20`,
              fontSize: '1.2rem',
              color: statusColor,
              fontWeight: 600,
            }}
          >
            Error
          </span>
        ) : null}
        {entry.duration !== undefined && (
          <span style={{ color: colors.text.tertiary, fontSize: '1.2rem' }}>
            {entry.duration}ms
          </span>
        )}
        {entry.response?.size !== undefined && (
          <span style={{ color: colors.text.tertiary, fontSize: '1.2rem' }}>
            {formatBytes(entry.response.size)}
          </span>
        )}
        <span style={{ color: colors.text.tertiary, fontSize: '1.1rem' }}>{formattedTime}</span>
      </div>

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={toggleEditMode}
          style={{
            ...iconButtonStyle,
            backgroundColor: isEditMode
              ? colors.interactive.primary
              : iconButtonStyle.backgroundColor,
            color: isEditMode ? '#ffffff' : iconButtonStyle.color,
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
            backgroundColor: isReplaying ? '#374151' : colors.interactive.primary,
            color: '#ffffff',
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

      {/* Error section */}
      {entry.error && (
        <div
          style={{
            padding: '1.2rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.6rem',
            color: colors.feedback.error,
            fontSize: '1.3rem',
          }}
        >
          Error: {entry.error}
        </div>
      )}

      {/* Request sections */}
      {(hasPathParams || isEditMode) && (
        <CollapsibleSection
          title='Path Parameters'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(isEditMode ? editedPathParams : entry.request.pathParams).length})
            </span>
          }
          defaultExpanded={hasPathParams}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedPathParams : entry.request.pathParams}
            editable={isEditMode}
            onChange={setEditedPathParams}
            emptyMessage='No path parameters'
          />
        </CollapsibleSection>
      )}

      {(hasQueryParams || isEditMode) && (
        <CollapsibleSection
          title='Query Parameters'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(isEditMode ? editedQueryParams : entry.request.queryParams).length})
            </span>
          }
          defaultExpanded={hasQueryParams}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedQueryParams : entry.request.queryParams}
            editable={isEditMode}
            onChange={setEditedQueryParams}
            emptyMessage='No query parameters'
          />
        </CollapsibleSection>
      )}

      {(hasHeaders || isEditMode) && (
        <CollapsibleSection
          title='Request Headers'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(isEditMode ? editedHeaders : entry.request.headers).length})
            </span>
          }
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedHeaders : entry.request.headers}
            editable={isEditMode}
            onChange={setEditedHeaders}
            emptyMessage='No headers'
          />
        </CollapsibleSection>
      )}

      {(hasBody || isEditMode) && (
        <CollapsibleSection title='Request Body' defaultExpanded={hasBody}>
          {isEditMode ? (
            <textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              style={{
                width: '100%',
                minHeight: '12rem',
                padding: '1rem',
                backgroundColor: colors.bg.input,
                border: `1px solid ${colors.border.default}`,
                borderRadius: '0.6rem',
                color: colors.text.primary,
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <pre
              style={{
                margin: 0,
                padding: '1rem',
                backgroundColor: colors.bg.subtle,
                borderRadius: '0.6rem',
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                color: colors.text.primary,
                overflow: 'auto',
                maxHeight: '300px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {formatBody(entry.request.body)}
            </pre>
          )}
        </CollapsibleSection>
      )}

      {/* Response sections */}
      {entry.response && (
        <>
          <CollapsibleSection
            title='Response Body'
            badge={
              <button
                onClick={handleCopyResponseBody}
                style={{
                  ...iconButtonStyle,
                  width: '2rem',
                  height: '2rem',
                  marginLeft: '0.4rem',
                }}
                title='Copy response body'
              >
                {copiedResponse ? <Check size={12} /> : <Copy size={12} />}
              </button>
            }
          >
            <pre
              style={{
                margin: 0,
                padding: '1rem',
                backgroundColor: colors.bg.subtle,
                borderRadius: '0.6rem',
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                color: colors.text.primary,
                overflow: 'auto',
                maxHeight: '400px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {typeof entry.response.data === 'string'
                ? entry.response.data
                : JSON.stringify(entry.response.data, null, 2)}
            </pre>
          </CollapsibleSection>

          {entry.response.headers && Object.keys(entry.response.headers).length > 0 && (
            <CollapsibleSection
              title='Response Headers'
              badge={
                <span
                  style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}
                >
                  ({Object.keys(entry.response.headers).length})
                </span>
              }
            >
              <HistoryKeyValueTable
                data={entry.response.headers}
                emptyMessage='No response headers'
              />
            </CollapsibleSection>
          )}
        </>
      )}
    </div>
  );
}
