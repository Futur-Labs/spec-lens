import { Search, X } from 'lucide-react';

import { endpointFilterStoreActions, useSearchQuery } from '@/entities/endpoint-filter';
import { useSpecStore } from '@/entities/openapi-spec';

export function SidebarHeader() {
  const spec = useSpecStore((s) => s.spec);
  const searchQuery = useSearchQuery();

  if (!spec) return null;

  return (
    <div
      style={{
        padding: '1.6rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={{ marginBottom: '1.2rem' }}>
        <h2
          style={{
            color: '#e5e5e5',
            fontSize: '1.4rem',
            fontWeight: 600,
            marginBottom: '0.4rem',
          }}
        >
          {spec.info.title}
        </h2>
        <span style={{ color: '#6b7280', fontSize: '1.2rem' }}>
          v{spec.info.version} • OpenAPI {spec.openapi}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          padding: '0.8rem 1.2rem',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '0.6rem',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Search size={14} color='#6b7280' />
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
            color: '#e5e5e5',
            fontSize: '1.3rem',
          }}
        />
        {searchQuery && (
          <button
            onClick={endpointFilterStoreActions.clearFilters}
            style={{
              padding: '0.2rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} color='#6b7280' />
          </button>
        )}
      </div>
    </div>
  );
}
