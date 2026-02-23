import { useColors } from '@/shared/theme';

export function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  const colors = useColors();

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '1rem 1rem',
        backgroundColor: active ? colors.bg.overlayHover : 'transparent',
        border: 'none',
        borderRadius: '0.4rem',
        color: active ? colors.text.primary : colors.text.secondary,
        fontSize: '1.2rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          style={{
            padding: '0.1rem 0.5rem',
            backgroundColor: `${colors.feedback.warning}40`,
            borderRadius: '1rem',
            fontSize: '1rem',
            color: colors.feedback.warning,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
