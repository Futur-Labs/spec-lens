import type { CSSProperties, ReactNode } from 'react';

export interface HeadlessCheckboxState {
  checked: boolean;
  disabled: boolean;
}

export interface HeadlessCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode | ((state: HeadlessCheckboxState) => ReactNode);
}

export function HeadlessCheckbox({
  checked,
  onChange,
  disabled = false,
  className,
  style,
  children,
}: HeadlessCheckboxProps) {
  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      {typeof children === 'function' ? children({ checked, disabled }) : children}
    </label>
  );
}
