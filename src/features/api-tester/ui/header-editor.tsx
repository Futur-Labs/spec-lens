import { FlexRow } from '@jigoooo/shared-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ChevronUp, ChevronDown, Key, Trash2 } from 'lucide-react';

import { getIconButtonStyle } from '../lib/icon-button-style';
import { useAuthConfig } from '@/entities/api-auth';
import { HeaderAutocompleteInput } from '@/entities/api-spec';
import { testParamsStoreActions, useHeaders } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { ResetButton } from '@/shared/ui/button';
import { FuturSelect } from '@/shared/ui/select';

export function HeaderEditor({
  onReset,
  availableContentTypes,
  onContentTypeChange,
}: {
  onReset?: () => void;
  availableContentTypes?: string[];
  onContentTypeChange?: (ct: string) => void;
}) {
  const colors = useColors();

  const headers = useHeaders();
  const authConfig = useAuthConfig();

  const [newHeaderName, setNewHeaderName] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [showHeaders, setShowHeaders] = useState(true);

  const iconButtonStyle = getIconButtonStyle(colors);

  const handleNewNameChange = (name: string) => {
    if (name.trim().toLowerCase() === 'content-type') return;
    if (name.trim() && newHeaderValue) {
      testParamsStoreActions.setHeader(name.trim(), newHeaderValue);
      setNewHeaderName('');
      setNewHeaderValue('');
    } else {
      setNewHeaderName(name);
    }
  };

  const handleNewValueChange = (val: string) => {
    if (newHeaderName.trim()) {
      testParamsStoreActions.setHeader(newHeaderName.trim(), val);
      setNewHeaderName('');
      setNewHeaderValue('');
    } else {
      setNewHeaderValue(val);
    }
  };

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
          onClick={() => {
            testParamsStoreActions.resetHeaders();
            onReset?.();
          }}
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
                      ? `${colors.feedback.warning}15`
                      : `${colors.feedback.success}15`,
                    border: headers['Authorization']
                      ? `1px solid ${colors.feedback.warning}25`
                      : `1px solid ${colors.feedback.success}25`,
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

              {/* Content-Type 표시 (다중 선택 가능 시 드롭다운) */}
              {headers['Content-Type'] && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.8rem',
                    alignItems: 'center',
                    padding: '0.6rem 1rem',
                    backgroundColor: `${colors.feedback.info}15`,
                    border: `1px solid ${colors.feedback.info}25`,
                    borderRadius: '0.6rem',
                  }}
                >
                  <span
                    style={{
                      color: colors.feedback.info,
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    Content-Type
                  </span>
                  {availableContentTypes && availableContentTypes.length > 1 ? (
                    <FuturSelect
                      options={availableContentTypes.map((ct) => ({ label: ct, value: ct }))}
                      value={headers['Content-Type']}
                      onChange={(ct) => {
                        testParamsStoreActions.setHeader('Content-Type', ct);
                        onContentTypeChange?.(ct);
                      }}
                      style={{ flex: 1 }}
                    />
                  ) : (
                    <span style={{ color: colors.text.tertiary, fontSize: '1.1rem', flex: 1 }}>
                      {headers['Content-Type']}
                    </span>
                  )}
                </div>
              )}

              {/* Existing headers */}
              {Object.entries(headers)
                .filter(([k]) => k !== 'Content-Type')
                .map(([k, v]) => (
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
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginTop: '0.4rem',
                  padding: '0.6rem',
                  border: `1px dashed ${colors.border.subtle}`,
                  borderRadius: '0.6rem',
                }}
              >
                <span
                  style={{
                    fontSize: '1rem',
                    color: colors.text.tertiary,
                    fontWeight: 500,
                  }}
                >
                  Add Header
                </span>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <HeaderAutocompleteInput
                    type='name'
                    value={newHeaderName}
                    onChange={handleNewNameChange}
                    placeholder='Header name'
                    style={{ flex: 1 }}
                  />
                  <HeaderAutocompleteInput
                    type='value'
                    headerName={newHeaderName}
                    value={newHeaderValue}
                    onChange={handleNewValueChange}
                    placeholder='Header value'
                    style={{ flex: 2 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
