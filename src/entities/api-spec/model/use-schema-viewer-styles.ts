import type { SchemaObject } from './api-types';
import { hasChildrenCondition } from '../lib/has-children';
import { getTypeColor } from '../lib/type-color';
import { useColors, useIsDarkMode } from '@/shared/theme';

export function useSchemaContainerStyle({ depth }: { depth: number }) {
  const colors = useColors();

  return {
    marginLeft: depth > 0 ? '1.6rem' : 0,
    paddingLeft: depth > 0 ? '1.2rem' : 0,
    borderLeft: depth > 0 ? `1px solid ${colors.border.default}` : 'none',
    fontSize: '1.4rem',
    position: 'relative' as const,
  };
}

export function useSchemaNodeRowStyles({
  resolvedSchema,
  isHovered,
}: {
  resolvedSchema: SchemaObject | null;
  isHovered: boolean;
}) {
  const colors = useColors();
  const isDark = useIsDarkMode();

  const typeColor = getTypeColor(resolvedSchema?.type, isDark);
  const hasChildren = hasChildrenCondition(resolvedSchema);

  return {
    row: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.8rem',
      padding: '0.6rem 0.7rem',
      cursor: hasChildren ? 'pointer' : 'default',
      transition: 'background-color 0.2s',
      borderRadius: '0.4rem',
      backgroundColor: isHovered && hasChildren ? colors.bg.overlayHover : 'rgba(255, 255, 255, 0)',
    },
    chevron: {
      marginTop: '0.2rem',
      flexShrink: 0,
      color: colors.text.secondary,
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    header: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      alignItems: 'center',
      gap: '0.8rem',
      rowGap: '0.4rem',
    },
    name: {
      fontFamily: 'monospace',
      fontSize: '1.4rem',
      fontWeight: 500,
      color: colors.text.primary,
    },
    requiredMark: {
      color: colors.feedback.error,
      fontWeight: 700,
      marginLeft: '0.2rem',
    },
    typeBadge: {
      display: 'inline-block',
      padding: '0.1rem 0.6rem',
      borderRadius: '0.4rem',
      fontSize: '1.1rem',
      fontWeight: 500,
      fontFamily: 'monospace',
      backgroundColor: colors.border.subtle,
    },
    typeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem',
      fontSize: '1.2rem',
      fontFamily: 'monospace',
    },
    typeText: {
      color: typeColor,
    },
    refName: {
      color: '#6366f1', // indigo-500
    },
    validation: {
      fontSize: '1rem',
      color: colors.text.tertiary,
    },
    description: {
      marginTop: '0.4rem',
      fontSize: '1.2rem',
      color: colors.text.secondary,
      lineHeight: 1.5,
    },
    enumContainer: {
      marginTop: '0.6rem',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.6rem',
    },
    enumBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.8rem',
      borderRadius: '0.2rem',
      fontSize: '1rem',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(251, 191, 36, 0.1)', // amber-400 with opacity
      color: '#fbbf24', // amber-400
      border: '1px solid rgba(251, 191, 36, 0.2)',
    },
  };
}
