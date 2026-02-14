import { useEffect, type ReactNode } from 'react';

import { useSpecStore } from '@/entities/api-spec';
import { testParamsStoreActions } from '@/entities/test-params';
import { initSystemThemeListener } from '@/shared/theme';

export function StoreSubscriptionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const unsubscribeSpec = useSpecStore.subscribe(
      (state) => state.specSource?.name,
      (newSourceId, prevSourceId) => {
        if (prevSourceId && newSourceId !== prevSourceId) {
          testParamsStoreActions.clearAllParams(prevSourceId);
        }
      },
    );

    const cleanupThemeListener = initSystemThemeListener();

    return () => {
      unsubscribeSpec();
      cleanupThemeListener();
    };
  }, []);

  return <>{children}</>;
}
