import { useLayoutEffect } from 'react';

import { useVariableAutocomplete } from '../model/use-variable-autocomplete';
import { useColors } from '@/shared/theme';

export function VariableAutocompleteInput({
  value,
  onChange,
  placeholder,
  style,
  multiline,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}) {
  const colors = useColors();
  const {
    showDropdown,
    filteredVars,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    dropdownRef,
    handleChange,
    handleSelect,
    handleKeyDown,
  } = useVariableAutocomplete(value, onChange);

  useLayoutEffect(() => {
    if (!multiline || !inputRef.current) return;
    const textarea = inputRef.current as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  }, [value, multiline, inputRef]);

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <InputComponent
        className='placeholder-sm'
        ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={style}
      />

      {showDropdown && filteredVars.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.4rem',
            backgroundColor: colors.bg.elevated,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '0.6rem',
            maxHeight: '200px',
            overflow: 'auto',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {filteredVars.map((v, index) => (
            <div
              key={v.name}
              onClick={() => handleSelect(v.name)}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{
                padding: '0.8rem 1.2rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor:
                  index === selectedIndex ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                borderBottom:
                  index < filteredVars.length - 1 ? `1px solid ${colors.border.subtle}` : 'none',
              }}
            >
              <span style={{ color: '#a855f7', fontFamily: 'monospace', fontWeight: 500 }}>
                @{v.name}
              </span>
              <span
                style={{
                  color: colors.text.secondary,
                  fontSize: '1.1rem',
                  maxWidth: '150px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
