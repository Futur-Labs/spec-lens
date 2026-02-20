import { useEffect, useState } from 'react';

import { useColors } from '@/shared/theme';

export function StepperInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const colors = useColors();
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow empty input for editing
    if (raw === '') {
      setInputValue('');
      return;
    }

    // Remove leading zeros (except for "0" itself)
    const cleaned = raw.replace(/^0+(?=\d)/, '');

    // Only allow digits
    if (!/^\d*$/.test(cleaned)) {
      return;
    }

    setInputValue(cleaned);

    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    // On blur, ensure we have a valid number
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || inputValue === '') {
      setInputValue(String(min));
      onChange(min);
    } else {
      const clamped = Math.max(min, Math.min(max, num));
      setInputValue(String(clamped));
      onChange(clamped);
    }
  };

  const increment = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
    setInputValue(String(newValue));
  };

  const decrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
    setInputValue(String(newValue));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        border: `1px solid ${colors.border.default}`,
        borderRadius: '0.6rem',
        overflow: 'hidden',
      }}
    >
      <button
        type='button'
        onClick={decrement}
        disabled={value <= min}
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: colors.bg.overlay,
          border: 'none',
          borderRight: `1px solid ${colors.border.default}`,
          color: value <= min ? colors.text.tertiary : colors.text.secondary,
          fontSize: '1.4rem',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        -
      </button>
      <input
        type='text'
        inputMode='numeric'
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{
          flex: 1,
          width: '100%',
          minWidth: '60px',
          padding: '0.8rem 1rem',
          backgroundColor: colors.bg.base,
          border: 'none',
          color: colors.text.primary,
          fontSize: '1.3rem',
          textAlign: 'center',
          outline: 'none',
        }}
      />
      <button
        type='button'
        onClick={increment}
        disabled={value >= max}
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: colors.bg.overlay,
          border: 'none',
          borderLeft: `1px solid ${colors.border.default}`,
          color: value >= max ? colors.text.tertiary : colors.text.secondary,
          fontSize: '1.4rem',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        +
      </button>
    </div>
  );
}
