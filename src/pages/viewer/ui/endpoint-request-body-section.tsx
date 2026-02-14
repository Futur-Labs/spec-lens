import {
  generateExample,
  getExampleFromMediaType,
  isReferenceObject,
  SchemaViewer,
  type ApiSpec,
  type ReferenceObject,
  type RequestBodyObject,
} from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { JsonActionWrapper } from '@/shared/ui/json-action-wrapper';
import { CollapsibleSection } from '@/shared/ui/section';

export function EndpointRequestBodySection({
  requestBody,
  spec,
}: {
  requestBody: RequestBodyObject | ReferenceObject | undefined;
  spec: ApiSpec;
}) {
  const colors = useColors();

  const requestBodyContent =
    requestBody && !isReferenceObject(requestBody)
      ? requestBody.content?.['application/json']
      : null;

  if (!requestBodyContent?.schema) {
    return null;
  }

  return (
    <CollapsibleSection title='Request Body'>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
        }}
      >
        <span
          style={{
            fontSize: '1.1rem',
            color: colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          Content-Type:
        </span>
        <span
          style={{
            backgroundColor: colors.border.subtle,
            padding: '0.2rem 0.6rem',
            borderRadius: '0.4rem',
            color: colors.text.primary,
            fontFamily: 'monospace',
            fontSize: '1.2rem',
          }}
        >
          application/json
        </span>
      </div>
      <JsonActionWrapper
        data={
          getExampleFromMediaType(requestBodyContent) ||
          generateExample(requestBodyContent.schema, spec)
        }
        defaultView='schema'
      >
        <SchemaViewer schema={requestBodyContent.schema} spec={spec} />
      </JsonActionWrapper>
    </CollapsibleSection>
  );
}
