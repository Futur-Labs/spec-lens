import { useState, useRef, useCallback, useEffect } from 'react';

import { useVariables } from '@/entities/variable';
import { useColors } from '@/shared/theme';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export function VariableAutocompleteInput({
  value,
  onChange,
  placeholder,
  style,
  multiline,
}: Props) {
  const colors = useColors();
  const variables = useVariables();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVars, setFilteredVars] = useState(variables);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [atPosition, setAtPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update filtered variables when variables change
  useEffect(() => {
    setFilteredVars(variables);
  }, [variables]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      // @ 입력 감지
      const cursorPos = e.target.selectionStart || 0;
      const textBeforeCursor = newValue.slice(0, cursorPos);
      const atMatch = textBeforeCursor.match(/@(\w*)$/);

      if (atMatch && variables.length > 0) {
        const searchTerm = atMatch[1].toLowerCase();
        const filtered = variables.filter((v) => v.name.toLowerCase().includes(searchTerm));
        setFilteredVars(filtered);
        setSelectedIndex(0);
        setAtPosition(cursorPos - atMatch[0].length);
        setShowDropdown(filtered.length > 0);
      } else {
        setShowDropdown(false);
      }
    },
    [onChange, variables],
  );

  const handleSelect = useCallback(
    (varName: string) => {
      const cursorPos = inputRef.current?.selectionStart || 0;
      const textBeforeCursor = value.slice(0, cursorPos);
      const textAfterCursor = value.slice(cursorPos);

      // 변수의 실제 value 값을 찾기
      const selectedVar = variables.find((v) => v.name === varName);
      const varValue = selectedVar?.value || '';

      // @xxx 를 실제 값으로 치환
      const newText = textBeforeCursor.replace(/@\w*$/, varValue) + textAfterCursor;
      onChange(newText);
      setShowDropdown(false);

      // Focus back to input and move cursor after the inserted value
      setTimeout(() => {
        if (inputRef.current) {
          const newCursorPos = atPosition + varValue.length;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [value, onChange, atPosition, variables],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredVars.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
        case 'Tab':
          if (filteredVars[selectedIndex]) {
            e.preventDefault();
            handleSelect(filteredVars[selectedIndex].name);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          break;
      }
    },
    [showDropdown, filteredVars, selectedIndex, handleSelect],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            // padding: '0.4rem 0',
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
