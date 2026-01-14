import type { SessionCookie } from '../model/cookie-types';

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

function isCookieExpired(cookie: SessionCookie): boolean {
  if (!cookie.expires) return false;
  const expiresDate = new Date(cookie.expires);
  return expiresDate.getTime() < Date.now();
}

export function filterExpiredCookies(cookies: SessionCookie[]): SessionCookie[] {
  return cookies.filter((cookie) => !isCookieExpired(cookie));
}
