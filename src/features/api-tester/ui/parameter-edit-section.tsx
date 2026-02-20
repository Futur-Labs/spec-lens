import { FlexRow } from '@jigoooo/shared-ui';

import { type ParameterObject, ParameterInput } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { ResetButton } from '@/shared/ui/button';

export function ParameterEditSection({
  label,
  parameters,
  values,
  onChange,
  onReset,
  resetTitle,
}: {
  label: string;
  parameters: ParameterObject[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onReset: () => void;
  resetTitle: string;
}) {
  const colors = useColors();

  if (parameters.length === 0) return null;

  return (
    <div>
      <FlexRow
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.8rem',
        }}
      >
        <span
          style={{
            color: colors.text.primary,
            fontSize: '1.2rem',
            fontWeight: 600,
            opacity: 0.7,
          }}
        >
          {label}
        </span>
        {Object.keys(values).length > 0 && <ResetButton title={resetTitle} onClick={onReset} />}
      </FlexRow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {parameters.map((p) => (
          <ParameterInput
            key={p.name}
            param={p}
            value={values[p.name] || ''}
            onChange={(v) => onChange(p.name, v)}
          />
        ))}
      </div>
    </div>
  );
}
