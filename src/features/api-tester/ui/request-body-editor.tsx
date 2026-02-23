import { VariableAutocompleteInput } from '@/entities/api-spec';
import { testParamsStoreActions, useRequestBody } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { ResetButton } from '@/shared/ui/button';

export function RequestBodyEditor({
  bodyExample,
  jsonError,
  fixSuggestion,
  formattedJson,
  validate,
}: {
  bodyExample: string;
  jsonError: string | null;
  fixSuggestion: string | null;
  formattedJson: string | null;
  validate: (value: string) => void;
}) {
  const colors = useColors();
  const requestBody = useRequestBody();

  const handleApplyFix = () => {
    if (!fixSuggestion) return;
    testParamsStoreActions.setRequestBody(fixSuggestion);
    validate(fixSuggestion);
  };

  const handleFormat = () => {
    if (!formattedJson) return;
    testParamsStoreActions.setRequestBody(formattedJson);
    validate(formattedJson);
  };

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
          validate(value);
        }}
        multiline
        style={{
          width: '100%',
          padding: '1.2rem',
          backgroundColor: colors.bg.overlay,
          border: `1px solid ${jsonError ? `${colors.feedback.error}80` : colors.border.default}`,
          borderRadius: '0.6rem',
          color: colors.text.primary,
          fontSize: '1.3rem',
          fontFamily: 'monospace',
          resize: 'none',
          outline: 'none',
          maxHeight: '60rem',
          overflow: 'auto',
        }}
      />
      {jsonError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginTop: '0.6rem',
            padding: '0.8rem',
            backgroundColor: `${colors.feedback.error}15`,
            border: `1px solid ${colors.feedback.error}25`,
            borderRadius: '0.4rem',
            color: colors.feedback.error,
            fontSize: '1.2rem',
          }}
        >
          <span>Invalid JSON: {jsonError}</span>
          {fixSuggestion && (
            <button
              onClick={handleApplyFix}
              style={{
                padding: '0.2rem 0.6rem',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.feedback.error}`,
                borderRadius: '0.3rem',
                color: colors.feedback.error,
                fontSize: '1.1rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Auto Fix
            </button>
          )}
        </div>
      )}
      {!jsonError && formattedJson && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginTop: '0.4rem',
          }}
        >
          <button
            onClick={handleFormat}
            style={{
              padding: '0.2rem 0.6rem',
              backgroundColor: 'transparent',
              border: `1px solid ${colors.text.tertiary}`,
              borderRadius: '0.3rem',
              color: colors.text.tertiary,
              fontSize: '1.1rem',
              cursor: 'pointer',
            }}
          >
            Format JSON
          </button>
        </div>
      )}
    </div>
  );
}
