import { Globe, Key, Lock, Shield } from 'lucide-react';

import type { SecuritySchemeObject } from '@/entities/api-spec';

export function getSecurityIcon(type: SecuritySchemeObject['type']) {
  switch (type) {
    case 'http':
      return <Shield size={13} />;
    case 'apiKey':
      return <Key size={13} />;
    case 'oauth2':
      return <Globe size={13} />;
    case 'openIdConnect':
      return <Lock size={13} />;
    default:
      return <Shield size={13} />;
  }
}

export function getSecurityTypeLabel(scheme: SecuritySchemeObject) {
  switch (scheme.type) {
    case 'http':
      return scheme.scheme === 'bearer'
        ? `Bearer${scheme.bearerFormat ? ` (${scheme.bearerFormat})` : ''}`
        : `HTTP ${scheme.scheme}`;
    case 'apiKey':
      return `API Key (${scheme.in}: ${scheme.name})`;
    case 'oauth2':
      return 'OAuth 2.0';
    case 'openIdConnect':
      return 'OpenID Connect';
    default:
      return scheme.type;
  }
}
