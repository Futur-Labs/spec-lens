import { BottomSheetProvider, FlexColumn, ThemeProvider } from '@jigoooo/shared-ui';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { preconnect, prefetchDNS } from 'react-dom';

import { RootDocument } from './root-document';
import { AlertProvider } from '@/app/providers';
import { theme } from '@/shared/theme';

const PRODUCTION_API_URL = `${import.meta.env.VITE_PRODUCTION_API_URL}:${import.meta.env.VITE_API_PORT}`;

export function RootComponent() {
  if (PRODUCTION_API_URL.startsWith('http') || PRODUCTION_API_URL.startsWith('https')) {
    preconnect(PRODUCTION_API_URL);
    prefetchDNS(PRODUCTION_API_URL);
  }

  return (
    <RootDocument>
      <BottomSheetProvider>
        <ThemeProvider theme={theme}>
          <AlertProvider />

          <FlexColumn
            style={{
              height: '100vh',
              maxHeight: '100vh',
              overflow: 'hidden',
              backgroundColor: '#0a0a0a',
            }}
          >
            <Outlet />
          </FlexColumn>
        </ThemeProvider>
      </BottomSheetProvider>
      <ReactQueryDevtools buttonPosition='bottom-left' />
      <TanStackRouterDevtools position='bottom-right' />
    </RootDocument>
  );
}
