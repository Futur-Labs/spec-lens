import { useState } from 'react';

import { useSpec, useSpecStoreHydration } from '@/entities/openapi-spec';
import { ViewerLayout } from '@/widgets/openapi-viewer';
import {
  SpecLoaderHeader,
  SpecInputModeTabs,
  SpecLoaderContent,
  type SpecLoaderType,
} from '@/widgets/spec-loader';

export function APIDocsPage() {
  const hydrated = useSpecStoreHydration();
  const spec = useSpec();
  const [inputMode, setInputMode] = useState<SpecLoaderType>('file');

  // Wait for hydration to complete before rendering
  if (!hydrated) {
    return null;
  }

  if (spec) {
    return <ViewerLayout />;
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

        {/* <SupportedFormatsInfo /> */}
      </div>
    </div>
  );
}
