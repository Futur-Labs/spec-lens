import { Navigate } from '@tanstack/react-router';
import { useState } from 'react';

import { SpecInputModeTabs } from './spec-input-mode-tabs';
import { SpecLoaderContent } from './spec-loader-content';
import { SpecLoaderHeader } from './spec-loader-header';
import type { SpecLoaderType } from '../model/spec-loader-types';
import { useSpec, useSpecStoreHydration } from '@/entities/openapi-spec';

export function SpecLoaderPage() {
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100%',
        padding: '3.2rem',
        paddingTop: '12rem',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '52rem',
        }}
      >
        <SpecLoaderHeader />

        <SpecInputModeTabs inputMode={inputMode} setInputMode={setInputMode} />

        <SpecLoaderContent inputMode={inputMode} />
      </div>
    </div>
  );
}
