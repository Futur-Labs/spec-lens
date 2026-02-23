import { useEffect, type ReactNode } from 'react';

import { useSpecStore } from '@/entities/api-spec';
import { testParamsStoreActions } from '@/entities/test-params';
import { migrateLocalStorageToIndexedDB } from '@/shared/lib';
import { initSystemThemeListener } from '@/shared/theme';

export function StoreSubscriptionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 기존 localStorage 데이터를 IndexedDB로 1회 마이그레이션
    migrateLocalStorageToIndexedDB();

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
