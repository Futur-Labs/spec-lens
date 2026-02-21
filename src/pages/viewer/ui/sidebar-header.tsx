import { FlexRow } from '@jigoooo/shared-ui';

import { Search, X } from 'lucide-react';

import { endpointFilterStoreActions, useSearchQuery, useSpecStore } from '@/entities/api-spec';
import { MethodFilterChips, TagFilterChips } from '@/features/endpoint-filter';
import { useColors } from '@/shared/theme';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

export function SidebarHeader() {
  const colors = useColors();
  const spec = useSpecStore((s) => s.spec);
  const searchQuery = useSearchQuery();
  if (!spec) return null;

  return (
    <div
      style={{
        padding: '1.6rem',
        borderBottom: `1px solid ${colors.border.subtle}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <FlexRow style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2
            style={{
              color: colors.text.primary,
              fontSize: '1.4rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
            }}
          >
            {spec.info.title}
          </h2>
          <span style={{ color: colors.text.tertiary, fontSize: '1.2rem' }}>
            v{spec.info.version} • OpenAPI {spec.openapi}
          </span>
        </div>

        <ThemeToggle />
      </FlexRow>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1.2rem',
          backgroundColor: colors.bg.input,
          borderRadius: '0.6rem',
          border: `1px solid ${colors.border.default}`,
        }}
      >
        <Search size={'1.4rem'} color={colors.text.tertiary} />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => endpointFilterStoreActions.setSearchQuery(e.target.value)}
          placeholder='Search endpoints...'
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: colors.text.primary,
            fontSize: '1.3rem',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => endpointFilterStoreActions.setSearchQuery('')}
            style={{
              paddingInline: '0.2rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={'1.4rem'} color={colors.text.tertiary} />
          </button>
        )}
      </div>

      {/* Method Filter */}
      <MethodFilterChips />

      {/* Tag Filter */}
      <TagFilterChips />
    </div>
  );
}
