// Re-export all stores for backward compatibility

// Auth store
export {
  useAuthStore,
  authStoreActions,
  useAuthConfig,
  type AuthState,
  type AuthActions,
  type AuthStore,
} from './auth-store.ts';

// Cookie store
export {
  useCookieStore,
  cookieStoreActions,
  useCustomCookies,
  useSessionCookies,
  isCookieExpired,
  isCookieExpiringSoon,
  getCookieExpirationInfo,
  type CookieState,
  type CookieActions,
  type CookieStore,
} from './cookie-store.ts';

// History store
export { useHistoryStore, historyStoreActions, useHistory } from './history-store.ts';
export type { HistoryState, HistoryActions, HistoryStore } from './history-store.ts';

// Variable store
export {
  useVariableStore,
  variableStoreActions,
  useVariables,
  type VariableState,
  type VariableActions,
  type VariableStore,
} from './variable-store.ts';

// Test params store
export {
  useTestParamsStore,
  testParamsStoreActions,
  useSelectedServer,
  usePathParams,
  useQueryParams,
  useHeaders,
  useRequestBody,
  useResponse,
  useIsExecuting,
  useExecuteError,
  type TestParamsState,
  type TestParamsActions,
  type TestParamsStore,
} from './test-params-store.ts';

// ========== Backward Compatibility ==========

import { authStoreActions } from './auth-store.ts';
import { cookieStoreActions } from './cookie-store.ts';
import { historyStoreActions } from './history-store.ts';
import { testParamsStoreActions } from './test-params-store.ts';
import { variableStoreActions } from './variable-store.ts';

// Combined actions object for existing code that uses apiTesterStoreActions
export const apiTesterStoreActions = {
  ...authStoreActions,
  ...cookieStoreActions,
  ...historyStoreActions,
  ...variableStoreActions,
  ...testParamsStoreActions,
};

// Legacy aliases
export const authCookieStoreActions = {
  ...authStoreActions,
  ...cookieStoreActions,
};
