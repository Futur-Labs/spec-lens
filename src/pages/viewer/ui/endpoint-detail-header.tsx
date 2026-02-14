import { MethodBadge } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function EndpointDetailHeader() {
  const colors = useColors();

  return (
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
  );
}
