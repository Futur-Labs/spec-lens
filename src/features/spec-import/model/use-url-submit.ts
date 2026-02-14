import axios, { AxiosError } from 'axios';
import { useState, type FormEvent } from 'react';

import { setSpecWithExpanded } from '../lib/set-spec-with-expanded';
import { specStoreActions, validateOpenAPISpec, type ApiSpec } from '@/entities/api-spec';
import { fetchExternalSpec } from '@/shared/server';

export function useUrlSubmit() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setLocalError('Please enter a URL');
      return;
    }

    // Check if relative path or external URL
    const isRelativePath = url.trim().startsWith('/');

    if (!isRelativePath) {
      try {
        new URL(url);
      } catch {
        setLocalError('Please enter a valid URL or relative path (e.g., /api.json)');
        return;
      }
    }

    setIsLoadingLocal(true);
    setLocalError(null);
    specStoreActions.setLoading(true);

    try {
      let json: unknown;

      let etag: string | null = null;
      let lastModified: string | null = null;

      if (isRelativePath) {
        const response = await axios.get<unknown>(url.trim(), {
          headers: { Accept: 'application/json' },
        });
        json = response.data;
        // Extract ETag/Last-Modified from relative path requests too
        etag = response.headers['etag'] || null;
        lastModified = response.headers['last-modified'] || null;
      } else {
        // External URL: use server function to bypass CORS
        const result = await fetchExternalSpec({ data: { url: url.trim() } });
        json = result.data;
        etag = result.etag;
        lastModified = result.lastModified;
      }

      const validation = validateOpenAPISpec(json);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setSpecWithExpanded(json as ApiSpec, {
        type: 'url',
        name: url,
        etag,
        lastModified,
      });
      setUrl('');
    } catch (err) {
      let message = 'Failed to fetch spec';

      if (err instanceof AxiosError) {
        if (err.code === 'ERR_NETWORK') {
          message = 'Failed to fetch. Network error occurred.';
        } else if (err.response) {
          message = `HTTP ${err.response.status}: ${err.response.statusText}`;
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setLocalError(message);
    } finally {
      setIsLoadingLocal(false);
      specStoreActions.setLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    localError,
    setLocalError,
    url,
    setUrl,
  };
}
