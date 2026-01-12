import { createServerFn } from '@tanstack/react-start';
import axios, { AxiosError } from 'axios';

export const fetchExternalSpec = createServerFn({ method: 'POST' })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }) => {
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

      return response.data;
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
