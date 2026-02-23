import { useState, useRef, useEffect } from 'react';

import { useVariables } from './variable-store.ts';
import { useActiveEnvironment } from '@/entities/environment';
import { parseAtMention, filterVariables, replaceAtMention } from '../lib/variable-autocomplete.ts';

export function useVariableAutocomplete(value: string, onChange: (v: string) => void) {
  const globalVariables = useVariables();
  const activeEnv = useActiveEnvironment();

  // 환경 변수와 글로벌 변수 병합 (환경 변수가 동일 이름일 때 우선)
  const variables = (() => {
    const envVars = activeEnv?.variables ?? [];
    const envVarNames = new Set(envVars.map((v) => v.name));
    return [...envVars, ...globalVariables.filter((v) => !envVarNames.has(v.name))];
  })();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVars, setFilteredVars] = useState(variables);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [atPosition, setAtPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update filtered variables when variables change
  useEffect(() => {
    setFilteredVars(variables);
  }, [variables]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart || 0;
    const nativeEvent = e.nativeEvent as InputEvent;

    if (showDropdown) {
      // 이미 autocomplete 활성화 상태 → 필터링 계속
      const mention = parseAtMention(newValue, cursorPos);
      if (mention && variables.length > 0) {
        const filtered = filterVariables(variables, mention.searchTerm);
        setFilteredVars(filtered);
        setSelectedIndex(0);
        setAtPosition(mention.atPosition);
        setShowDropdown(filtered.length > 0);
      } else {
        setShowDropdown(false);
      }
    } else if (nativeEvent.data === '@' && variables.length > 0) {
      // @ 키를 직접 타이핑한 경우에만 autocomplete 활성화
      const mention = parseAtMention(newValue, cursorPos);
      if (mention) {
        const filtered = filterVariables(variables, mention.searchTerm);
        setFilteredVars(filtered);
        setSelectedIndex(0);
        setAtPosition(mention.atPosition);
        setShowDropdown(filtered.length > 0);
      }
    }
  };

  const handleSelect = (varName: string) => {
    const cursorPos = inputRef.current?.selectionStart || 0;
    const selectedVar = variables.find((v) => v.name === varName);
    const varValue = selectedVar?.value || '';

    const { newText, newCursorPos } = replaceAtMention(value, cursorPos, varValue, atPosition);
    onChange(newText);
    setShowDropdown(false);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredVars.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case 'Tab':
        if (filteredVars[selectedIndex]) {
          e.preventDefault();
          handleSelect(filteredVars[selectedIndex].name);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    showDropdown,
    filteredVars,
    selectedIndex,
    setSelectedIndex,
    inputRef,
    dropdownRef,
    handleChange,
    handleSelect,
    handleKeyDown,
  };
}
