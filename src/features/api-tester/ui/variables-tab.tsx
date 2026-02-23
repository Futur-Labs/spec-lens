import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import { getInputStyle } from '../lib/input-style';
import { useVariables, variableStoreActions } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function VariablesTab() {
  const colors = useColors();
  const variables = useVariables();
  const inputStyle = getInputStyle(colors);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      variableStoreActions.addVariable({
        name: newName.trim(),
        value: newValue,
      });
      setNewName('');
      setNewValue('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Info */}
      <div
        style={{
          padding: '0.8rem 1rem',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '0.6rem',
          fontSize: '1.1rem',
          color: '#c4b5fd',
        }}
      >
        💡 Type{' '}
        <code
          style={{
            backgroundColor: colors.bg.overlay,
            padding: '0.2rem 0.4rem',
            borderRadius: '0.3rem',
          }}
        >
          @
        </code>{' '}
        in input fields to autocomplete with variable values.
      </div>

      {/* Add New Variable */}
      <div
        style={{
          display: 'flex',
          gap: '0.8rem',
          padding: '1rem',
          backgroundColor: colors.bg.overlay,
          borderRadius: '0.6rem',
          border: `1px solid ${colors.border.subtle}`,
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder='Variable name'
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder='Variable value'
          style={{ ...inputStyle, flex: 2 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.8rem 1.2rem',
            backgroundColor: newName.trim() ? '#a855f7' : colors.bg.overlayHover,
            border: 'none',
            borderRadius: '0.6rem',
            color: colors.text.onBrand,
            fontSize: '1.2rem',
            cursor: newName.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>

      {/* Variable List */}
      {variables.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {variables.map((variable, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.8rem 1rem',
                backgroundColor: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '0.6rem',
              }}
            >
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <span style={{ color: '#a855f7', fontSize: '1.2rem' }}>@</span>
                <input
                  value={variable.name}
                  onChange={(e) =>
                    variableStoreActions.updateVariable(index, { name: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    fontFamily: 'monospace',
                    backgroundColor: colors.bg.overlay,
                  }}
                />
              </div>

              {/* Value */}
              <input
                value={variable.value}
                onChange={(e) =>
                  variableStoreActions.updateVariable(index, { value: e.target.value })
                }
                placeholder='Value'
                style={{
                  ...inputStyle,
                  flex: 2,
                  backgroundColor: colors.bg.overlay,
                }}
              />

              {/* Delete */}
              <button
                onClick={() => variableStoreActions.removeVariable(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                  color: colors.feedback.error,
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {/* Clear All Variables */}
          <button
            onClick={() => variableStoreActions.clearVariables()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.4rem',
              color: colors.feedback.error,
              fontSize: '1.2rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            <Trash2 size={12} />
            Clear All Variables
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: colors.text.tertiary,
            fontSize: '1.2rem',
          }}
        >
          No variables yet. Add variables above to use them across all endpoints.
        </div>
      )}
    </div>
  );
}
