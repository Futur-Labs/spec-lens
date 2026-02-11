import { createServerFn } from '@tanstack/react-start';
import axios, { AxiosError } from 'axios';

import { validateTargetUrl } from './validate-target-url';

interface FetchSpecResult {
  data: any;
  etag: string | null;
  lastModified: string | null;
}

export const fetchExternalSpec = createServerFn({ method: 'POST' })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }): Promise<FetchSpecResult> => {
    const { url } = data;

    const safeUrl = await validateTargetUrl(url);

    try {
      const response = await axios.get(safeUrl.toString(), {
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
