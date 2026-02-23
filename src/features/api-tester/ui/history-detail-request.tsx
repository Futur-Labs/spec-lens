import { HistoryKeyValueTable } from './history-key-value-table';
import { formatBody } from '../lib/format-body';
import type { HistoryEntry } from '@/entities/history';
import { useColors } from '@/shared/theme';
import { CollapsibleSection } from '@/shared/ui/section';

export function HistoryDetailRequest({
  entry,
  isEditMode,
  editedPathParams,
  editedQueryParams,
  editedHeaders,
  editedBody,
  onChangePathParams,
  onChangeQueryParams,
  onChangeHeaders,
  onChangeBody,
}: {
  entry: HistoryEntry;
  isEditMode: boolean;
  editedPathParams: Record<string, string>;
  editedQueryParams: Record<string, string>;
  editedHeaders: Record<string, string>;
  editedBody: string;
  onChangePathParams: (v: Record<string, string>) => void;
  onChangeQueryParams: (v: Record<string, string>) => void;
  onChangeHeaders: (v: Record<string, string>) => void;
  onChangeBody: (v: string) => void;
}) {
  const colors = useColors();

  const hasPathParams = Object.keys(entry.request.pathParams).length > 0;
  const hasQueryParams = Object.keys(entry.request.queryParams).length > 0;
  const hasHeaders = Object.keys(entry.request.headers).length > 0;
  const hasBody = !!entry.request.body?.trim();

  return (
    <>
      {(hasPathParams || isEditMode) && (
        <CollapsibleSection
          title='Path Parameters'
          badge={
            <span style={{ fontSize: '1.1rem', color: colors.text.tertiary, marginLeft: '0.4rem' }}>
              ({Object.keys(isEditMode ? editedPathParams : entry.request.pathParams).length})
            </span>
          }
          defaultExpanded={hasPathParams}
          childrenContainerStyle={{ paddingTop: 0 }}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedPathParams : entry.request.pathParams}
            editable={isEditMode}
            onChange={onChangePathParams}
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
          childrenContainerStyle={{ paddingTop: 0 }}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedQueryParams : entry.request.queryParams}
            editable={isEditMode}
            onChange={onChangeQueryParams}
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
          childrenContainerStyle={{ paddingTop: 0 }}
        >
          <HistoryKeyValueTable
            data={isEditMode ? editedHeaders : entry.request.headers}
            editable={isEditMode}
            onChange={onChangeHeaders}
            emptyMessage='No headers'
          />
        </CollapsibleSection>
      )}

      {(hasBody || isEditMode) && (
        <CollapsibleSection title='Request Body' defaultExpanded={hasBody}>
          {isEditMode ? (
            <textarea
              value={editedBody}
              onChange={(e) => onChangeBody(e.target.value)}
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
    </>
  );
}
