import { useState } from 'react';

import { Check, Copy, FileCode, FileJson } from 'lucide-react';

export function JsonActionWrapper({
  data,
  children,
  defaultView = 'schema',
}: {
  data: any;
  children: React.ReactNode;
  defaultView?: 'schema' | 'json';
}) {
  const [view, setView] = useState<'schema' | 'json'>(defaultView);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Toggle Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '0.4rem',
            borderRadius: '0.6rem',
            gap: '0.4rem',
          }}
        >
          <button
            onClick={() => setView('schema')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.4rem',
              border: 'none',
              backgroundColor: view === 'schema' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: view === 'schema' ? '#f3f4f6' : '#9ca3af',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <FileCode size={14} />
            Schema
          </button>
          <button
            onClick={() => setView('json')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.4rem',
              border: 'none',
              backgroundColor: view === 'json' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: view === 'json' ? '#f3f4f6' : '#9ca3af',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <FileJson size={14} />
            JSON
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={handleCopy}
            title='Copy JSON'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.6rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.6rem',
              color: '#e5e5e5',
              cursor: 'pointer',
              fontSize: '1.2rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
          >
            {copied ? <Check size={14} color='#10b981' /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: '0.8rem',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        {view === 'schema' ? (
          <div style={{ padding: '1.6rem' }}>{children}</div>
        ) : (
          <pre
            style={{
              margin: 0,
              padding: '1.6rem',
              overflow: 'auto',
              fontSize: '1.3rem',
              fontFamily: 'monospace',
              color: '#d1d5db',
              lineHeight: 1.5,
              maxHeight: '40rem',
            }}
          >
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  );
}
