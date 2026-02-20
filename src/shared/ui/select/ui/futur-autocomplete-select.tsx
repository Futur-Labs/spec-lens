import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { type CSSProperties, useCallback, useRef, useState } from 'react';

import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { useColors } from '@/shared/theme';

interface Option<Value extends string> {
  label: string;
  value: Value;
}

export function FuturAutocompleteSelect<Value extends string>({
  options,
  value,
  onChange,
  width = '100%',
  placeholder = 'Select or type...',
  style,
  className,
  allowCustomValue = false,
}: {
  options: Option<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  width?: string;
  placeholder?: string;
  style?: CSSProperties;
  className?: string;
  allowCustomValue?: boolean;
}) {
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  // Handle close - save custom value if allowed
  const handleClose = useCallback(
    (saveValue: boolean = true) => {
      if (saveValue && allowCustomValue && searchTerm.trim()) {
        // Save the current search term as value when closing
        onChange(searchTerm.trim() as Value);
      }
      setIsOpen(false);
      setSearchTerm('');
    },
    [allowCustomValue, searchTerm, onChange],
  );

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) {
        handleClose(true);
      } else {
        setIsOpen(true);
      }
    },
    middleware: [
      offset(6),
      flip(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  // Filter options based on search term
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get display value - show label if exists, otherwise show value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = isOpen ? searchTerm : selectedOption?.label || value || '';

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSearchTerm(selectedOption?.label || value || '');
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [selectedOption, value]);

  const handleSelect = useCallback(
    (optionValue: Value) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    },
    [onChange],
  );

  // Cancel without saving (Escape)
  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setSearchTerm('');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleOpen();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            handleSelect(filteredOptions[selectedIndex].value);
          } else if (allowCustomValue && searchTerm.trim()) {
            handleSelect(searchTerm.trim() as Value);
          }
          break;
        case 'Escape':
          handleCancel();
          break;
      }
    },
    [
      isOpen,
      handleOpen,
      filteredOptions,
      selectedIndex,
      handleSelect,
      handleCancel,
      allowCustomValue,
      searchTerm,
    ],
  );

  // Scroll selected item into view
  const scrollToSelected = useCallback((index: number) => {
    if (dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[index] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, []);

  // Callback refs for floating UI
  const setReferenceRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setReference(node);
    },
    [refs],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      floatingRef.current = node;
      refs.setFloating(node);
    },
    [refs],
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        ...style,
      }}
    >
      <div
        ref={setReferenceRef}
        {...getReferenceProps()}
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: '1.2rem',
          backgroundColor: colors.bg.autoComplete,
          border: isOpen
            ? `1px solid ${colors.border.focus}`
            : `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          cursor: 'pointer',
          color: displayValue ? colors.text.primary : colors.text.disabled,
          fontSize: '1.2rem',
          // transition: 'border-color 0.2s ease',
          minHeight: '3.4rem',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginRight: '0.8rem',
            flex: 1,
          }}
        >
          {displayValue || placeholder}
        </span>
        {isOpen ? (
          <ChevronUp size={16} color={colors.text.secondary} style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color={colors.text.secondary} style={{ flexShrink: 0 }} />
        )}
      </div>

      {isOpen && (
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
              {/* Search input */}
              <input
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
                  // borderBottom: 'none',
                  borderRadius: '0.6rem 0.6rem 0 0',
                  outline: 'none',
                  color: colors.text.primary,
                  fontSize: '1.2rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />

              {/* Options dropdown */}
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
      )}
    </div>
  );
}
