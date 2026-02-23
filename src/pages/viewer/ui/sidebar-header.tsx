import { FlexRow } from '@jigoooo/shared-ui';
import { type ReactNode, useState } from 'react';

import { ChevronsUpDown, Filter, Search, X } from 'lucide-react';

import {
  endpointFilterStoreActions,
  getAllTags,
  useSearchQuery,
  useSelectedMethods,
  useSelectedTags,
  useSpecStore,
} from '@/entities/api-spec';
import { sidebarStoreActions, useExpandedTags } from '@/entities/sidebar';
import { MethodFilterChips, TagFilterChips } from '@/features/endpoint-filter';
import { useColors } from '@/shared/theme';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

export function SidebarHeader({
  activeTab = 'endpoints',
}: {
  activeTab?: 'endpoints' | 'models' | 'webhooks';
}) {
  const colors = useColors();
  const spec = useSpecStore((s) => s.spec);
  const searchQuery = useSearchQuery();
  const selectedMethods = useSelectedMethods();
  const selectedTags = useSelectedTags();
  const expandedTags = useExpandedTags();
  const [filtersOpen, setFiltersOpen] = useState(false);

  if (!spec) return null;

  const activeFilterCount = selectedMethods.length + selectedTags.length;
  const allTags = getAllTags(spec);
  const isAllExpanded = allTags.length > 0 && allTags.every((tag) => expandedTags.includes(tag));
  const isEndpoints = activeTab === 'endpoints';

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

      {/* Search + inline action icons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1.2rem',
          backgroundColor: colors.bg.input,
          borderRadius: '0.6rem',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: colors.border.default,
        }}
      >
        <Search size={'1.4rem'} color={colors.text.tertiary} />
        <input
          type='text'
          value={searchQuery}
          onChange={(e) => endpointFilterStoreActions.setSearchQuery(e.target.value)}
          placeholder={activeTab === 'models' ? 'Search models...' : 'Search endpoints...'}
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

        {/* Action icons — always rendered for stable layout, hidden on models tab */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            visibility: isEndpoints ? 'visible' : 'hidden',
            pointerEvents: isEndpoints ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              width: '1px',
              height: '1.6rem',
              backgroundColor: colors.border.subtle,
              flexShrink: 0,
            }}
          />
          <button
            onClick={() =>
              isAllExpanded
                ? sidebarStoreActions.collapseAllTags()
                : sidebarStoreActions.expandAllTags(allTags)
            }
            title={isAllExpanded ? 'Collapse all' : 'Expand all'}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isAllExpanded ? colors.feedback.info : colors.text.tertiary,
              flexShrink: 0,
            }}
          >
            <ChevronsUpDown size={14} />
          </button>
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            title='Filters'
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '0.2rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color:
                filtersOpen || activeFilterCount > 0 ? colors.feedback.info : colors.text.tertiary,
              flexShrink: 0,
            }}
          >
            <Filter size={14} />
            {activeFilterCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-0.3rem',
                  right: '-0.4rem',
                  minWidth: '1.4rem',
                  height: '1.4rem',
                  padding: '0 0.3rem',
                  backgroundColor: colors.feedback.info,
                  borderRadius: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter panels - Endpoints only */}
      {isEndpoints && filtersOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FilterSection
            label='Method'
            count={selectedMethods.length}
            onClear={endpointFilterStoreActions.clearMethods}
          >
            <MethodFilterChips />
          </FilterSection>
          <FilterSection
            label='Tag'
            count={selectedTags.length}
            onClear={endpointFilterStoreActions.clearTags}
          >
            <TagFilterChips />
          </FilterSection>
          {activeFilterCount > 0 && (
            <button
              onClick={endpointFilterStoreActions.clearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                gap: '0.3rem',
                padding: '0.4rem 0.8rem',
                backgroundColor: 'transparent',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                borderRadius: '0.4rem',
                cursor: 'pointer',
                color: colors.feedback.error,
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              <X size={12} />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterSection({
  label,
  count,
  onClear,
  children,
}: {
  label: string;
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  const colors = useColors();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '1rem', color: colors.text.tertiary, fontWeight: 500 }}>
          {label}
        </span>
        {count > 0 && (
          <button
            onClick={onClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.1rem 0.4rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: colors.text.tertiary,
              fontSize: '1rem',
            }}
          >
            <X size={10} />
            {count}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
