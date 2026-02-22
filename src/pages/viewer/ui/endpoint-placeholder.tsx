import { ExternalLink, Globe, Mail, Menu, Scale, Server, User } from 'lucide-react';

import { useSpec } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { FormattedText } from '@/shared/ui/formatted-text';

export function EndpointPlaceholder() {
  const colors = useColors();
  const spec = useSpec();

  if (!spec?.info?.description && !spec?.info?.contact && !spec?.info?.license && !spec?.servers?.length) {
    return <EmptyPlaceholder colors={colors} />;
  }

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '3.2rem',
      }}
    >
      <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
        {/* API Title + Version */}
        <div style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '0.8rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: colors.text.primary, margin: 0 }}>
              {spec.info.title}
            </h1>
            <span
              style={{
                padding: '0.2rem 0.8rem',
                borderRadius: '0.4rem',
                backgroundColor: `${colors.interactive.primary}18`,
                border: `1px solid ${colors.interactive.primary}30`,
                color: colors.interactive.primary,
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              v{spec.info.version}
            </span>
            <span
              style={{
                padding: '0.2rem 0.8rem',
                borderRadius: '0.4rem',
                backgroundColor: colors.bg.overlay,
                color: colors.text.tertiary,
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              OpenAPI {spec.openapi}
            </span>
          </div>

          {spec.info.termsOfService && (
            <a
              href={spec.info.termsOfService}
              target='_blank'
              rel='noopener noreferrer'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '1.2rem',
                color: colors.feedback.info,
              }}
            >
              Terms of Service <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Description */}
        {spec.info.description && (
          <div
            style={{
              marginBottom: '2.4rem',
              padding: '2rem',
              backgroundColor: colors.bg.overlay,
              borderRadius: '0.8rem',
              border: `1px solid ${colors.border.subtle}`,
              fontSize: '1.4rem',
              lineHeight: 1.7,
              color: colors.text.secondary,
            }}
          >
            <FormattedText text={spec.info.description} />
          </div>
        )}

        {/* Info Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))',
            gap: '1.6rem',
            marginBottom: '2.4rem',
          }}
        >
          {/* Contact */}
          {spec.info.contact && (spec.info.contact.name || spec.info.contact.email || spec.info.contact.url) && (
            <InfoCard colors={colors} icon={<User size={16} />} title='Contact'>
              {spec.info.contact.name && (
                <InfoRow icon={<User size={12} />} colors={colors}>
                  {spec.info.contact.name}
                </InfoRow>
              )}
              {spec.info.contact.email && (
                <InfoRow icon={<Mail size={12} />} colors={colors}>
                  <a
                    href={`mailto:${spec.info.contact.email}`}
                    style={{ color: colors.feedback.info, textDecoration: 'none' }}
                  >
                    {spec.info.contact.email}
                  </a>
                </InfoRow>
              )}
              {spec.info.contact.url && (
                <InfoRow icon={<Globe size={12} />} colors={colors}>
                  <a
                    href={spec.info.contact.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: colors.feedback.info, textDecoration: 'none' }}
                  >
                    {spec.info.contact.url}
                  </a>
                </InfoRow>
              )}
            </InfoCard>
          )}

          {/* License */}
          {spec.info.license && (
            <InfoCard colors={colors} icon={<Scale size={16} />} title='License'>
              <InfoRow icon={<Scale size={12} />} colors={colors}>
                {spec.info.license.url ? (
                  <a
                    href={spec.info.license.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: colors.feedback.info, textDecoration: 'none' }}
                  >
                    {spec.info.license.name}
                  </a>
                ) : (
                  spec.info.license.name
                )}
              </InfoRow>
            </InfoCard>
          )}

          {/* External Docs */}
          {spec.externalDocs && (
            <InfoCard colors={colors} icon={<ExternalLink size={16} />} title='External Documentation'>
              <InfoRow icon={<ExternalLink size={12} />} colors={colors}>
                <a
                  href={spec.externalDocs.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: colors.feedback.info, textDecoration: 'none' }}
                >
                  {spec.externalDocs.description || spec.externalDocs.url}
                </a>
              </InfoRow>
            </InfoCard>
          )}
        </div>

        {/* Servers */}
        {spec.servers && spec.servers.length > 0 && (
          <div>
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '1.2rem',
              }}
            >
              <Server size={16} />
              Servers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {spec.servers.map((server, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    padding: '1rem 1.6rem',
                    backgroundColor: colors.bg.overlay,
                    borderRadius: '0.6rem',
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <code
                    style={{
                      fontSize: '1.3rem',
                      fontFamily: 'monospace',
                      color: colors.feedback.info,
                      fontWeight: 500,
                    }}
                  >
                    {server.url}
                  </code>
                  {server.description && (
                    <span style={{ fontSize: '1.2rem', color: colors.text.tertiary }}>
                      — {server.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyPlaceholder({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '3.2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '6.4rem',
          height: '6.4rem',
          borderRadius: '50%',
          backgroundColor: colors.bg.overlay,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.6rem',
        }}
      >
        <Menu size={24} color={colors.text.tertiary} />
      </div>
      <h2 style={{ color: colors.text.primary, fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.8rem' }}>
        Select an endpoint
      </h2>
      <p style={{ color: colors.text.tertiary, fontSize: '1.4rem', maxWidth: '30rem' }}>
        Choose an endpoint from the sidebar to view its documentation and test the API.
      </p>
    </div>
  );
}

function InfoCard({
  colors,
  icon,
  title,
  children,
}: {
  colors: ReturnType<typeof useColors>;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: '1.6rem',
        backgroundColor: colors.bg.overlay,
        borderRadius: '0.8rem',
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <h4
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '1.3rem',
          fontWeight: 600,
          color: colors.text.primary,
          marginBottom: '1.2rem',
        }}
      >
        {icon}
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>{children}</div>
    </div>
  );
}

function InfoRow({
  icon,
  colors,
  children,
}: {
  icon: React.ReactNode;
  colors: ReturnType<typeof useColors>;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '1.3rem',
        color: colors.text.secondary,
      }}
    >
      <span style={{ color: colors.text.tertiary, flexShrink: 0 }}>{icon}</span>
      {children}
    </div>
  );
}
