import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import { getIconButtonStyle } from '../lib/icon-button-style';
import { VariableAutocompleteInput, HeaderAutocompleteInput } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

type InputType = 'default' | 'variable' | 'header';

export function HistoryKeyValueTable({
  data,
  editable = false,
  inputType = 'default',
  onChange,
  emptyMessage = 'No data',
}: {
  data: Record<string, string>;
  editable?: boolean;
  inputType?: InputType;
  onChange?: (updated: Record<string, string>) => void;
  emptyMessage?: string;
}) {
  const colors = useColors();
  const entries = Object.entries(data);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  if (entries.length === 0 && !editable) {
    return (
      <div
        style={{
          color: colors.text.tertiary,
          fontSize: '1.2rem',
          padding: '1rem 0',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  const handleValueChange = (key: string, value: string) => {
    onChange?.({ ...data, [key]: value });
  };

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (!newKey.trim() || (newKey !== oldKey && newKey in data)) return;
    const updated: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      updated[k === oldKey ? newKey : k] = v;
    }
    onChange?.(updated);
  };

  const handleRemove = (key: string) => {
    const updated = { ...data };
    delete updated[key];
    onChange?.(updated);
  };

  const handleAdd = () => {
    if (!newKey.trim()) return;
    onChange?.({ ...data, [newKey.trim()]: newValue });
    setNewKey('');
    setNewValue('');
  };

  const inputStyle = {
    flex: 1,
    padding: '0.4rem 0.6rem',
    backgroundColor: colors.bg.input,
    border: `1px solid ${colors.border.default}`,
    borderRadius: '0.4rem',
    color: colors.text.primary,
    fontSize: '1.2rem',
    fontFamily: 'monospace',
    outline: 'none',
  } as const;

  // autocomplete 컴포넌트에 전달할 스타일
  const autocompleteInputStyle = {
    ...inputStyle,
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const headerAutocompleteInputStyle = {
    ...autocompleteInputStyle,
    border: 'none',
  };

  const renderValueInput = (value: string, onChangeValue: (v: string) => void, key?: string) => {
    if (inputType === 'variable') {
      return (
        <div style={{ flex: 1 }}>
          <VariableAutocompleteInput
            value={value}
            onChange={onChangeValue}
            placeholder='Value'
            style={autocompleteInputStyle}
          />
        </div>
      );
    }
    if (inputType === 'header') {
      return (
        <div style={{ flex: 1 }}>
          <HeaderAutocompleteInput
            value={value}
            onChange={onChangeValue}
            placeholder='Value'
            style={headerAutocompleteInputStyle}
            type='value'
            headerName={key}
          />
        </div>
      );
    }
    return (
      <input value={value} onChange={(e) => onChangeValue(e.target.value)} style={inputStyle} />
    );
  };

  const renderKeyInput = (key: string, onChangeKey: (v: string) => void) => {
    if (inputType === 'header') {
      return (
        <div style={{ minWidth: '14rem', flexShrink: 0 }}>
          <HeaderAutocompleteInput
            value={key}
            onChange={onChangeKey}
            placeholder='Header name'
            style={headerAutocompleteInputStyle}
            type='name'
          />
        </div>
      );
    }
    return (
      <span
        style={{
          color: colors.feedback.info,
          fontWeight: 600,
          minWidth: '14rem',
          flexShrink: 0,
        }}
      >
        {key}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      {entries.map(([key, value]) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '0.7rem 1rem',
            borderBottom: `1px solid ${colors.border.subtle}`,
            fontSize: '1.2rem',
            fontFamily: 'monospace',
          }}
        >
          {editable ? (
            <>
              {renderKeyInput(key, (newName) => handleKeyChange(key, newName))}
              {renderValueInput(value, (v) => handleValueChange(key, v), key)}
              <button
                onClick={() => handleRemove(key)}
                style={{
                  ...getIconButtonStyle(colors),
                  width: '2rem',
                  height: '2rem',
                  color: colors.feedback.error,
                  flexShrink: 0,
                }}
              >
                <Trash2 size={12} />
              </button>
            </>
          ) : (
            <>
              <span
                style={{
                  color: colors.feedback.info,
                  fontWeight: 600,
                  minWidth: '14rem',
                  flexShrink: 0,
                }}
              >
                {key}
              </span>
              <span style={{ color: colors.text.primary, wordBreak: 'break-all' }}>{value}</span>
            </>
          )}
        </div>
      ))}

      {editable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '0.6rem 0',
            borderTop: entries.length > 0 ? 'none' : undefined,
          }}
        >
          {inputType === 'header' ? (
            <div style={{ minWidth: '14rem', flex: 'none', width: '14rem' }}>
              <HeaderAutocompleteInput
                value={newKey}
                onChange={setNewKey}
                placeholder='Header name'
                style={headerAutocompleteInputStyle}
                type='name'
              />
            </div>
          ) : (
            <input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder='Key'
              style={{ ...inputStyle, minWidth: '14rem', flex: 'none', width: '14rem' }}
            />
          )}
          {renderValueInput(newValue, setNewValue, newKey)}
          <button
            onClick={handleAdd}
            disabled={!newKey.trim()}
            style={{
              ...getIconButtonStyle(colors),
              width: '2rem',
              height: '2rem',
              opacity: newKey.trim() ? 1 : 0.4,
              cursor: newKey.trim() ? 'pointer' : 'not-allowed',
              flexShrink: 0,
            }}
          >
            <Plus size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
