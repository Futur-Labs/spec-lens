import { useState } from 'react';

import { Trash2 } from 'lucide-react';

import { getIconButtonStyle } from '../lib/icon-button-style';
import { VariableAutocompleteInput, HeaderAutocompleteInput } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { FuturSelect } from '@/shared/ui/select';

type InputType = 'default' | 'variable' | 'header';

export function HistoryKeyValueTable({
  data,
  editable = false,
  inputType = 'default',
  onChange,
  emptyMessage = 'No data',
  availableContentTypes,
}: {
  data: Record<string, string>;
  editable?: boolean;
  inputType?: InputType;
  onChange?: (updated: Record<string, string>) => void;
  emptyMessage?: string;
  availableContentTypes?: string[];
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
    // Content-Type으로 이름 변경 차단
    if (inputType === 'header' && newKey.trim().toLowerCase() === 'content-type') return;
    const updated: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      updated[k === oldKey ? newKey : k] = v;
    }
    onChange?.(updated);
  };

  const handleRemove = (key: string) => {
    // Content-Type 삭제 차단
    if (inputType === 'header' && key.toLowerCase() === 'content-type') return;
    const updated = { ...data };
    delete updated[key];
    onChange?.(updated);
  };

  // blur 시 자동 추가 (포커스가 add row 밖으로 이동할 때)
  const handleAddRowBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (newKey.trim()) {
      onChange?.({ ...data, [newKey.trim()]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  // autocomplete 선택 시 자동 추가 (header 타입)
  const handleNewKeyChange = (name: string) => {
    if (inputType === 'header' && name.trim().toLowerCase() === 'content-type') return;
    if (inputType === 'header' && name.trim() && newValue) {
      onChange?.({ ...data, [name.trim()]: newValue });
      setNewKey('');
      setNewValue('');
    } else {
      setNewKey(name);
    }
  };

  const handleNewValueChange = (val: string) => {
    if (inputType === 'header' && newKey.trim()) {
      onChange?.({ ...data, [newKey.trim()]: val });
      setNewKey('');
      setNewValue('');
    } else {
      setNewValue(val);
    }
  };

  const inputStyle = {
    flex: 1,
    padding: '0.8rem 1.2rem',
    backgroundColor: colors.bg.input,
    border: `1px solid ${colors.border.default}`,
    borderRadius: '0.6rem',
    color: colors.text.primary,
    fontSize: '1.3rem',
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
      <input
        className='placeholder-md'
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        style={inputStyle}
      />
    );
  };

  const renderKeyInput = (key: string, onChangeKey: (v: string) => void) => {
    // Content-Type은 key name 수정 불가 (read-only 표시)
    if (inputType === 'header' && key.toLowerCase() === 'content-type') {
      return (
        <span
          style={{
            color: colors.feedback.info,
            fontWeight: 600,
            minWidth: '14rem',
            flexShrink: 0,
            fontSize: '1.2rem',
          }}
        >
          {key}
        </span>
      );
    }
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
              {inputType === 'header' && key.toLowerCase() === 'content-type' ? (
                availableContentTypes && availableContentTypes.length > 1 ? (
                  <div style={{ flex: 1 }}>
                    <FuturSelect
                      options={availableContentTypes.map((ct) => ({ label: ct, value: ct }))}
                      value={value}
                      onChange={(ct) => handleValueChange(key, ct)}
                    />
                  </div>
                ) : (
                  <span
                    style={{
                      flex: 1,
                      color: colors.text.tertiary,
                      fontSize: '1.2rem',
                    }}
                  >
                    {value}
                  </span>
                )
              ) : (
                renderValueInput(value, (v) => handleValueChange(key, v), key)
              )}
              {!(inputType === 'header' && key.toLowerCase() === 'content-type') && (
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
              )}
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
          onBlur={handleAddRowBlur}
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
          <span style={{ fontSize: '1rem', color: colors.text.tertiary, fontWeight: 500 }}>
            {inputType === 'header' ? 'Add Header' : 'Add Item'}
          </span>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            {inputType === 'header' ? (
              <div style={{ minWidth: '14rem', flex: 'none', width: '14rem' }}>
                <HeaderAutocompleteInput
                  value={newKey}
                  onChange={handleNewKeyChange}
                  placeholder='Name'
                  style={headerAutocompleteInputStyle}
                  type='name'
                />
              </div>
            ) : (
              <input
                className='placeholder-md'
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder='Key'
                style={{ ...inputStyle, minWidth: '14rem', flex: 'none', width: '14rem' }}
              />
            )}
            {renderValueInput(newValue, handleNewValueChange, newKey)}
          </div>
        </div>
      )}
    </div>
  );
}
