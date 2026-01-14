export type ApiAuthType = 'none' | 'bearer' | 'apiKey' | 'basic';

export type ApiAuthConfig = {
  type: ApiAuthType;
  // Bearer token
  bearerToken?: string;
  // API Key
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyLocation?: 'header' | 'query';
  // Basic Auth
  basicUsername?: string;
  basicPassword?: string;
  // Persistence
  persistSession?: boolean;
};

export type ApiAuthState = {
  apiAuthConfig: ApiAuthConfig;
};

export type ApiAuthActions = {
  setApiAuthConfig: (config: Partial<ApiAuthConfig>) => void;
  clearAuth: () => void;
};

export type ApiAuthStore = ApiAuthState & { actions: ApiAuthActions };
