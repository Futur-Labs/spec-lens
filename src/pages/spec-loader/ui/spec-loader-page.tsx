import { Navigate } from '@tanstack/react-router';
import { useState } from 'react';

import { SpecHistoryList } from './spec-history-list';
import { SpecInputModeTabs } from './spec-input-mode-tabs';
import { SpecLoaderContent } from './spec-loader-content';
import { SpecLoaderHeader } from './spec-loader-header';
import type { SpecLoaderType } from '../model/spec-loader-types';
import { useSpec, useSpecStoreHydration } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

export function SpecLoaderPage() {
  const colors = useColors();
  const hydrated = useSpecStoreHydration();
  const spec = useSpec();
  const [inputMode, setInputMode] = useState<SpecLoaderType>('file');

  if (hydrated && spec) {
    return <Navigate to='/api-docs' replace />;
  }

  if (!hydrated) {
    return null;
  }

  if (spec) {
    return null;
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100%',
        padding: '3.2rem',
        paddingTop: '12rem',
        backgroundColor: colors.bg.base,
      }}
    >
      <div style={{ position: 'absolute', top: '2.4rem', right: '2.4rem' }}>
        <ThemeToggle />
      </div>
      <div
        style={{
          width: '100%',
          maxWidth: '52rem',
        }}
      >
        <SpecLoaderHeader />

        <SpecInputModeTabs inputMode={inputMode} setInputMode={setInputMode} />

        <SpecLoaderContent inputMode={inputMode} />

        <SpecHistoryList />
      </div>
    </div>
  );
}
