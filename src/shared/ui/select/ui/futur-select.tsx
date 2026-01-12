import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { ChevronDown, ChevronUp, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

export function FuturSelect({
  options,
  value,
  onChange,
  width = '100%',
  placeholder = 'Select option',
  style,
  className,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
  placeholder?: string;
  style?: CSSProperties;
  className?: string;
}) {
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

  const handleSelect = (optionValue: string) => {
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
          padding: '1rem 1.2rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: isOpen
            ? '1px solid rgba(255, 255, 255, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.6rem',
          cursor: 'pointer',
          color: selectedOption ? '#e5e5e5' : '#9ca3af',
          fontSize: '1.3rem',
          transition: 'all 0.2s ease',
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
          <ChevronUp size={16} color='#9ca3af' />
        ) : (
          <ChevronDown size={16} color='#9ca3af' />
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
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.6rem',
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          {options.length === 0 ? (
            <div
              style={{
                padding: '1.2rem',
                color: '#6b7280',
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
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'transparent';
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.2rem',
                    cursor: 'pointer',
                    color: isSelected ? '#fff' : '#d1d5db',
                    fontSize: '1.3rem',
                    backgroundColor: isSelected
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0)',
                    transition: 'background-color 0.1s',
                  }}
                >
                  <span style={{ flex: 1 }}>{option.label}</span>
                  {isSelected && <Check size={14} color='#10b981' />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
