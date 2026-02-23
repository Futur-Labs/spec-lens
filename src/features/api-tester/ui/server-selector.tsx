import { useEffect } from 'react';

import { EnvironmentSelector } from './environment-selector';
import type { ApiSpec } from '@/entities/api-spec';
import { useActiveEnvironment } from '@/entities/environment';
import { testParamsStoreActions, useSelectedServer } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { FuturSelect } from '@/shared/ui/select';

const DEFAULT_SERVERS = [{ url: 'http://localhost:3000', description: 'Local' }];

export function ServerSelector({ spec }: { spec: ApiSpec }) {
  const colors = useColors();

  const selectedServer = useSelectedServer();
  const activeEnv = useActiveEnvironment();

  const servers = spec.servers ?? DEFAULT_SERVERS;

  // 환경의 baseUrl이 있으면 서버 자동 전환
  const effectiveBaseUrl = activeEnv?.baseUrl || null;

  useEffect(() => {
    const serverList = spec.servers ?? DEFAULT_SERVERS;
    if (effectiveBaseUrl) {
      testParamsStoreActions.setSelectedServer(effectiveBaseUrl);
    } else if (!selectedServer && serverList.length > 0) {
      testParamsStoreActions.setSelectedServer(serverList[0].url);
    }
  }, [spec.servers, selectedServer, effectiveBaseUrl]);

  // 환경 baseUrl을 서버 옵션에 포함
  const serverOptions = effectiveBaseUrl
    ? [
        { label: `${effectiveBaseUrl} (${activeEnv!.name})`, value: effectiveBaseUrl },
        ...servers
          .filter((s) => s.url !== effectiveBaseUrl)
          .map((s) => ({
            label: `${s.url}${s.description ? ` (${s.description})` : ''}`,
            value: s.url,
          })),
      ]
    : servers.map((s) => ({
        label: `${s.url}${s.description ? ` (${s.description})` : ''}`,
        value: s.url,
      }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label
          style={{
            color: colors.text.secondary,
            fontSize: '1.2rem',
            fontWeight: 500,
          }}
        >
          Target Server
        </label>
        <EnvironmentSelector />
      </div>
      <FuturSelect
        value={selectedServer}
        onChange={(val) => testParamsStoreActions.setSelectedServer(val)}
        options={serverOptions}
        placeholder='Select a server'
      />
    </div>
  );
}
