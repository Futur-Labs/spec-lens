import { FlexRow } from '@jigoooo/shared-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ChevronUp, ChevronDown, Key, Trash2, Plus } from 'lucide-react';

import { getIconButtonStyle } from '../lib/icon-button-style';
import { useAuthConfig } from '@/entities/api-auth';
import { HeaderAutocompleteInput } from '@/entities/api-spec';
import { testParamsStoreActions, useHeaders } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { ResetButton } from '@/shared/ui/button';

export function HeaderEditor() {
  const colors = useColors();

  const headers = useHeaders();
  const authConfig = useAuthConfig();

  const [newHeaderName, setNewHeaderName] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [showHeaders, setShowHeaders] = useState(true);

  const iconButtonStyle = getIconButtonStyle(colors);

  return (
    <div>
      <FlexRow
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.6rem',
        }}
      >
        <FlexRow
          style={{ cursor: 'pointer', alignItems: 'center', gap: '0.8rem' }}
          onClick={() => setShowHeaders(!showHeaders)}
        >
          <span style={{ color: colors.text.secondary, fontSize: '1.2rem', fontWeight: 500 }}>
            Headers
          </span>
          <span
            style={{
              backgroundColor: colors.bg.overlayHover,
              padding: '0.2rem 0.6rem',
              borderRadius: '1rem',
              fontSize: '1rem',
              color: colors.text.primary,
            }}
          >
            {Object.keys(headers).length}
          </span>
          {showHeaders ? (
            <ChevronUp size={12} color={colors.text.secondary} />
          ) : (
            <ChevronDown size={12} color={colors.text.secondary} />
          )}
        </FlexRow>

        <ResetButton
          title='Reset headers to default'
          onClick={() => testParamsStoreActions.resetHeaders()}
        />
      </FlexRow>
      <AnimatePresence initial={false}>
        {showHeaders && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {/* Global Auth header indicator */}
              {authConfig.type !== 'none' && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.8rem',
                    alignItems: 'center',
                    padding: '0.6rem 1rem',
                    backgroundColor: headers['Authorization']
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(34, 197, 94, 0.1)',
                    border: headers['Authorization']
                      ? '1px solid rgba(245, 158, 11, 0.2)'
                      : '1px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '0.6rem',
                  }}
                >
                  <Key
                    size={12}
                    color={
                      headers['Authorization'] ? colors.feedback.warning : colors.feedback.success
                    }
                  />
                  <span
                    style={{
                      color: headers['Authorization']
                        ? colors.feedback.warning
                        : colors.feedback.success,
                      fontSize: '1.1rem',
                      fontWeight: 500,
                    }}
                  >
                    Authorization
                  </span>
                  <span style={{ color: colors.text.tertiary, fontSize: '1.1rem', flex: 1 }}>
                    {headers['Authorization']
                      ? '(Custom header overrides Global Auth)'
                      : `(from Global Auth: ${authConfig.type.toUpperCase()})`}
                  </span>
                </div>
              )}

              {/* Existing headers */}
              {Object.entries(headers).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <HeaderAutocompleteInput
                    type='name'
                    value={k}
                    onChange={(newKey) => {
                      if (newKey !== k) {
                        testParamsStoreActions.removeHeader(k);
                        testParamsStoreActions.setHeader(newKey, v);
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <HeaderAutocompleteInput
                    type='value'
                    headerName={k}
                    value={v}
                    onChange={(newValue) => testParamsStoreActions.setHeader(k, newValue)}
                    style={{ flex: 2 }}
                  />
                  <button
                    onClick={() => testParamsStoreActions.removeHeader(k)}
                    style={iconButtonStyle}
                    title='Remove header'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {/* Add new header form */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.8rem',
                  alignItems: 'center',
                  marginTop: '0.4rem',
                }}
              >
                <HeaderAutocompleteInput
                  type='name'
                  value={newHeaderName}
                  onChange={setNewHeaderName}
                  placeholder='Header name'
                  style={{ flex: 1 }}
                />
                <HeaderAutocompleteInput
                  type='value'
                  headerName={newHeaderName}
                  value={newHeaderValue}
                  onChange={setNewHeaderValue}
                  placeholder='Header value'
                  style={{ flex: 2 }}
                />
                <button
                  onClick={() => {
                    if (newHeaderName.trim()) {
                      testParamsStoreActions.setHeader(newHeaderName.trim(), newHeaderValue);
                      setNewHeaderName('');
                      setNewHeaderValue('');
                    }
                  }}
                  disabled={!newHeaderName.trim()}
                  style={{
                    ...iconButtonStyle,
                    backgroundColor: newHeaderName.trim()
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(255,255,255,0.05)',
                    color: newHeaderName.trim() ? colors.feedback.success : colors.text.tertiary,
                  }}
                  title='Add header'
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
