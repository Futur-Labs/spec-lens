import { useEffect, type ReactNode } from 'react';

import { useSpecStore } from '@/entities/openapi-spec';
import { testParamsStoreActions } from '@/entities/test-params';

export function StoreSubscriptionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Subscribe to spec source changes and clear test params when source changes
    const unsubscribe = useSpecStore.subscribe(
      (state) => state.specSource?.name,
      (newSourceId, prevSourceId) => {
        if (prevSourceId && newSourceId !== prevSourceId) {
          testParamsStoreActions.clearAllParams(prevSourceId);
        }
      },
    );

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
