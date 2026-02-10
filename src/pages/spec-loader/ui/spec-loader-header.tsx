import { FileJson } from 'lucide-react';

export function SpecLoaderHeader() {
  return (
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
  );
}
