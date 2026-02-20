import { ChevronDown, ChevronUp } from 'lucide-react';

import { useAutocompleteContext } from '../model/autocomplete-context';
import { useColors } from '@/shared/theme';

export function AutocompleteTrigger() {
  const colors = useColors();
  const {
    isOpen,
    displayValue,
    placeholder,
    handleOpen,
    handleClose,
    getReferenceProps,
    setReferenceRef,
  } = useAutocompleteContext();

  return (
    <div
      ref={setReferenceRef}
      {...getReferenceProps()}
      onClick={isOpen ? handleClose : handleOpen}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: '1.2rem',
        backgroundColor: colors.bg.autoComplete,
        border: isOpen ? `1px solid ${colors.border.focus}` : `1px solid ${colors.border.default}`,
        borderRadius: '0.6rem',
        cursor: 'pointer',
        color: displayValue ? colors.text.primary : colors.text.disabled,
        fontSize: '1.2rem',
        minHeight: '3.4rem',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginRight: '0.8rem',
          flex: 1,
        }}
      >
        {displayValue || placeholder}
      </span>
      {isOpen ? (
        <ChevronUp size={16} color={colors.text.secondary} style={{ flexShrink: 0 }} />
      ) : (
        <ChevronDown size={16} color={colors.text.secondary} style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}
