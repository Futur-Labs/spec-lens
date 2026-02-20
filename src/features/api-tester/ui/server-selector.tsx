import { useEffect } from 'react';

import type { ApiSpec } from '@/entities/api-spec';
import { testParamsStoreActions, useSelectedServer } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { FuturSelect } from '@/shared/ui/select';

const DEFAULT_SERVERS = [{ url: 'http://localhost:3000', description: 'Local' }];

export function ServerSelector({ spec }: { spec: ApiSpec }) {
  const colors = useColors();

  const selectedServer = useSelectedServer();

  const servers = spec.servers ?? DEFAULT_SERVERS;

  useEffect(() => {
    const serverList = spec.servers ?? DEFAULT_SERVERS;
    if (!selectedServer && serverList.length > 0) {
      testParamsStoreActions.setSelectedServer(serverList[0].url);
    }
  }, [spec.servers, selectedServer]);

  return (
    <div>
      <label
        style={{
          display: 'block',
          color: colors.text.secondary,
          fontSize: '1.2rem',
          fontWeight: 500,
          marginBottom: '0.6rem',
        }}
      >
        Target Server
      </label>
      <FuturSelect
        value={selectedServer}
        onChange={(val) => testParamsStoreActions.setSelectedServer(val)}
        options={servers.map((s) => ({
          label: `${s.url}${s.description ? ` (${s.description})` : ''}`,
          value: s.url,
        }))}
        placeholder='Select a server'
      />
    </div>
  );
}
