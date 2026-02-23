import { useEffect, useEffectEvent } from 'react';

import type { ApiSpec } from '@/entities/api-spec';
import { useActiveEnvironmentIds, useEnvironments } from '@/entities/environment';
import { testParamsStoreActions, useSelectedServer } from '@/entities/test-params';
import { useColors } from '@/shared/theme';
import { FuturSelect } from '@/shared/ui/select';

const DEFAULT_SERVERS = [{ url: 'http://localhost:3000', description: 'Local' }];

export function ServerSelector({ spec }: { spec: ApiSpec }) {
  const colors = useColors();

  const selectedServer = useSelectedServer();
  const environments = useEnvironments();
  const activeEnvIds = useActiveEnvironmentIds();

  const servers = spec.servers ?? DEFAULT_SERVERS;

  // 비반응적 값 참조용 이벤트 핸들러
  const onInitServer = useEffectEvent(() => {
    if (!selectedServer && servers.length > 0) {
      testParamsStoreActions.setSelectedServer(servers[0].url);
    }
  });

  // 초기 서버 설정
  useEffect(() => {
    onInitServer();
  }, [spec.servers]);

  // 서버 옵션: spec 서버 + 활성화된 환경 baseUrl
  const specServerOptions = servers.map((s) => ({
    label: `${s.url}${s.description ? ` (${s.description})` : ''}`,
    value: s.url,
  }));

  const envServerOptions = environments
    .filter(
      (e) => e.baseUrl && activeEnvIds.includes(e.id) && !servers.some((s) => s.url === e.baseUrl),
    )
    .map((e) => ({
      label: `${e.baseUrl} (${e.name})`,
      value: e.baseUrl,
    }));

  const serverOptions = [...envServerOptions, ...specServerOptions];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <label
        style={{
          color: colors.text.secondary,
          fontSize: '1.2rem',
          fontWeight: 500,
        }}
      >
        Target Server
      </label>
      <FuturSelect
        value={selectedServer}
        onChange={(url) => testParamsStoreActions.setSelectedServer(url)}
        options={serverOptions}
        placeholder='Select a server'
      />
    </div>
  );
}
