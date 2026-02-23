import { Minus, Pencil, Plus } from 'lucide-react';

export function DiffSummaryBadge({
  count,
  type,
}: {
  count: number;
  type: 'added' | 'removed' | 'modified';
}) {
  const colorMap = {
    added: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    removed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
    modified: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  };

  const iconMap = {
    added: <Plus size={11} />,
    removed: <Minus size={11} />,
    modified: <Pencil size={11} />,
  };

  if (count === 0) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.2rem 0.6rem',
        backgroundColor: colorMap[type].bg,
        color: colorMap[type].text,
        borderRadius: '0.3rem',
        fontSize: '1.1rem',
        fontWeight: 500,
      }}
    >
      {iconMap[type]}
      {count}
    </span>
  );
}
