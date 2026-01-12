import { useState } from 'react';

import { FileJson } from 'lucide-react';

import { useSpec, useOpenAPIStore } from '@/entities/openapi';
import { FileUploadZone, UrlInputForm } from '@/features/openapi-loader';
import { ViewerLayout } from '@/widgets/openapi-viewer';

export function APIDocsPage() {
  const spec = useSpec();
  const { clearSpec } = useOpenAPIStore();
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');

  // If spec is loaded, show the viewer
  if (spec) {
    return <ViewerLayout onReset={clearSpec} />;
  }

  // Otherwise, show the upload/input UI
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        padding: '3.2rem',
        backgroundColor: '#0a0a0a',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.2rem',
              marginBottom: '1.2rem',
            }}
          >
            <FileJson size={32} color='#075D46' />
            <h1
              style={{
                color: '#e5e5e5',
                fontSize: '2.8rem',
                fontWeight: 700,
                margin: 0,
              }}
            >
              SpecLens
            </h1>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '1.5rem' }}>
            OpenAPI/Swagger 스펙을 시각화하고 API를 테스트하세요
          </p>
        </div>

        {/* Mode Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            marginBottom: '2.4rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '0.8rem',
            padding: '0.4rem',
          }}
        >
          <button
            onClick={() => setInputMode('file')}
            style={{
              flex: 1,
              padding: '1rem 1.6rem',
              backgroundColor: inputMode === 'file' ? '#075D46' : 'transparent',
              border: 'none',
              borderRadius: '0.6rem',
              color: inputMode === 'file' ? '#fff' : '#9ca3af',
              fontSize: '1.4rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            파일 업로드
          </button>
          <button
            onClick={() => setInputMode('url')}
            style={{
              flex: 1,
              padding: '1rem 1.6rem',
              backgroundColor: inputMode === 'url' ? '#075D46' : 'transparent',
              border: 'none',
              borderRadius: '0.6rem',
              color: inputMode === 'url' ? '#fff' : '#9ca3af',
              fontSize: '1.4rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            URL 입력
          </button>
        </div>

        {/* Input Content */}
        <div
          style={{
            padding: '2.4rem',
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: '1.2rem',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {inputMode === 'file' ? <FileUploadZone /> : <UrlInputForm />}
        </div>

        {/* Info */}
        <div
          style={{
            marginTop: '2.4rem',
            padding: '1.6rem',
            backgroundColor: 'rgba(7, 93, 70, 0.1)',
            borderRadius: '0.8rem',
            border: '1px solid rgba(7, 93, 70, 0.2)',
          }}
        >
          <h3
            style={{
              color: '#10b981',
              fontSize: '1.3rem',
              fontWeight: 600,
              marginBottom: '0.8rem',
            }}
          >
            지원 포맷
          </h3>
          <ul
            style={{
              color: '#9ca3af',
              fontSize: '1.3rem',
              lineHeight: 1.6,
              margin: 0,
              paddingLeft: '2rem',
            }}
          >
            <li>OpenAPI 3.0.x JSON 파일</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
