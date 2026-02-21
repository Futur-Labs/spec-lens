import {
  endpointFilterStoreActions,
  getMethodColor,
  useSelectedMethods,
} from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { HttpMethod } from '@/shared/type';

const DISPLAY_METHODS = [
  HttpMethod.GET,
  HttpMethod.POST,
  HttpMethod.PUT,
  HttpMethod.DELETE,
  HttpMethod.PATCH,
] as const;

export function MethodFilterChips() {
  const colors = useColors();
  const selectedMethods = useSelectedMethods();

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {DISPLAY_METHODS.map((method) => {
        const isSelected = selectedMethods.includes(method);
        const methodColor = getMethodColor(method);

        return (
          <button
            key={method}
            onClick={() => endpointFilterStoreActions.toggleMethod(method)}
            style={{
              padding: '0.3rem 0.7rem',
              borderRadius: '0.4rem',
              border: `1px solid ${isSelected ? methodColor : colors.border.subtle}`,
              backgroundColor: isSelected ? `${methodColor}20` : 'transparent',
              color: isSelected ? methodColor : colors.text.tertiary,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s',
              lineHeight: 1.2,
            }}
          >
            {method}
          </button>
        );
      })}
    </div>
  );
}
