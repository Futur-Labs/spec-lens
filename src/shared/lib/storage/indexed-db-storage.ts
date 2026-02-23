import { del, get, set } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

// Zustand persist 미들웨어용 IndexedDB 스토리지 어댑터
// localStorage 대비 수백 MB 이상 저장 가능
export const indexedDBStorage: StateStorage = {
  getItem: async (name) => (await get(name)) ?? null,
  setItem: async (name, value) => await set(name, value),
  removeItem: async (name) => await del(name),
};
