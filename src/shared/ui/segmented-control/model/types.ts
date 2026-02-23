export interface SegmentItem<Value extends string | number> {
  label: string;
  value: Value;
  disabled?: boolean;
}

export interface SegmentItemState {
  isSelected: boolean;
  disabled: boolean;
}
