import { VariableAutocompleteInput } from './variable-autocomplete-input.tsx';
import { getParameterInputStyle } from '../lib/input-style.ts';
import { type ParameterObject, isReferenceObject } from '../model/api-types.ts';
import { useColors } from '@/shared/theme';

export function ParameterInput({
  param,
  value,
  onChange,
}: {
  param: ParameterObject;
  value: string;
  onChange: (v: string) => void;
}) {
  const colors = useColors();
  const parameterInputStyle = getParameterInputStyle(colors);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '120px', flexShrink: 0 }}>
        <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: colors.text.primary }}>
          {param.name}
        </span>
        {param.required && (
          <span style={{ color: colors.feedback.error, marginLeft: '0.2rem' }}>*</span>
        )}
      </div>
      <VariableAutocompleteInput
        value={value}
        onChange={onChange}
        placeholder={
          param.description ||
          (param.schema && !isReferenceObject(param.schema) ? String(param.schema.type || '') : '')
        }
        style={parameterInputStyle}
      />
    </div>
  );
}
