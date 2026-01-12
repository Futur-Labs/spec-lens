import { useState } from 'react';

import { ChevronDown, ChevronRight } from 'lucide-react';

import {
  type ParsedEndpoint,
  type OpenAPISpec,
  type ParameterObject,
  type ResponseObject,
  getMergedParameters,
  isReferenceObject,
  MethodBadge,
  SchemaViewer,
} from '@/entities/openapi';
import { TryItPanel } from '@/features/api-tester';
import { FormattedText } from '@/shared/ui/formatted-text';

export function EndpointDetail({
  endpoint,
  spec,
}: {
  endpoint: ParsedEndpoint;
  spec: OpenAPISpec;
}) {
  const { operation, path, method } = endpoint;

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

  return (
    <div
      style={{
        padding: '2.4rem',
        maxWidth: '900px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2.4rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
            marginBottom: '1.2rem',
          }}
        >
          <MethodBadge method={method} size='lg' />
          <h1
            style={{
              color: '#ffffff', // Changed to pure white
              fontSize: '2rem',
              fontWeight: 600,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {path}
          </h1>
        </div>

        {operation.summary && (
          <p
            style={{
              color: '#ffffff', // Changed to pure white
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
              color: '#d1d5db', // gray-300 (lighter than previous 400)
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
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', // Lighter background
                  borderRadius: '0.4rem',
                  color: '#e5e5e5', // Lighter text
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
            <span style={{ color: '#ef4444', fontSize: '1.3rem', fontWeight: 500 }}>
              Deprecated
            </span>
          </div>
        )}
      </div>

      {/* Parameters Section */}
      {parameters.length > 0 && (
        <Section title='Parameters'>
          {pathParams.length > 0 && <ParameterGroup title='Path Parameters' params={pathParams} />}
          {queryParams.length > 0 && (
            <ParameterGroup title='Query Parameters' params={queryParams} />
          )}
          {headerParams.length > 0 && (
            <ParameterGroup title='Header Parameters' params={headerParams} />
          )}
        </Section>
      )}

      {/* Request Body Section */}
      {requestBodyContent?.schema && (
        <Section title='Request Body'>
          <div
            style={{
              padding: '1.6rem',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '0.6rem',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <SchemaViewer schema={requestBodyContent.schema} spec={spec} />
          </div>
        </Section>
      )}

      {/* Responses Section */}
      {responses.length > 0 && (
        <Section title='Responses'>
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
        </Section>
      )}

      {/* Try It Out Panel */}
      <TryItPanel endpoint={endpoint} spec={spec} />
    </div>
  );
}

// Section Component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2.4rem' }}>
      <h2
        style={{
          color: '#ffffff', // Changed to pure white as requested
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '1.2rem',
          paddingBottom: '0.8rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

// Parameter Group Component
function ParameterGroup({ title, params }: { title: string; params: ParameterObject[] }) {
  return (
    <div style={{ marginBottom: '1.6rem' }}>
      <h3
        style={{
          color: '#e5e5e5', // Lighter gray
          fontSize: '1.2rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.8rem',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: '0.6rem',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}
      >
        {params.map((param, index) => (
          <div
            key={param.name}
            style={{
              padding: '1.2rem 1.6rem',
              borderBottom: index < params.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                marginBottom: '0.4rem',
              }}
            >
              <span
                style={{
                  color: '#ffffff', // Pure white name
                  fontSize: '1.3rem',
                  fontFamily: 'monospace',
                }}
              >
                {param.name}
              </span>
              {param.required && (
                <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>required</span>
              )}
              {param.schema && !isReferenceObject(param.schema) && param.schema.type && (
                <span
                  style={{
                    color: '#9ca3af',
                    fontSize: '1.2rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {param.schema.type}
                </span>
              )}
            </div>
            {param.description && (
              <p style={{ color: '#d1d5db', fontSize: '1.2rem', margin: 0 }}>
                {/* Light gray desc */}
                <FormattedText text={param.description} />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Response Item Component
function ResponseItem({
  statusCode,
  response,
  schema,
  spec,
}: {
  statusCode: string;
  response: ResponseObject;
  schema: any;
  spec: OpenAPISpec;
}) {
  const [isExpanded, setIsExpanded] = useState(statusCode.startsWith('2'));

  const statusColor = getStatusCodeColor(statusCode);

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: '0.6rem',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1.2rem',
          padding: '1.2rem 1.6rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {isExpanded ? (
          <ChevronDown size={14} color='#9ca3af' />
        ) : (
          <ChevronRight size={14} color='#6b7280' />
        )}
        <span
          style={{
            color: statusColor,
            fontSize: '1.4rem',
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          {statusCode}
        </span>
        <span style={{ color: '#ffffff', fontSize: '1.3rem' }}>
          <FormattedText text={response.description} />
        </span>
        {/* White response desc */}
      </button>

      {isExpanded && schema && (
        <div
          style={{
            padding: '0 1.6rem 1.6rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ paddingTop: '1.2rem' }}>
            <SchemaViewer schema={schema} spec={spec} />
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusCodeColor(statusCode: string): string {
  const code = parseInt(statusCode, 10);
  if (code >= 200 && code < 300) return '#10b981';
  if (code >= 300 && code < 400) return '#3b82f6';
  if (code >= 400 && code < 500) return '#f59e0b';
  if (code >= 500) return '#ef4444';
  return '#6b7280';
}
