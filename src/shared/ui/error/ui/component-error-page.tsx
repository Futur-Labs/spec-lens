import { FlexColumn, SolidButton, Typography } from '@jigoooo/shared-ui';

import type { ComponentErrorPageProps } from '../model/error-type.ts';

export function ComponentErrorPage({ error, resetErrorBoundary }: ComponentErrorPageProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <FlexColumn
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        backgroundColor: '#fcfcfc',
        gap: '2.4rem',
      }}
    >
      <Typography style={{ fontSize: '3.2rem', fontWeight: 600 }}>Component Error</Typography>
      <FlexColumn style={{ alignItems: 'center', justifyContent: 'center', maxWidth: '80vw' }}>
        <Typography
          style={{
            fontSize: '2.24rem',
            fontWeight: 500,
            color: '#888888',
          }}
        >
          {errorMessage}
        </Typography>
      </FlexColumn>
      <SolidButton onClick={resetErrorBoundary}>새로고침</SolidButton>
    </FlexColumn>
  );
}
