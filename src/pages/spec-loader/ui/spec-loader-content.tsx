import type { SpecLoaderType } from '../model/spec-loader-types';
import { FileUploadZone, UrlInputForm } from '@/features/openapi-loader';

export function SpecLoaderContent({ inputMode }: { inputMode: SpecLoaderType }) {
  return (
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
  );
}
