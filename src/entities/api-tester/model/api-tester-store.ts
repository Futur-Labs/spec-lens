import { create } from 'zustand';

import {
  type AuthConfig,
  type CustomCookie,
  type SessionCookie,
  type Variable,
  DEFAULT_AUTH_CONFIG,
} from './api-tester-types.ts';
import { historyStoreActions } from './history-store.ts';
import { testParamsStoreActions } from './test-params-store.ts';

// Re-export test params store for backward compatibility
export {
  testParamsStoreActions,
  useSelectedServer,
  usePathParams,
  useQueryParams,
  useHeaders,
  useRequestBody,
  useResponse,
  useIsExecuting,
  useExecuteError,
} from './test-params-store.ts';

// Re-export history store
export { historyStoreActions } from './history-store.ts';

// ========== Cookie Utility Functions ==========

// Check if a cookie is expired based on its expires field
export function isCookieExpired(cookie: SessionCookie): boolean {
  if (!cookie.expires) return false;
  const expiresDate = new Date(cookie.expires);
  return expiresDate.getTime() < Date.now();
}

// Check if a cookie will expire soon (within specified minutes, default 5 minutes)
export function isCookieExpiringSoon(cookie: SessionCookie, withinMinutes = 5): boolean {
  if (!cookie.expires) return false;
  const expiresDate = new Date(cookie.expires);
  const warningThreshold = Date.now() + withinMinutes * 60 * 1000;
  return expiresDate.getTime() < warningThreshold && expiresDate.getTime() > Date.now();
}

// Get time until cookie expires in a human-readable format
export function getCookieExpirationInfo(cookie: SessionCookie): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  expiresIn: string | null;
} {
  if (!cookie.expires) {
    return { isExpired: false, isExpiringSoon: false, expiresIn: null };
  }

  const expiresDate = new Date(cookie.expires);
  const now = Date.now();
  const diff = expiresDate.getTime() - now;

  if (diff <= 0) {
    return { isExpired: true, isExpiringSoon: false, expiresIn: 'Expired' };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  let expiresIn: string;
  if (days > 0) {
    expiresIn = `${days}d`;
  } else if (hours > 0) {
    expiresIn = `${hours}h`;
  } else {
    expiresIn = `${minutes}m`;
  }

  return {
    isExpired: false,
    isExpiringSoon: minutes < 5,
    expiresIn,
  };
}

// Filter out expired cookies from an array
function filterExpiredCookies(cookies: SessionCookie[]): SessionCookie[] {
  return cookies.filter((cookie) => !isCookieExpired(cookie));
}

// ========== Auth & Cookie localStorage Functions ==========

function loadPersistedAuthConfig(): AuthConfig {
  if (typeof window === 'undefined') return DEFAULT_AUTH_CONFIG;

  try {
    const stored = localStorage.getItem('api-tester-auth');
    if (stored) {
      const parsed = JSON.parse(stored) as AuthConfig;
      if (parsed.persistSession) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_AUTH_CONFIG;
}

function saveAuthConfig(config: AuthConfig): void {
  if (typeof window === 'undefined') return;

  if (config.persistSession) {
    localStorage.setItem('api-tester-auth', JSON.stringify(config));
  } else {
    localStorage.removeItem('api-tester-auth');
  }
}

function loadPersistedCookies(): CustomCookie[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('api-tester-cookies');
    if (stored) {
      return JSON.parse(stored) as CustomCookie[];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveCookies(cookies: CustomCookie[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('api-tester-cookies', JSON.stringify(cookies));
}

function loadPersistedSessionCookies(): SessionCookie[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('api-tester-session-cookies');
    if (stored) {
      const cookies = JSON.parse(stored) as SessionCookie[];
      const validCookies = filterExpiredCookies(cookies);
      if (validCookies.length !== cookies.length) {
        saveSessionCookies(validCookies);
      }
      return validCookies;
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveSessionCookies(cookies: SessionCookie[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('api-tester-session-cookies', JSON.stringify(cookies));
}

// ========== Variables localStorage Functions ==========

function loadPersistedVariables(): Variable[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('api-tester-variables');
    if (stored) {
      return JSON.parse(stored) as Variable[];
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveVariables(variables: Variable[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('api-tester-variables', JSON.stringify(variables));
}

// ========== Auth & Cookie Store ==========

export interface AuthCookieState {
  authConfig: AuthConfig;
  customCookies: CustomCookie[];
  sessionCookies: SessionCookie[];
  variables: Variable[];
}

export interface AuthCookieActions {
  // Authentication
  setAuthConfig: (config: Partial<AuthConfig>) => void;
  clearAuth: () => void;
  // Custom Cookies
  addCustomCookie: (cookie: CustomCookie) => void;
  updateCustomCookie: (index: number, cookie: Partial<CustomCookie>) => void;
  removeCustomCookie: (index: number) => void;
  clearCustomCookies: () => void;
  // Session Cookies
  setSessionCookies: (cookies: SessionCookie[]) => void;
  addSessionCookies: (cookies: SessionCookie[]) => void;
  clearSessionCookies: () => void;
  removeExpiredCookies: () => number;
  // Variables
  addVariable: (variable: Variable) => void;
  updateVariable: (index: number, variable: Partial<Variable>) => void;
  removeVariable: (index: number) => void;
  clearVariables: () => void;
}

export type AuthCookieStore = AuthCookieState & { actions: AuthCookieActions };

const initialState: AuthCookieState = {
  authConfig: loadPersistedAuthConfig(),
  customCookies: loadPersistedCookies(),
  sessionCookies: loadPersistedSessionCookies(),
  variables: loadPersistedVariables(),
};

export const useAuthCookieStore = create<AuthCookieStore>((set) => ({
  ...initialState,

  actions: {
    setAuthConfig: (config) =>
      set((state) => {
        const newAuthConfig = { ...state.authConfig, ...config };
        saveAuthConfig(newAuthConfig);
        return { authConfig: newAuthConfig };
      }),

    clearAuth: () =>
      set(() => {
        saveAuthConfig(DEFAULT_AUTH_CONFIG);
        return { authConfig: DEFAULT_AUTH_CONFIG };
      }),

    addCustomCookie: (cookie) =>
      set((state) => {
        const newCookies = [...state.customCookies, cookie];
        saveCookies(newCookies);
        return { customCookies: newCookies };
      }),

    updateCustomCookie: (index, cookie) =>
      set((state) => {
        const newCookies = [...state.customCookies];
        newCookies[index] = { ...newCookies[index], ...cookie };
        saveCookies(newCookies);
        return { customCookies: newCookies };
      }),

    removeCustomCookie: (index) =>
      set((state) => {
        const newCookies = state.customCookies.filter((_, i) => i !== index);
        saveCookies(newCookies);
        return { customCookies: newCookies };
      }),

    clearCustomCookies: () =>
      set(() => {
        saveCookies([]);
        return { customCookies: [] };
      }),

    setSessionCookies: (cookies: SessionCookie[]) => {
      saveSessionCookies(cookies);
      return set({ sessionCookies: cookies });
    },

    addSessionCookies: (cookies: SessionCookie[]) =>
      set((state) => {
        const cookieMap = new Map<string, SessionCookie>();
        for (const cookie of state.sessionCookies) {
          cookieMap.set(cookie.name, cookie);
        }
        for (const cookie of cookies) {
          cookieMap.set(cookie.name, cookie);
        }
        const merged = Array.from(cookieMap.values());
        saveSessionCookies(merged);
        return { sessionCookies: merged };
      }),

    clearSessionCookies: () => {
      saveSessionCookies([]);
      return set({ sessionCookies: [] });
    },

    removeExpiredCookies: (): number => {
      const currentCookies = useAuthCookieStore.getState().sessionCookies;
      const validCookies = filterExpiredCookies(currentCookies);
      const removedCount = currentCookies.length - validCookies.length;
      if (removedCount > 0) {
        saveSessionCookies(validCookies);
        set({ sessionCookies: validCookies });
      }
      return removedCount;
    },

    // Variables
    addVariable: (variable: Variable) =>
      set((state) => {
        const newVariables = [...state.variables, variable];
        saveVariables(newVariables);
        return { variables: newVariables };
      }),

    updateVariable: (index: number, variable: Partial<Variable>) =>
      set((state) => {
        const newVariables = [...state.variables];
        newVariables[index] = { ...newVariables[index], ...variable };
        saveVariables(newVariables);
        return { variables: newVariables };
      }),

    removeVariable: (index: number) =>
      set((state) => {
        const newVariables = state.variables.filter((_, i) => i !== index);
        saveVariables(newVariables);
        return { variables: newVariables };
      }),

    clearVariables: () => {
      saveVariables([]);
      return set({ variables: [] });
    },
  },
}));

// Actions - can be used outside of React components
export const authCookieStoreActions = useAuthCookieStore.getState().actions;

// Selector hooks
export const useAuthConfig = () => useAuthCookieStore((s) => s.authConfig);
export const useCustomCookies = () => useAuthCookieStore((s) => s.customCookies);
export const useSessionCookies = () => useAuthCookieStore((s) => s.sessionCookies);
export const useVariables = () => useAuthCookieStore((s) => s.variables);

// ========== Backward Compatibility ==========
// Combined actions object for existing code that uses apiTesterStoreActions
export const apiTesterStoreActions = {
  ...testParamsStoreActions,
  ...authCookieStoreActions,
  ...historyStoreActions,
};
