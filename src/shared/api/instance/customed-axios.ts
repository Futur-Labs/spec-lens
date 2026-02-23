import axios from 'axios';

import { interceptors } from '../wrapper/interceptors.ts';

// SSR 환경에서는 location이 없으므로 조건부 처리
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // 서버 사이드에서는 location이 없으므로 빈 문자열 또는 환경변수 사용
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/${import.meta.env.VITE_SUFFIX_API_ENDPOINT}`;
  }
  return `/${import.meta.env.VITE_SUFFIX_API_ENDPOINT}`;
};

export const customedAxios = interceptors(
  axios.create({
    baseURL: getBaseURL(),
    headers: {
      'ngrok-skip-browser-warning': true,
      'Content-Type': 'application/json;charset=UTF-8',
      accept: 'application/json,',
    },
    responseType: 'json',
    paramsSerializer: customParamsSerializer,
    timeoutErrorMessage: '요청시간이 초과되었습니다.',
    timeout: 1000 * 60 * 2,
  }),
);

type Params = Record<
  string,
  (string | number | boolean | (string | number | boolean)[]) | null | undefined
>;

function customParamsSerializer(params: Params) {
  const parts: string[] = [];
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((v) => {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
        });
      } else if (value !== null && value !== undefined) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
  }
  return parts.join('&');
}
