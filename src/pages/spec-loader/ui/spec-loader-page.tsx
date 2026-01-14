import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { useSpec, useSpecStoreHydration } from '@/entities/openapi-spec';
import {
  SpecLoaderHeader,
  SpecInputModeTabs,
  SpecLoaderContent,
  type SpecLoaderType,
} from '@/widgets/spec-loader';

export function SpecLoaderPage() {
  const navigate = useNavigate();
  const hydrated = useSpecStoreHydration();
  const spec = useSpec();
  const [inputMode, setInputMode] = useState<SpecLoaderType>('file');

  // Redirect to /api-docs when spec is loaded
  useEffect(() => {
    if (hydrated && spec) {
      navigate({ to: '/api-docs', replace: true });
    }
  }, [hydrated, spec, navigate]);

  // Wait for hydration to complete before rendering
  if (!hydrated) {
    return null;
  }

  // If spec exists, show nothing while redirecting
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
