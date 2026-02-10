import axios, { AxiosError } from 'axios';
import { useState, type FormEvent } from 'react';

import { Link, Loader2, AlertCircle } from 'lucide-react';

import { setSpecWithExpanded } from '../lib/set-spec-with-expanded';
import { type OpenAPISpec, validateOpenAPISpec, specStoreActions } from '@/entities/openapi-spec';
import { fetchExternalSpec } from '@/shared/server';

export function UrlInputForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
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

      setSpecWithExpanded(json as OpenAPISpec, {
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
      specStoreActions.setError(message);
    } finally {
      setIsLoadingLocal(false);
      specStoreActions.setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          gap: '1.2rem',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
            padding: '0 1.6rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '0.6rem',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Link size={18} color='#6b7280' />
          <input
            type='text'
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setLocalError(null);
            }}
            placeholder='https://api.example.com/openapi.json'
            style={{
              flex: 1,
              padding: '1.4rem 0',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e5e5e5',
              fontSize: '1.4rem',
            }}
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            padding: '0 2.4rem',
            backgroundColor: '#075D46',
            color: '#fff',
            border: 'none',
            borderRadius: '0.6rem',
            fontSize: '1.4rem',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            minWidth: '8.8rem',
          }}
        >
          {isLoading ? (
            <>
              <Loader2
                size={16}
                className='animate-spin'
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <span>Loading</span>
            </>
          ) : (
            'Fetch'
          )}
        </button>
      </div>

      {localError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginTop: '1.2rem',
            padding: '1.2rem 1.6rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '0.6rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <AlertCircle size={16} color='#ef4444' />
          <span style={{ color: '#ef4444', fontSize: '1.3rem' }}>{localError}</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
