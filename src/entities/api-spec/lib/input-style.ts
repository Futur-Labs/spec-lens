import type { SemanticColors } from '@/shared/theme';

export function getParameterInputStyle(colors: SemanticColors) {
  return {
    flex: 1,
    width: '100%',
    padding: '0.8rem 1.2rem',
    backgroundColor: colors.bg.input,
    border: `1px solid ${colors.border.default}`,
    borderRadius: '0.6rem',
    color: colors.text.primary,
    fontSize: '1.3rem',
    outline: 'none',
  } as const;
}

export function getAutoCompleteStyle(colors: SemanticColors) {
  return {
    ...getParameterInputStyle(colors),
    padding: 0,
    border: 'none',
    backgroundColor: colors.bg.autoComplete,
  } as const;
}

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
