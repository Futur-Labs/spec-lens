import type { CSSProperties } from 'react';

import { AutocompleteDropdown } from './autocomplete-dropdown';
import { AutocompleteTrigger } from './autocomplete-trigger';
import { useAutocompleteSelect } from '../hooks/use-autocomplete-select';
import { AutocompleteContext } from '../model/autocomplete-context';
import type { Option } from '../model/types';

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
  const contextValue = useAutocompleteSelect({
    options,
    value,
    onChange,
    allowCustomValue,
    placeholder,
  });

  return (
    <AutocompleteContext value={contextValue}>
      <div
        className={className}
        style={{
          position: 'relative',
          width,
          ...style,
        }}
      >
        <AutocompleteTrigger />
        {contextValue.isOpen && <AutocompleteDropdown />}
      </div>
    </AutocompleteContext>
  );
}
