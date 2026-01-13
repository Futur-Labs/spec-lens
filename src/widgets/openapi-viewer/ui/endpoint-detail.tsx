import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { JsonActionWrapper } from './json-action-wrapper';
import {
  type ParsedEndpoint,
  type OpenAPISpec,
  type ParameterObject,
  type ResponseObject,
  getMergedParameters,
  isReferenceObject,
  MethodBadge,
  SchemaViewer,
  generateExample,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { operation, path, method } = endpoint;

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
              color: '#f3f4f6', // Softened white (Gray-100) for less eye strain
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
                    <span style={{ color: '#6b7280' }}>/</span>
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
              color: '#e5e7eb', // Gray-200
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
          {pathParams.length > 0 && (
            <ParameterGroup title='Path Parameters' params={pathParams} spec={spec} />
          )}
          {queryParams.length > 0 && (
            <ParameterGroup title='Query Parameters' params={queryParams} spec={spec} />
          )}
          {headerParams.length > 0 && (
            <ParameterGroup title='Header Parameters' params={headerParams} spec={spec} />
          )}
        </Section>
      )}

      {/* Request Body Section */}
      {requestBodyContent?.schema && (
        <Section title='Request Body'>
          <JsonActionWrapper
            data={generateExample(requestBodyContent.schema, spec)}
            defaultView='schema'
          >
            <SchemaViewer schema={requestBodyContent.schema} spec={spec} />
          </JsonActionWrapper>
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
      <Section title='Try It Out'>
        <TryItPanel endpoint={endpoint} spec={spec} />
      </Section>
    </div>
  );
}

// Section Component
function Section({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div style={{ marginBottom: '2.4rem' }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          padding: '0 0 0.8rem 0',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '1.2rem',
        }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <ChevronDown size={20} color='#f3f4f6' />
        </motion.div>
        <h2
          style={{
            color: '#f3f4f6', // Gray-100
            fontSize: '1.5rem',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Parameter Group Component
function ParameterGroup({
  title,
  params,
  spec,
}: {
  title: string;
  params: ParameterObject[];
  spec: OpenAPISpec;
}) {
  // Generate JSON example for parameters
  const paramExample = params.reduce(
    (acc, param) => {
      if (param.schema && !isReferenceObject(param.schema)) {
        acc[param.name] = generateExample(param.schema, spec) ?? 'string';
      } else {
        acc[param.name] = 'string';
      }
      return acc;
    },
    {} as Record<string, any>,
  );

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
      <JsonActionWrapper data={paramExample}>
        <div
          style={{
            // Removed outer style as JsonActionWrapper handles the container style for the schema view?
            // Wait, JsonActionWrapper puts children in a padded container.
            // But ParameterGroup used to have a list style.
            // I should make children just the list of parameters.
            // However, the original design had the container around the list.
            // JsonActionWrapper provides a container for children.
            // So I just need to return the list items here.
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {params.map((param, index) => (
            <div
              key={param.name}
              style={{
                padding: '1.2rem 0', // Vertical padding only, horizontal handled by wrapper
                borderBottom:
                  index < params.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
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
                    color: '#f3f4f6', // Gray-100
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
      </JsonActionWrapper>
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
        backgroundColor: 'rgba(255,255,255,0.04)', // Slightly lighter
        borderRadius: '0.8rem',
        border: '1px solid rgba(255,255,255,0.08)',
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
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <ChevronDown size={14} color={isExpanded ? '#9ca3af' : '#6b7280'} />
        </motion.div>
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
        <span style={{ color: '#f3f4f6', fontSize: '1.3rem' }}>
          <FormattedText text={response.description} />
        </span>
        {/* White response desc */}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && schema && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 1.6rem 1.6rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ paddingTop: '1.2rem' }}>
                <JsonActionWrapper data={generateExample(schema, spec)} defaultView='schema'>
                  <SchemaViewer schema={schema} spec={spec} />
                </JsonActionWrapper>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
