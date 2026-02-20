import type { FloatingContext } from '@floating-ui/react';
import {
  type CSSProperties,
  type HTMLAttributes,
  type RefObject,
  createContext,
  useContext,
} from 'react';

import type { Option } from './types';

export interface AutocompleteContextValue<Value extends string | number = string | number> {
  isOpen: boolean;
  searchTerm: string;
  selectedIndex: number;
  displayValue: string;
  filteredOptions: Option<Value>[];
  value: Value;
  allowCustomValue: boolean;
  placeholder: string;

  // floating UI
  context: FloatingContext;
  floatingStyles: CSSProperties;
  inputRef: RefObject<HTMLInputElement | null>;
  dropdownRef: RefObject<HTMLDivElement | null>;
  setReferenceRef: (node: HTMLDivElement | null) => void;
  setFloatingRef: (node: HTMLDivElement | null) => void;
  getReferenceProps: () => HTMLAttributes<HTMLDivElement>;
  getFloatingProps: () => HTMLAttributes<HTMLDivElement>;

  // handlers
  handleOpen: () => void;
  handleClose: () => void;
  handleSelect: (value: Value) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  scrollToSelected: (index: number) => void;
  setSelectedIndex: (index: number) => void;
}

export const AutocompleteContext = createContext<AutocompleteContextValue | null>(null);

export function useAutocompleteContext() {
  const context = useContext(AutocompleteContext);
  if (!context) {
    throw new Error('useAutocompleteContext must be used within FuturAutocompleteSelect');
  }
  return context;
}
