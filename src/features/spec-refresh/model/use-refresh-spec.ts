import {
  specStoreActions,
  useIsSpecRefreshing,
  useSpecStore,
  validateOpenAPISpec,
  type ApiSpec,
} from '@/entities/api-spec';
import { checkSpecUpdate } from '@/shared/server';

const MIN_SPIN_DURATION = 800;

export function useRefreshSpec() {
  const isRefreshing = useIsSpecRefreshing();
  const specSource = useSpecStore((s) => s.specSource);

  const handleRefreshSpec = async () => {
    if (!specSource || specSource.type !== 'url') return;
    if (isRefreshing) return;

    specStoreActions.setRefreshing(true);
    specStoreActions.setRefreshError(null);

    const startTime = Date.now();

    try {
      const result = await checkSpecUpdate({
        data: {
          url: specSource.name,
          etag: specSource.etag || undefined,
          lastModified: specSource.lastModified || undefined,
        },
      });

      if (result.hasUpdate && result.data) {
        const validation = validateOpenAPISpec(result.data);

        if (!validation.valid) {
          throw new Error(validation.error);
        }

        specStoreActions.setSpec(result.data as ApiSpec, {
          type: 'url',
          name: specSource.name,
          etag: result.newEtag,
          lastModified: result.newLastModified,
        });
      } else {
        specStoreActions.updateSpecSource({
          etag: result.newEtag || specSource.etag,
          lastModified: result.newLastModified || specSource.lastModified,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh spec';

      specStoreActions.setRefreshError(message);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_SPIN_DURATION - elapsed);

      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }

      specStoreActions.setRefreshing(false);
    }
  };

  return {
    handleRefreshSpec,
  };
}
