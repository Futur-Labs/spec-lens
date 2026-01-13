export { getExecuteStatusColor } from './config/execute-status-color.ts';

export { executeRequest } from './lib/execute-request.ts';

export type {
  AuthType,
  AuthConfig,
  CustomCookie,
  SessionCookie,
  ResponseState,
  HistoryEntry,
  ApiTesterState,
  ApiTesterActions,
  ApiTesterStore,
} from './model/api-tester-types.ts';

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
  useHistory,
  // Cookie expiration utilities
  isCookieExpired,
  isCookieExpiringSoon,
  getCookieExpirationInfo,
} from './model/api-tester-store.ts';

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
