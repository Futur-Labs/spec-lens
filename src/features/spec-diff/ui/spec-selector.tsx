import type { SpecHistoryEntry } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { FuturSelect, type Option } from '@/shared/ui/select';

export function SpecSelector({
  entries,
  selectedId,
  onSelect,
  label,
  currentSpecLabel,
}: {
  entries: SpecHistoryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label: string;
  currentSpecLabel?: string;
}) {
  const colors = useColors();

  const options: Option<string>[] = [
    ...(currentSpecLabel ? [{ label: currentSpecLabel, value: '__current__' }] : []),
    ...entries.map((entry) => ({
      label: `${entry.title} v${entry.version} (${entry.endpointCount} endpoints) — ${new Date(entry.timestamp).toLocaleDateString()}`,
      value: entry.id,
    })),
  ];

  return (
    <div style={{ flex: 1 }}>
      <span
        style={{
          display: 'block',
          fontSize: '1.1rem',
          fontWeight: 500,
          color: colors.text.secondary,
          marginBottom: '0.4rem',
        }}
      >
        {label}
      </span>
      <FuturSelect<string>
        options={options}
        value={selectedId ?? ''}
        onChange={onSelect}
        placeholder='Select spec...'
      />
    </div>
  );
}
