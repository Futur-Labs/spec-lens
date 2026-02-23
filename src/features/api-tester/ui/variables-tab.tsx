import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';

import { getInputStyle, INPUT_CLASS_NAME } from '../lib/input-style';
import { useVariables, variableStoreActions } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function VariablesTab() {
  const colors = useColors();
  const variables = useVariables();
  const inputStyle = getInputStyle(colors);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

  const isDuplicate = newName.trim() !== '' && variables.some((v) => v.name === newName.trim());

  const handleAdd = () => {
    if (newName.trim() && !isDuplicate) {
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
          backgroundColor: `${colors.accent.purple}15`,
          border: `1px solid ${colors.accent.purple}25`,
          borderRadius: '0.6rem',
          fontSize: '1.1rem',
          color: colors.accent.purple,
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
          className={INPUT_CLASS_NAME}
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder='Variable value'
          className={INPUT_CLASS_NAME}
          style={{ ...inputStyle, flex: 2 }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim() || isDuplicate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.8rem 1.2rem',
            backgroundColor:
              newName.trim() && !isDuplicate ? colors.accent.purple : colors.bg.overlayHover,
            border: 'none',
            borderRadius: '0.6rem',
            color: colors.text.onBrand,
            fontSize: '1.2rem',
            cursor: newName.trim() && !isDuplicate ? 'pointer' : 'not-allowed',
          }}
        >
          <Plus size={14} />
          Add
        </button>
      </div>
      {isDuplicate && (
        <span style={{ color: colors.feedback.error, fontSize: '1.1rem' }}>
          Variable &quot;{newName.trim()}&quot; already exists.
        </span>
      )}

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
                backgroundColor: `${colors.accent.purple}0d`,
                border: `1px solid ${colors.accent.purple}25`,
                borderRadius: '0.6rem',
              }}
            >
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <span style={{ color: colors.accent.purple, fontSize: '1.2rem' }}>@</span>
                <input
                  value={variable.name}
                  onChange={(e) =>
                    variableStoreActions.updateVariable(index, { name: e.target.value })
                  }
                  style={{
                    ...inputStyle,
                    fontFamily: 'monospace',
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
                className={INPUT_CLASS_NAME}
                style={{
                  ...inputStyle,
                  flex: 2,
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
                  border: `1px solid ${colors.feedback.error}40`,
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
              border: `1px solid ${colors.feedback.error}40`,
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
