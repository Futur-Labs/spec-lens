import { endpointFilterStoreActions, useSelectedTags, useSpecStore } from '@/entities/api-spec';
import { useColors } from '@/shared/theme';

export function TagFilterChips() {
  const colors = useColors();
  const tags = useSpecStore((s) => s.tags);
  const selectedTags = useSelectedTags();

  if (tags.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);

        return (
          <button
            key={tag}
            onClick={() => endpointFilterStoreActions.toggleTag(tag)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '0.4rem',
              border: `1px solid ${isSelected ? colors.feedback.info : colors.border.subtle}`,
              backgroundColor: isSelected ? `${colors.feedback.info}20` : 'transparent',
              color: isSelected ? colors.feedback.info : colors.text.tertiary,
              fontSize: '1.1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              lineHeight: 1.2,
            }}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
