import { HistoryDetailActions } from './history-detail-actions';
import { HistoryDetailHeader } from './history-detail-header';
import { HistoryDetailRequest } from './history-detail-request';
import { HistoryDetailResponse } from './history-detail-response';
import { useHistoryEdit } from '../model/use-history-edit';
import type { HistoryEntry } from '@/entities/history';
import { useColors } from '@/shared/theme';

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
  const {
    isEditMode,
    editedPathParams,
    editedQueryParams,
    editedHeaders,
    editedBody,
    setEditedPathParams,
    setEditedQueryParams,
    setEditedHeaders,
    setEditedBody,
    toggleEditMode,
    getEditedParams,
  } = useHistoryEdit(entry);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <HistoryDetailHeader entry={entry} onBack={onBack} />

      <HistoryDetailActions
        entry={entry}
        isEditMode={isEditMode}
        onToggleEdit={toggleEditMode}
        getEditedParams={getEditedParams}
        onNavigateToEntry={onNavigateToEntry}
      />

      {/* Error section */}
      {entry.error && (
        <div
          style={{
            padding: '1.2rem',
            backgroundColor: `${colors.feedback.error}15`,
            border: `1px solid ${colors.feedback.error}25`,
            borderRadius: '0.6rem',
            color: colors.feedback.error,
            fontSize: '1.3rem',
          }}
        >
          Error: {entry.error}
        </div>
      )}

      <HistoryDetailRequest
        entry={entry}
        isEditMode={isEditMode}
        editedPathParams={editedPathParams}
        editedQueryParams={editedQueryParams}
        editedHeaders={editedHeaders}
        editedBody={editedBody}
        onChangePathParams={setEditedPathParams}
        onChangeQueryParams={setEditedQueryParams}
        onChangeHeaders={setEditedHeaders}
        onChangeBody={setEditedBody}
      />

      <HistoryDetailResponse entry={entry} />
    </div>
  );
}
