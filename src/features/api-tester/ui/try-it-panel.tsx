import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { ChevronDown, Play, Trash2 } from 'lucide-react';

import { AuthCookieStatusBar } from './auth-cookie-status-bar';
import { ExecuteActions } from './execute-actions';
import { ExecuteResponseViewer } from './execute-response-viewer';
import { FormDataEditor } from './form-data-editor';
import { HeaderEditor } from './header-editor';
import { ParameterEditSection } from './parameter-edit-section';
import { RepeatSettings } from './repeat-settings';
import { RequestBodyEditor } from './request-body-editor';
import { ServerSelector } from './server-selector';
import { getBodyExample } from '../lib/body-example';
import { getContentTypeCategory, getFormFields } from '../lib/content-type';
import { useAutoSaveParams } from '../model/use-auto-save-params';
import { useEndpointParameters } from '../model/use-endpoint-parameters';
import { useEndpointParamsSync } from '../model/use-endpoint-params-sync';
import { type ApiSpec, type ParsedEndpoint } from '@/entities/api-spec';
import {
  testParamsStoreActions,
  useExecuteError,
  useIsExecuting,
  usePathParams,
  useQueryParams,
} from '@/entities/test-params';
import { useColors } from '@/shared/theme';

export function TryItPanel({ endpoint, spec }: { endpoint: ParsedEndpoint; spec: ApiSpec }) {
  const colors = useColors();
  const [isExpanded, setIsExpanded] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Repeat request settings
  const [requestCount, setRequestCount] = useState(1);
  const [requestInterval, setRequestInterval] = useState(0); // ms

  const isExecuting = useIsExecuting();
  const executeError = useExecuteError();
  const pathParams = usePathParams();
  const queryParams = useQueryParams();

  const contentTypeCategory = getContentTypeCategory(endpoint);
  const bodyExample = getBodyExample(endpoint, spec);
  const formFields = useMemo(() => getFormFields(endpoint, spec), [endpoint, spec]);
  const { handleClearCurrent } = useEndpointParamsSync(endpoint, bodyExample);
  useAutoSaveParams(endpoint);
  const { pathParameters, queryParameters, hasRequestBody } = useEndpointParameters(endpoint);

  return (
    <div
      style={{
        marginTop: '2.4rem',
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.8rem',
        border: `1px solid ${colors.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.4rem 1.6rem',
        }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Play
            size={16}
            fill={colors.text.primary}
            color={colors.text.primary}
            style={{ opacity: 0.8 }}
          />
          <span style={{ color: colors.text.primary, fontSize: '1.4rem', fontWeight: 600 }}>
            Try it out
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ChevronDown size={18} color={colors.text.secondary} />
          </motion.div>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClearCurrent();
          }}
          disabled={isExecuting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.8rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.4rem',
            color: colors.feedback.error,
            fontSize: '1.1rem',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            opacity: isExecuting ? 0.5 : 1,
          }}
          title='Reset all test data for this endpoint'
        >
          <Trash2 size={10} />
          Reset All
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
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
                display: 'flex',
                flexDirection: 'column',
                gap: '1.6rem',
              }}
            >
              <ServerSelector spec={spec} />

              <AuthCookieStatusBar />

              {(pathParameters.length > 0 || queryParameters.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <ParameterEditSection
                    label='PATH PARAMS'
                    parameters={pathParameters}
                    values={pathParams}
                    onChange={(name, v) => testParamsStoreActions.setPathParam(name, v)}
                    onReset={() => testParamsStoreActions.resetPathParams()}
                    resetTitle='Reset path params'
                  />
                  <ParameterEditSection
                    label='QUERY PARAMS'
                    parameters={queryParameters}
                    values={queryParams}
                    onChange={(name, v) => testParamsStoreActions.setQueryParam(name, v)}
                    onReset={() => testParamsStoreActions.resetQueryParams()}
                    resetTitle='Reset query params'
                  />
                </div>
              )}

              <HeaderEditor
                onReset={() => {
                  const rb = endpoint.operation.requestBody;
                  if (rb && !('$ref' in rb) && rb.content) {
                    const cts = Object.keys(rb.content);
                    if (cts.length > 0) {
                      const ct = cts.find((t) => t.includes('application/json')) || cts[0];
                      testParamsStoreActions.setHeader('Content-Type', ct);
                    }
                  }
                }}
              />

              {hasRequestBody &&
                (contentTypeCategory === 'json' || contentTypeCategory === 'other' ? (
                  <RequestBodyEditor
                    bodyExample={bodyExample}
                    jsonError={jsonError}
                    setJsonError={setJsonError}
                  />
                ) : (
                  <FormDataEditor
                    fields={formFields}
                    label={
                      contentTypeCategory === 'multipart'
                        ? 'Multipart Form Data'
                        : 'Form Data (URL Encoded)'
                    }
                    onReset={() => {
                      testParamsStoreActions.setRequestBody(bodyExample);
                    }}
                  />
                ))}

              <RepeatSettings
                requestCount={requestCount}
                requestInterval={requestInterval}
                setRequestCount={setRequestCount}
                setRequestInterval={setRequestInterval}
              />

              <ExecuteActions
                requestCount={requestCount}
                requestInterval={requestInterval}
                endpoint={endpoint}
                jsonError={contentTypeCategory === 'json' ? jsonError : null}
              />

              <ExecuteResponseViewer isExecuting={isExecuting} executeError={executeError} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
