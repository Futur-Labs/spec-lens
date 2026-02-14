import { motion } from 'framer-motion';
import { useRef, useState, useEffect, type RefObject } from 'react';

import { generateEndpointHash } from '../lib/generate-endpoint-hash';
import {
  endpointSelectionStoreActions,
  useSelectedEndpoint,
  MethodBadge,
  type ParsedEndpoint,
} from '@/entities/api-spec';
import { useColors } from '@/shared/theme';
import { Tooltip } from '@/shared/ui/tooltip';

export function SidebarEndpointItem({
  endpointRefs,
  endpoint,
}: {
  endpointRefs: RefObject<Map<string, HTMLButtonElement>>;
  endpoint: ParsedEndpoint;
}) {
  const colors = useColors();
  const selectedEndpoint = useSelectedEndpoint();
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    };

    checkTruncation();

    const resizeObserver = new ResizeObserver(checkTruncation);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [endpoint.path]);

  const isSelected =
    selectedEndpoint?.path === endpoint.path && selectedEndpoint?.method === endpoint.method;

  return (
    <Tooltip
      key={`${endpoint.method}-${endpoint.path}`}
      content={endpoint.path}
      placement='right'
      delay={0}
      fullWidth
      disabled={!isTruncated}
    >
      <motion.button
        ref={(el) => {
          const key = `${endpoint.method}-${endpoint.path}`;
          if (el) {
            endpointRefs.current.set(key, el);
          } else {
            endpointRefs.current.delete(key);
          }
        }}
        onClick={() => {
          if (isSelected) return;

          endpointSelectionStoreActions.selectEndpoint(endpoint.path, endpoint.method);
          const hash = generateEndpointHash(endpoint.method, endpoint.path);
          window.history.replaceState(null, '', `#${hash}`);
        }}
        initial={false}
        animate={{
          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0)',
          borderLeftColor: isSelected ? colors.feedback.success : 'rgba(255, 255, 255, 0)',
          paddingLeft: isSelected ? '3.6rem' : '3.2rem',
        }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.8rem 1.6rem 0.8rem 3.2rem',
          border: 'none',
          borderLeftWidth: '0.3rem',
          borderLeftStyle: 'solid',
          cursor: 'pointer',
          textAlign: 'left',
          position: 'relative',
        }}
        whileHover={{
          backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.35)' : colors.bg.overlayHover,
        }}
      >
        <MethodBadge method={endpoint.method} size='sm' />
        <span
          ref={textRef}
          style={{
            color: isSelected ? colors.text.primary : colors.text.secondary,
            fontSize: '1.3rem',
            fontFamily: 'monospace',
            fontWeight: isSelected ? 600 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {endpoint.path}
        </span>
      </motion.button>
    </Tooltip>
  );
}
