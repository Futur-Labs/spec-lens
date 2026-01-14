export { getExecuteStatusColor } from './config/execute-status-color.ts';

export { executeApiTestRequest } from './lib/execute-api-test-request.ts';

export type {
  AuthType,
  AuthConfig,
  CustomCookie,
  SessionCookie,
  Variable,
  ResponseState,
  ApiTesterState,
  ApiTesterActions,
  ApiTesterStore,
} from './model/api-tester-types.ts';
export type { HistoryEntry } from './model/api-request-history-types.ts';

export { DEFAULT_AUTH_CONFIG } from './model/api-tester-types.ts';

export {
  // Combined actions for backward compatibility
  apiTesterStoreActions,
  // Auth & Cookie store
  useAuthCookieStore,
  authCookieStoreActions,
  useAuthConfig,
  useCustomCookies,
  useSessionCookies,
  useVariables,
  isCookieExpired,
  isCookieExpiringSoon,
  getCookieExpirationInfo,
} from './model/api-tester-store.ts';
export { useHistory } from './model/history-store.ts';

export {
  // Test params store
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
} from './model/test-params-store.ts';
