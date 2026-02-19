import { ParameterTable } from './parameter-table.tsx';
import { getParamTypedData } from '../lib/parameter-example.ts';
import { type ApiSpec, type ParameterObject } from '../model/api-types.ts';
import { useColors } from '@/shared/theme';
import { JsonActionWrapper } from '@/shared/ui/json-action-wrapper';

export function ParameterGroup({
  title,
  params,
  spec,
}: {
  title: string;
  params: ParameterObject[];
  spec: ApiSpec;
}) {
  const colors = useColors();

  const paramTypeData = getParamTypedData(params, spec);

  return (
    <div style={{ marginBottom: '1.6rem' }}>
      <h3
        style={{
          color: colors.text.primary,
          fontSize: '1.2rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          paddingLeft: '0.8rem',
          borderLeft: `2px solid ${colors.feedback.info}`,
        }}
      >
        {title}
      </h3>

      <JsonActionWrapper typeData={paramTypeData}>
        <ParameterTable params={params} />
      </JsonActionWrapper>
    </div>
  );
}
