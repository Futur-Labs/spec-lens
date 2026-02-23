import { FloatingFocusManager, FloatingPortal } from '@floating-ui/react';

import { Check } from 'lucide-react';

import { useAutocompleteContext } from '../model/autocomplete-context';
import { useColors } from '@/shared/theme';

export function AutocompleteDropdown() {
  const colors = useColors();
  const {
    value,
    searchTerm,
    selectedIndex,
    filteredOptions,
    allowCustomValue,
    placeholder,
    context,
    floatingStyles,
    inputRef,
    dropdownRef,
    setFloatingRef,
    getFloatingProps,
    handleSelect,
    handleInputChange,
    handleKeyDown,
    scrollToSelected,
    setSelectedIndex,
  } = useAutocompleteContext();

  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false}>
        <div
          ref={setFloatingRef}
          style={{
            ...floatingStyles,
            zIndex: 9999,
          }}
          {...getFloatingProps()}
        >
          <input
            className='placeholder-sm'
            ref={inputRef}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '0.8rem 1.2rem',
              backgroundColor: colors.bg.elevated,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '0.6rem 0.6rem 0 0',
              outline: 'none',
              color: colors.text.primary,
              fontSize: '1.2rem',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />

          <div
            ref={dropdownRef}
            style={{
              maxHeight: '20rem',
              overflowY: 'auto',
              backgroundColor: colors.bg.elevated,
              border: `1px solid ${colors.border.default}`,
              borderTop: 'none',
              borderRadius: '0 0 0.6rem 0.6rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '1.2rem',
                  color: colors.text.tertiary,
                  fontSize: '1.2rem',
                  textAlign: 'center',
                }}
              >
                {allowCustomValue && searchTerm.trim()
                  ? `Press Enter to use "${searchTerm}"`
                  : 'No options'}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value === option.value;
                const isHighlighted = index === selectedIndex;
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => {
                      setSelectedIndex(index);
                      scrollToSelected(index);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.7rem 1.2rem',
                      cursor: 'pointer',
                      color: isSelected ? colors.text.primary : colors.text.secondary,
                      fontSize: '1.2rem',
                      backgroundColor: isHighlighted
                        ? colors.bg.overlayHover
                        : isSelected
                          ? colors.bg.overlay
                          : 'transparent',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <span style={{ flex: 1 }}>{option.label}</span>
                    {isSelected && <Check size={14} color={colors.feedback.success} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
