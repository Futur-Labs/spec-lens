import type { CSSProperties } from 'react';

import type { SegmentItem, SegmentItemState } from '../model/types';

export function SegmentedControl<Value extends string | number>({
  items,
  value,
  onChange,
  disabled = false,
  style,
  itemStyle,
  className,
}: {
  items: SegmentItem<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  style?: CSSProperties;
  itemStyle?: CSSProperties | ((state: SegmentItemState) => CSSProperties);
  className?: string;
}) {
  return (
    <div
      role='tablist'
      className={className}
      style={{
        display: 'flex',
        ...style,
      }}
    >
      {items.map((item) => {
        const isSelected = item.value === value;
        const isDisabled = disabled || !!item.disabled;
        const state: SegmentItemState = { isSelected, disabled: isDisabled };

        const resolvedItemStyle = typeof itemStyle === 'function' ? itemStyle(state) : itemStyle;

        return (
          <button
            key={item.value}
            role='tab'
            aria-selected={isSelected}
            disabled={isDisabled}
            onClick={() => onChange(item.value)}
            style={{
              border: 'none',
              background: 'none',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              ...resolvedItemStyle,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
