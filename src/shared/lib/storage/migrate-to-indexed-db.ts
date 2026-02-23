import { get, set } from 'idb-keyval';

// Zustand persist 스토어 키 (IndexedDB로 전환 대상)
const ZUSTAND_MIGRATION_KEYS = ['openapi-spec-store', 'spec-history-storage', 'api-tester-history'];

const MIGRATION_FLAG = 'idb-migration-v1';

// 기존 localStorage 데이터를 IndexedDB로 1회 마이그레이션
export async function migrateLocalStorageToIndexedDB() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  // Zustand persist 스토어 마이그레이션
  for (const key of ZUSTAND_MIGRATION_KEYS) {
    const data = localStorage.getItem(key);
    if (data && !(await get(key))) {
      await set(key, data);
      localStorage.removeItem(key);
    }
  }

  // test-params 스토어 마이그레이션 (동적 키: api-tester-params-v{N}-{specId})
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('api-tester-params-')) {
      const data = localStorage.getItem(key);
      if (data && !(await get(key))) {
        await set(key, data);
        keysToRemove.push(key);
      }
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }

  localStorage.setItem(MIGRATION_FLAG, '1');
}
