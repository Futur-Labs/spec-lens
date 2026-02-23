import { useState } from 'react';

import { ChevronDown, ChevronUp, Repeat } from 'lucide-react';

import { useColors } from '@/shared/theme';
import { StepperInput } from '@/shared/ui/input';

export function RepeatSettings({
  requestCount,
  requestInterval,
  setRequestCount,
  setRequestInterval,
}: {
  requestCount: number;
  requestInterval: number;
  setRequestCount: (requestCount: number) => void;
  setRequestInterval: (requestInterval: number) => void;
}) {
  const colors = useColors();

  const [showRepeatSettings, setShowRepeatSettings] = useState(false);

  return (
    <div>
      <button
        onClick={() => setShowRepeatSettings(!showRepeatSettings)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.6rem 1rem',
          backgroundColor: colors.bg.autoComplete,
          border: `1px solid ${colors.border.default}`,
          borderRadius: '0.4rem',
          color: requestCount > 1 ? colors.feedback.warning : colors.text.secondary,
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
      >
        <Repeat size={12} />
        <span>Repeat: {requestCount}x</span>
        {requestCount > 1 && requestInterval > 0 && (
          <span style={{ color: colors.text.tertiary }}>({requestInterval}ms interval)</span>
        )}
        {showRepeatSettings ? (
          <ChevronUp size={12} color={colors.text.tertiary} />
        ) : (
          <ChevronDown size={12} color={colors.text.tertiary} />
        )}
      </button>

      {showRepeatSettings && (
        <div
          style={{
            marginTop: '0.8rem',
            padding: '1.2rem',
            backgroundColor: colors.bg.overlay,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: '0.6rem',
            display: 'flex',
            gap: '1.6rem',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                color: colors.text.secondary,
                fontSize: '1.1rem',
                marginBottom: '0.4rem',
              }}
            >
              Request Count
            </label>
            <StepperInput value={requestCount} onChange={setRequestCount} min={1} max={100} />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                color: colors.text.secondary,
                fontSize: '1.1rem',
                marginBottom: '0.4rem',
              }}
            >
              Interval (ms)
            </label>
            <StepperInput
              value={requestInterval}
              onChange={setRequestInterval}
              min={0}
              max={60000}
              step={100}
            />
          </div>
          <button
            onClick={() => {
              setRequestCount(1);
              setRequestInterval(0);
            }}
            style={{
              padding: '0.8rem 1.2rem',
              backgroundColor: 'transparent',
              border: `1px solid ${colors.border.default}`,
              borderRadius: '0.4rem',
              color: colors.text.secondary,
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
