import { useEffect, useRef } from 'react';

import {
  type ParameterObject,
  type ParsedEndpoint,
  type ResponseObject,
  generateExample,
  getExampleFromMediaType,
  getMergedParameters,
  isReferenceObject,
  MethodBadge,
  ParameterGroup,
  ResponseItem,
  SchemaViewer,
  useSpec,
} from '@/entities/api-spec';
import { TryItPanel } from '@/features/api-tester';
import { useColors } from '@/shared/theme';
import { FormattedText } from '@/shared/ui/formatted-text';
import { JsonActionWrapper } from '@/shared/ui/json-action-wrapper';
import { CollapsibleSection } from '@/shared/ui/section/ui/collapsible-section';

export function EndpointDetail({ endpoint }: { endpoint: ParsedEndpoint }) {
  const colors = useColors();
  const containerRef = useRef<HTMLDivElement>(null);
  const { operation, path, method } = endpoint;
  const spec = useSpec();

  // Scroll to top when endpoint changes
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [path, method]);

  // Get merged parameters
  const allParams = getMergedParameters(endpoint);
  const parameters = allParams.filter((p): p is ParameterObject => !isReferenceObject(p));

  const pathParams = parameters.filter((p) => p.in === 'path');
  const queryParams = parameters.filter((p) => p.in === 'query');
  const headerParams = parameters.filter((p) => p.in === 'header');

  // Get request body schema
  const requestBody = operation.requestBody;
  const requestBodyContent =
    requestBody && !isReferenceObject(requestBody)
      ? requestBody.content?.['application/json']
      : null;

  // Get responses
  const responses = Object.entries(operation.responses || {});

  if (!spec) return null;

  return (
    <div
      ref={containerRef}
      style={{
        padding: '2.4rem',
        maxWidth: '90rem',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2.4rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.2rem',
            marginBottom: '1.2rem',
          }}
        >
          <MethodBadge method={method} size='lg' />
          <h1
            style={{
              color: colors.text.primary,
              fontSize: '2rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {path.split('/').map((segment, index) => (
              <span key={index}>
                {index > 0 && (
                  <>
                    <wbr />
                    <span style={{ color: colors.text.tertiary }}>/</span>
                  </>
                )}
                {segment}
              </span>
            ))}
          </h1>
        </div>

        {operation.summary && (
          <p
            style={{
              color: colors.text.primary,
              fontSize: '1.6rem',
              marginBottom: '0.8rem',
            }}
          >
            {operation.summary}
          </p>
        )}

        {operation.description && (
          <p
            style={{
              color: colors.text.secondary,
              fontSize: '1.4rem',
              lineHeight: 1.6,
            }}
          >
            <FormattedText text={operation.description} />
          </p>
        )}

        {operation.tags && operation.tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.8rem',
              marginTop: '1.2rem',
            }}
          >
            {operation.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.4rem 1rem',
                  backgroundColor: colors.bg.overlayHover,
                  borderRadius: '0.4rem',
                  color: colors.text.primary,
                  fontSize: '1.2rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {operation.deprecated && (
          <div
            style={{
              marginTop: '1.2rem',
              padding: '0.8rem 1.2rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.6rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <span style={{ color: colors.feedback.error, fontSize: '1.3rem', fontWeight: 500 }}>
              Deprecated
            </span>
          </div>
        )}
      </div>

      {/* Parameters Section */}
      {parameters.length > 0 && (
        <CollapsibleSection title='Parameters'>
          {pathParams.length > 0 && (
            <ParameterGroup title='Path Parameters' params={pathParams} spec={spec} />
          )}
          {queryParams.length > 0 && (
            <ParameterGroup title='Query Parameters' params={queryParams} spec={spec} />
          )}
          {headerParams.length > 0 && (
            <ParameterGroup title='Header Parameters' params={headerParams} spec={spec} />
          )}
        </CollapsibleSection>
      )}

      {/* Request Body Section */}
      {requestBodyContent?.schema && (
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
      )}

      {responses.length > 0 && (
        <CollapsibleSection title='Responses'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {responses.map(([statusCode, responseOrRef]) => {
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
      )}

      <TryItPanel endpoint={endpoint} spec={spec} />
    </div>
  );
}
