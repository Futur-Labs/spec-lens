import { useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

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

  // 드롭다운 위치를 DOM 직접 조작으로 설정 (setState 없이)
  useLayoutEffect(() => {
    if (!showDropdown || !inputRef.current || !dropdownRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    dropdownRef.current.style.top = `${rect.bottom + 4}px`;
    dropdownRef.current.style.left = `${rect.left}px`;
    dropdownRef.current.style.width = `${rect.width}px`;
  }, [showDropdown, inputRef, dropdownRef]);

  const InputComponent = multiline ? 'textarea' : 'input';

  const dropdown =
    showDropdown && filteredVars.length > 0
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              backgroundColor: colors.bg.elevated,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '0.6rem',
              maxHeight: '200px',
              overflow: 'auto',
              zIndex: 9999,
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
          </div>,
          document.body,
        )
      : null;

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
      {dropdown}
    </div>
  );
}
