import { get, set } from 'idb-keyval';

// Zustand persist 스토어 키 (IndexedDB로 전환 대상)
const ZUSTAND_MIGRATION_KEYS = ['openapi-spec-store', 'spec-history-storage', 'api-tester-history'];

const MIGRATION_FLAG = 'idb-migration-v1';

// 싱글턴 프로미스: 마이그레이션이 1회만 실행되도록 보장
let migrationPromise: Promise<void> | null = null;

// IndexedDB 읽기 전 마이그레이션 완료를 보장하는 함수
// indexed-db-storage.ts의 getItem에서 호출
export function ensureMigrated(): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = doMigration();
  }
  return migrationPromise;
}

// 기존 localStorage 데이터를 IndexedDB로 1회 마이그레이션
async function doMigration() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATION_FLAG)) return;

  // Zustand persist 스토어 병렬 마이그레이션
  const zustandMigrations = ZUSTAND_MIGRATION_KEYS.map(async (key) => {
    const data = localStorage.getItem(key);
    if (data && !(await get(key))) {
      await set(key, data);
      localStorage.removeItem(key);
    }
  });

  // test-params 스토어 마이그레이션 (동적 키: api-tester-params-v{N}-{specId})
  const testParamsKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('api-tester-params-')) {
      testParamsKeys.push(key);
    }
  }

  const testParamsMigrations = testParamsKeys.map(async (key) => {
    const data = localStorage.getItem(key);
    if (data && !(await get(key))) {
      await set(key, data);
    }
  });

  await Promise.all([...zustandMigrations, ...testParamsMigrations]);

  // 마이그레이션 완료 후 test-params localStorage 정리
  for (const key of testParamsKeys) {
    localStorage.removeItem(key);
  }

  localStorage.setItem(MIGRATION_FLAG, '1');
}
