import { type SemanticColors } from '@/shared/theme';

export function getIconButtonStyle(colors: SemanticColors) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.4rem',
    height: '2.4rem',
    backgroundColor: colors.bg.overlay,
    border: `1px solid ${colors.border.default}`,
    borderRadius: '0.4rem',
    color: colors.text.primary,
    cursor: 'pointer',
  } as const;
}
