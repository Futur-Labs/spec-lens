import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import { getIconButtonStyle } from '../lib/icon-button-style';
import { useColors } from '@/shared/theme';

export function HistoryKeyValueTable({
  data,
  editable = false,
  onChange,
  emptyMessage = 'No data',
}: {
  data: Record<string, string>;
  editable?: boolean;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      {entries.map(([key, value]) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '0.4rem 0',
            borderBottom: `1px solid ${colors.border.subtle}`,
            fontSize: '1.2rem',
            fontFamily: 'monospace',
          }}
        >
          <span
            style={{
              color: '#3b82f6',
              fontWeight: 600,
              minWidth: '14rem',
              flexShrink: 0,
            }}
          >
            {key}
          </span>
          {editable ? (
            <>
              <input
                value={value}
                onChange={(e) => handleValueChange(key, e.target.value)}
                style={inputStyle}
              />
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
            <span style={{ color: colors.text.primary, wordBreak: 'break-all' }}>{value}</span>
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
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder='Key'
            style={{ ...inputStyle, minWidth: '14rem', flex: 'none', width: '14rem' }}
          />
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder='Value'
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={inputStyle}
          />
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
