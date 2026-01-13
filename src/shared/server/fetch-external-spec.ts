import { createServerFn } from '@tanstack/react-start';
import axios, { AxiosError } from 'axios';

export interface FetchSpecResult {
  data: any;
  etag: string | null;
  lastModified: string | null;
}

export interface CheckSpecUpdateResult {
  hasUpdate: boolean;
  newEtag: string | null;
  newLastModified: string | null;
  data?: any;
}

export const fetchExternalSpec = createServerFn({ method: 'POST' })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }): Promise<FetchSpecResult> => {
    const { url } = data;

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'SpecLens/1.0',
        },
        timeout: 30000,
      });

      // Extract ETag and Last-Modified headers
      const etag = response.headers['etag'] || response.headers['ETag'] || null;
      const lastModified =
        response.headers['last-modified'] || response.headers['Last-Modified'] || null;

      return {
        data: response.data,
        etag,
        lastModified,
      };
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === 'ECONNREFUSED') {
          throw new Error('Failed to connect to the server');
        }
        if (err.response) {
          throw new Error(`HTTP ${err.response.status}: ${err.response.statusText}`);
        }
        throw new Error(`Failed to fetch spec: ${err.message}`);
      }
      if (err instanceof Error) {
        throw new Error(`Failed to fetch spec: ${err.message}`);
      }
      throw new Error('Failed to fetch spec');
    }
  });

/**
 * Check if spec has been updated using ETag/Last-Modified headers
 * Returns 304 Not Modified if unchanged, or fetches the new spec
 */
export const checkSpecUpdate = createServerFn({ method: 'POST' })
  .inputValidator((data: { url: string; etag?: string; lastModified?: string }) => data)
  .handler(async ({ data }): Promise<CheckSpecUpdateResult> => {
    const { url, etag, lastModified } = data;

    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'User-Agent': 'SpecLens/1.0',
      };

      // Add conditional headers if available
      if (etag) {
        headers['If-None-Match'] = etag;
      }
      if (lastModified) {
        headers['If-Modified-Since'] = lastModified;
      }

      const response = await axios.get(url, {
        headers,
        timeout: 30000,
        validateStatus: (status) => status === 200 || status === 304,
      });

      if (response.status === 304) {
        // Not modified
        return {
          hasUpdate: false,
          newEtag: etag || null,
          newLastModified: lastModified || null,
        };
      }

      // Has update - return new data
      const newEtag = response.headers['etag'] || response.headers['ETag'] || null;
      const newLastModified =
        response.headers['last-modified'] || response.headers['Last-Modified'] || null;

      return {
        hasUpdate: true,
        newEtag,
        newLastModified,
        data: response.data,
      };
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.code === 'ECONNREFUSED') {
          throw new Error('Failed to connect to the server');
        }
        if (err.response) {
          throw new Error(`HTTP ${err.response.status}: ${err.response.statusText}`);
        }
        throw new Error(`Failed to check spec update: ${err.message}`);
      }
      if (err instanceof Error) {
        throw new Error(`Failed to check spec update: ${err.message}`);
      }
      throw new Error('Failed to check spec update');
    }
  });
