import type { SemanticColors } from '@/shared/theme';

export function getInputStyle(colors: SemanticColors) {
  return {
    flex: 1,
    width: '100%',
    padding: '0.8rem 1.2rem',
    backgroundColor: '#ffffff',
    border: `1px solid ${colors.border.default}`,
    borderRadius: '0.6rem',
    color: colors.text.primary,
    fontSize: '1.3rem',
    outline: 'none',
  } as const;
}

export const INPUT_CLASS_NAME = 'placeholder-md';
