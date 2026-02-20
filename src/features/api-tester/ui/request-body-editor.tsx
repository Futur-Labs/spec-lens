import { VariableAutocompleteInput } from '@/entities/api-spec';
import { testParamsStoreActions, useRequestBody } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { ResetButton } from '@/shared/ui/button';

export function RequestBodyEditor({
  bodyExample,
  jsonError,
  setJsonError,
}: {
  bodyExample: string;
  jsonError: string | null;
  setJsonError: (jsonError: string | null) => void;
}) {
  const colors = useColors();
  const requestBody = useRequestBody();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.8rem',
        }}
      >
        <label style={{ color: colors.text.secondary, fontSize: '1.2rem', fontWeight: 500 }}>
          Request Body (JSON)
        </label>
        <ResetButton
          title='Reset to default example'
          onClick={() => {
            testParamsStoreActions.setRequestBody(bodyExample);
          }}
        />
      </div>
      <VariableAutocompleteInput
        value={requestBody}
        onChange={(value) => {
          testParamsStoreActions.setRequestBody(value);
          if (value.trim()) {
            try {
              JSON.parse(value);
              setJsonError(null);
            } catch (err) {
              setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
            }
          } else {
            setJsonError(null);
          }
        }}
        multiline
        style={{
          width: '100%',
          padding: '1.2rem',
          backgroundColor: colors.bg.overlay,
          border: `1px solid ${jsonError ? 'rgba(239, 68, 68, 0.5)' : colors.border.default}`,
          borderRadius: '0.6rem',
          color: colors.text.primary,
          fontSize: '1.3rem',
          fontFamily: 'monospace',
          resize: 'vertical',
          outline: 'none',
          minHeight: '160px',
        }}
      />
      {jsonError && (
        <div
          style={{
            marginTop: '0.6rem',
            padding: '0.8rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '0.4rem',
            color: colors.feedback.error,
            fontSize: '1.2rem',
          }}
        >
          Invalid JSON: {jsonError}
        </div>
      )}
    </div>
  );
}
