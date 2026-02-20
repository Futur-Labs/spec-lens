import {
  autoUpdate,
  flip,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { useCallback, useRef, useState } from 'react';

import type { AutocompleteContextValue } from '../model/autocomplete-context';
import type { Option } from '../model/types';

export function useAutocompleteSelect<Value extends string | number>({
  options,
  value,
  onChange,
  allowCustomValue = false,
  placeholder = 'Select or type...',
}: {
  options: Option<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  allowCustomValue?: boolean;
  placeholder?: string;
}): AutocompleteContextValue {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(
    (saveValue: boolean = true) => {
      if (saveValue && allowCustomValue && searchTerm.trim()) {
        onChange(searchTerm.trim() as Value);
      }
      setIsOpen(false);
      setSearchTerm('');
    },
    [allowCustomValue, searchTerm, onChange],
  );

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

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = isOpen ? searchTerm : selectedOption?.label || String(value) || '';

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSearchTerm(selectedOption?.label || String(value) || '');
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [selectedOption, value]);

  const handleSelect = useCallback(
    (optionValue: string | number) => {
      onChange(optionValue as Value);
      setIsOpen(false);
      setSearchTerm('');
    },
    [onChange],
  );

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
            handleSelect(searchTerm.trim());
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

  const scrollToSelected = useCallback((index: number) => {
    if (dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[index] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, []);

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

  return {
    isOpen,
    searchTerm,
    selectedIndex,
    displayValue,
    filteredOptions,
    value,
    allowCustomValue,
    placeholder,
    context,
    floatingStyles,
    inputRef,
    dropdownRef,
    setReferenceRef,
    setFloatingRef,
    getReferenceProps,
    getFloatingProps,
    handleOpen,
    handleClose,
    handleSelect,
    handleInputChange,
    handleKeyDown,
    scrollToSelected,
    setSelectedIndex,
  };
}
