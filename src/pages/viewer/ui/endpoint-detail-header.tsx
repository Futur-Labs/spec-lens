import { useState } from 'react';

import { Check, Copy, ExternalLink, Share2 } from 'lucide-react';

import { MethodBadge, type OperationObject } from '@/entities/api-spec';
import { copyToClipboard } from '@/shared/lib';
import { useColors } from '@/shared/theme';
import type { HttpMethod } from '@/shared/type';
import { FormattedText } from '@/shared/ui/formatted-text';

export function EndpointDetailHeader({
  method,
  path,
  operation,
}: {
  method: HttpMethod;
  path: string;
  operation: OperationObject;
}) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopyPath = () => {
    copyToClipboard(path, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const shareText = `${method.toUpperCase()} ${path}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // User cancelled or share failed — ignore
      }
    } else {
      copyToClipboard(shareText, () => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      });
    }
  };

  const actionButtonStyle = (isActive: boolean) =>
    ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.6rem',
      backgroundColor: isActive ? `${colors.feedback.success}15` : 'transparent',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: isActive ? colors.feedback.success : colors.border.subtle,
      borderRadius: '0.4rem',
      cursor: 'pointer',
      color: isActive ? colors.feedback.success : colors.text.tertiary,
      transition: 'all 0.2s ease',
      flexShrink: 0,
      marginTop: '0.2rem',
    }) as const;

  return (
    <div style={{ marginBottom: '2.4rem' }}>
      {operation.tags && operation.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            marginBottom: '2rem',
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

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.2rem',
          marginBottom: '2rem',
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
            flex: 1,
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
        <button
          onClick={handleCopyPath}
          title={copied ? 'Copied!' : 'Copy path'}
          style={actionButtonStyle(copied)}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button
          onClick={handleShare}
          title={shared ? 'Shared!' : 'Share'}
          style={actionButtonStyle(shared)}
        >
          {shared ? <Check size={14} /> : <Share2 size={14} />}
        </button>
      </div>

      {operation.summary && (
        <h2
          style={{
            color: colors.text.primary,
            fontSize: '1.8rem',
            fontWeight: 600,
            marginBottom: '1.2rem',
            lineHeight: 1.4,
          }}
        >
          {operation.summary}
        </h2>
      )}

      {operation.description && (
        <div
          style={{
            color: colors.text.secondary,
            fontSize: '1.5rem',
            lineHeight: 1.6,
          }}
        >
          <FormattedText text={operation.description} />
        </div>
      )}

      {operation.deprecated && (
        <div
          style={{
            marginTop: '1.2rem',
            padding: '0.8rem 1.2rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '0.6rem',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <span style={{ color: colors.feedback.error, fontSize: '1.3rem', fontWeight: 500 }}>
            Deprecated
          </span>
        </div>
      )}

      {operation.externalDocs && (
        <a
          href={operation.externalDocs.url}
          target='_blank'
          rel='noopener noreferrer'
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginTop: '1.2rem',
            fontSize: '1.3rem',
            color: colors.feedback.info,
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={13} />
          {operation.externalDocs.description || 'External Documentation'}
        </a>
      )}
    </div>
  );
}
