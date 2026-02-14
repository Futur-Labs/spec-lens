import {
  isReferenceObject,
  ResponseItem,
  type ApiSpec,
  type ResponseObject,
  type ResponsesObject,
} from '@/entities/api-spec';
import { CollapsibleSection } from '@/shared/ui/section';

export function EndpointResponsesSection({
  responses,
  spec,
}: {
  responses: ResponsesObject;
  spec: ApiSpec;
}) {
  const responseEntries = Object.entries(responses || {});

  if (responseEntries.length === 0) {
    return;
  }

  return (
    <CollapsibleSection title='Responses'>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {responseEntries.map(([statusCode, responseOrRef]) => {
          if (isReferenceObject(responseOrRef)) return null;
          const response = responseOrRef as ResponseObject;
          const responseSchema = response.content?.['application/json']?.schema;

          return (
            <ResponseItem
              key={statusCode}
              statusCode={statusCode}
              response={response}
              schema={responseSchema}
              spec={spec}
            />
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
