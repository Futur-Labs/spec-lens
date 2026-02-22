import type { SpecLoaderType } from '../model/spec-loader-types';
import { FileUploadZone, UrlInputForm } from '@/features/spec-import';
import { useColors } from '@/shared/theme';

export function SpecLoaderContent({ inputMode }: { inputMode: SpecLoaderType }) {
  const colors = useColors();

  return (
    <div
      style={{
        padding: '1.8rem',
        backgroundColor: colors.bg.overlay,
        borderRadius: '1.2rem',
        border: `1px solid ${colors.border.default}`,
      }}
    >
      {inputMode === 'file' ? <FileUploadZone /> : <UrlInputForm />}
    </div>
  );
}
