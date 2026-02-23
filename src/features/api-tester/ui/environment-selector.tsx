import { Globe } from 'lucide-react';

import {
  environmentStoreActions,
  useActiveEnvironmentId,
  useEnvironments,
} from '@/entities/environment';
import { useColors } from '@/shared/theme';

export function EnvironmentSelector() {
  const colors = useColors();
  const environments = useEnvironments();
  const activeEnvId = useActiveEnvironmentId();

  if (environments.length === 0) return null;

  const activeEnv = environments.find((e) => e.id === activeEnvId);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <Globe size={14} color={colors.text.tertiary} />
      <select
        value={activeEnvId ?? ''}
        onChange={(e) => environmentStoreActions.setActiveEnvironment(e.target.value || null)}
        style={{
          padding: '0.5rem 0.8rem',
          backgroundColor: activeEnv ? `${activeEnv.color}18` : colors.bg.overlay,
          border: `1px solid ${activeEnv ? `${activeEnv.color}40` : colors.border.subtle}`,
          borderRadius: '0.4rem',
          color: activeEnv ? activeEnv.color : colors.text.secondary,
          fontSize: '1.1rem',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value=''>No Environment</option>
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.name}
          </option>
        ))}
      </select>
    </div>
  );
}
