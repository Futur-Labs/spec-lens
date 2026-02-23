import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { Trash2 } from 'lucide-react';

import { HistoryDetail } from './history-detail';
import { HistoryItem } from './history-item';
import { useSpecSource } from '@/entities/api-spec';
import { historyStoreActions, useHistoryBySpec, type HistoryEntry } from '@/entities/history';
import { useColors } from '@/shared/theme';

export function HistoryTab() {
  const colors = useColors();
  const specSource = useSpecSource();
  const specId = specSource?.name ?? null;
  const history = useHistoryBySpec(specId);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  if (history.length === 0 && !selectedEntry) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: colors.text.tertiary,
          fontSize: '1.2rem',
        }}
      >
        No request history yet. Make API requests to see them here.
      </div>
    );
  }

  return (
    <AnimatePresence mode='wait'>
      {selectedEntry ? (
        <motion.div
          key='detail'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <HistoryDetail
            key={selectedEntry.id}
            entry={selectedEntry}
            onBack={() => setSelectedEntry(null)}
            onNavigateToEntry={setSelectedEntry}
          />
        </motion.div>
      ) : (
        <motion.div
          key='list'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.15 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header with Clear All button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: colors.text.secondary, fontSize: '1.2rem' }}>
                Recent Requests ({history.length})
              </span>
              <button
                onClick={() =>
                  specId
                    ? historyStoreActions.clearHistoryBySpec(specId)
                    : historyStoreActions.clearHistory()
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.8rem',
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.feedback.error}40`,
                  borderRadius: '0.4rem',
                  color: colors.feedback.error,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={12} />
                Clear All
              </button>
            </div>

            {/* History List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              {history.map((entry) => (
                <HistoryItem key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
