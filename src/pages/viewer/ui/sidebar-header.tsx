import { FlexRow } from '@jigoooo/shared-ui';
import { type ReactNode, useState } from 'react';

import { ChevronDown, ChevronUp, ChevronsDownUp, ChevronsUpDown, Search, X } from 'lucide-react';

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

export function SidebarHeader({ activeTab = 'endpoints' }: { activeTab?: 'endpoints' | 'models' }) {
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
      </div>

      {/* Filters Toggle - Endpoints only */}
      {activeTab === 'endpoints' && (
        <>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minHeight: '2.8rem' }}
          >
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
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: '0.4rem',
                cursor: 'pointer',
                color: colors.text.secondary,
              }}
            >
              {isAllExpanded ? <ChevronsDownUp size={12} /> : <ChevronsUpDown size={12} />}
            </button>
            <button
              onClick={() => setFiltersOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.8rem',
                backgroundColor: 'transparent',
                border: `1px solid ${activeFilterCount > 0 ? colors.feedback.info : colors.border.subtle}`,
                borderRadius: '0.4rem',
                cursor: 'pointer',
                color: activeFilterCount > 0 ? colors.feedback.info : colors.text.secondary,
                fontSize: '1.1rem',
                fontWeight: 500,
              }}
            >
              {filtersOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Filters
              {activeFilterCount > 0 && (
                <span
                  style={{
                    padding: '0.1rem 0.5rem',
                    backgroundColor: `${colors.feedback.info}20`,
                    borderRadius: '1rem',
                    fontSize: '1rem',
                    color: colors.feedback.info,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={endpointFilterStoreActions.clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.5rem 0.8rem',
                  backgroundColor: 'transparent',
                  border: `1px solid rgba(239, 68, 68, 0.3)`,
                  borderRadius: '0.4rem',
                  cursor: 'pointer',
                  color: colors.feedback.error,
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          {filtersOpen && (
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
            </div>
          )}
        </>
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
