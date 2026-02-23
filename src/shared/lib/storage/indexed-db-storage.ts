import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

import { ensureMigrated } from './migrate-to-indexed-db.ts';

// Zustand persist 미들웨어용 IndexedDB 스토리지 어댑터
// SSR 환경에서는 idb-keyval 접근을 차단하고, 클라이언트에서만 IndexedDB 사용
export const indexedDBStorage: StateStorage = {
  getItem: async (name) => {
    if (typeof window === 'undefined') return null;
    await ensureMigrated();
    return (await get(name)) ?? null;
  },
  setItem: async (name, value) => {
    if (typeof window === 'undefined') return;
    await set(name, value);
  },
  removeItem: async (name) => {
    if (typeof window === 'undefined') return;
    await del(name);
  },
};
