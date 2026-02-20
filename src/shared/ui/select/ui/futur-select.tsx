import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { ChevronDown, ChevronUp, Check } from 'lucide-react';

import { useColors } from '@/shared/theme';

interface Option<Value extends string | number> {
  label: string;
  value: Value;
}

export function FuturSelect<Value extends string | number>({
  options,
  value,
  onChange,
  width = '100%',
  placeholder = 'Select option',
  style,
  className,
}: {
  options: Option<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  width?: string;
  placeholder?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: Value) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width,
        ...style,
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.7rem 1.2rem',
          backgroundColor: colors.bg.autoComplete,
          border: isOpen
            ? `1px solid ${colors.border.focus}`
            : `1px solid ${colors.border.default}`,
          borderRadius: '0.6rem',
          cursor: 'pointer',
          color: selectedOption ? colors.text.primary : colors.text.secondary,
          fontSize: '1.2rem',
          // transition: 'all 0.1s ease',
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginRight: '0.8rem',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp size={16} color={colors.text.secondary} />
        ) : (
          <ChevronDown size={16} color={colors.text.secondary} />
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.6rem)',
            left: 0,
            width: '100%',
            maxHeight: '24rem',
            overflowY: 'auto',
            backgroundColor: colors.bg.elevated,
            border: `1px solid ${colors.border.default}`,
            borderRadius: '0.6rem',
            padding: 0,
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {options.length === 0 ? (
            <div
              style={{
                padding: '1.2rem',
                color: colors.text.tertiary,
                fontSize: '1.2rem',
                textAlign: 'center',
              }}
            >
              No options
            </div>
          ) : (
            options.map((option) => {
              const isSelected = value === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg.overlayHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? colors.bg.overlay
                      : 'transparent';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1.2rem',
                    cursor: 'pointer',
                    color: isSelected ? colors.text.primary : colors.text.secondary,
                    fontSize: '1.2rem',
                    backgroundColor: isSelected ? colors.bg.overlay : 'transparent',
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
      )}
    </div>
  );
}
