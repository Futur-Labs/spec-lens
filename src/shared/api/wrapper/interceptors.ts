import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import qs from 'qs';

import { deepCamelToSnake, logOnDev } from '@/shared/lib';

const onRequest = async (config: AxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
  const { method, url, headers, params, data, baseURL } = config;

  logOnDev(`onRequest [API] ${method?.toUpperCase()} ${url} | Request`);

  if (!headers) {
    throw new Error(`axios header is undefined`);
  }

  if (params) {
    config.params = deepCamelToSnake(params);
  }

  if (data) {
    if (
      data instanceof FormData ||
      data instanceof File ||
      data instanceof Blob ||
      data instanceof ArrayBuffer ||
      data instanceof URLSearchParams
    ) {
      config.data = data;
    } else if (typeof data === 'string' || typeof data === 'number') {
      config.data = data;
    } else if (data && typeof data === 'object') {
      config.data = deepCamelToSnake(data);
    } else {
      config.data = data;
    }
  }

  let fullUrl = `${baseURL || ''}${url}`;
  if (method?.toUpperCase() === 'GET' && config.params) {
    const queryString = qs.stringify(config.params, { arrayFormat: 'brackets' });
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  logOnDev(`onRequest [API] ${method?.toUpperCase()} ${fullUrl} | Request`);

  return Promise.resolve({ ...config } as InternalAxiosRequestConfig);
};

const onErrorRequest = async (error: AxiosError<AxiosRequestConfig>) => {
  switch (true) {
    case Boolean(error.config):
      logOnDev(`onErrorRequest: 요청 실패: ${error}`);
      break;
    case Boolean(error.request):
      logOnDev(`onErrorRequest: 응답 없음 ${error}`);
      break;
    default:
      logOnDev(`onErrorRequest: ${error}`);
      break;
  }

  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  const { method, url } = response.config;
  const { status } = response;

  logOnDev(`onResponse [API] ${method?.toUpperCase()} ${url} | Request ${status}`);

  return response;
};

const truncateBase64 = (obj: any, maxLength = 100): any => {
  if (typeof obj === 'string') {
    // base64 패턴 감지 (data:image/ 또는 긴 영숫자 문자열)
    if (obj.startsWith('data:image/') || (obj.length > 200 && /^[A-Za-z0-9+/=]+$/.test(obj))) {
      return `[BASE64_IMAGE: ${obj.length} chars]`;
    }
    return obj.length > maxLength ? obj.slice(0, maxLength) + '...' : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => truncateBase64(item, maxLength));
  }

  if (obj && typeof obj === 'object') {
    const truncated: any = {};
    for (const [key, value] of Object.entries(obj)) {
      truncated[key] = truncateBase64(value, maxLength);
    }
    return truncated;
  }

  return obj;
};

const onErrorResponse = (error: AxiosError | Error) => {
  if (axios.isAxiosError(error)) {
    // console.log('error.toJSON(): ', error.toJSON());
    const safeError = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      params: error.config?.params,
      data: error.config?.data
        ? typeof error.config.data === 'string'
          ? truncateBase64(error.config.data, 200)
          : truncateBase64(error.config.data)
        : undefined,
      responseData: error.response?.data
        ? truncateBase64(JSON.stringify(error.response.data), 500)
        : undefined,
    };

    console.log('AxiosError (short):', safeError);

    const { message } = error;

    const method = error.config?.method;
    const url = error.config?.url;

    if (error.response) {
      const { status, statusText, data, config } = error.response;

      logOnDev(
        `onErrorResponse [API] ${method?.toUpperCase?.()} ${url} | Error ${status} ${statusText} | ${message}`,
      );

      if (data) {
        logOnDev('onErrorResponse [API] data: ', JSON.stringify(data, null, 2));
      }

      if (config.data) {
        try {
          if (typeof config.data === 'string') {
            logOnDev(
              'onErrorResponse [API] config.data: ',
              truncateBase64(JSON.parse(config.data)),
            );
          } else {
            logOnDev('onErrorResponse [API] config.data: ', truncateBase64(config.data));
          }
        } catch {
          logOnDev('onErrorResponse [API] config.data (raw): ', truncateBase64(config.data));
        }
      }
    } else {
      logOnDev(
        `onErrorResponse [API] ${method?.toUpperCase?.()} ${url} | Network Error or Request Canceled | ${message}`,
      );
    }
  } else if (error.name === 'TimeoutError') {
    logOnDev(`[API] | TimeError ${error.toString()}`);
  } else {
    logOnDev(`[API] | Error ${error.toString()}`);
  }

  return Promise.reject(error);
};

export const interceptors = (axiosInstance: AxiosInstance): AxiosInstance => {
  axiosInstance.interceptors.request.use(onRequest, onErrorRequest);
  axiosInstance.interceptors.response.use(onResponse, onErrorResponse);

  return axiosInstance;
};
