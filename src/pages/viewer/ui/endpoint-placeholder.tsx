import { Menu } from 'lucide-react';

import { useColors } from '@/shared/theme';

export function EndpointPlaceholder() {
  const colors = useColors();

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
      <h2
        style={{
          color: colors.text.primary,
          fontSize: '1.8rem',
          fontWeight: 600,
          marginBottom: '0.8rem',
        }}
      >
        Select an endpoint
      </h2>
      <p style={{ color: colors.text.tertiary, fontSize: '1.4rem', maxWidth: '30rem' }}>
        Choose an endpoint from the sidebar to view its documentation and test the API.
      </p>
    </div>
  );
}
