import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

export function Spinner({ style }: { style?: CSSProperties }) {
  return (
    <motion.div
      style={{
        width: '2.24rem',
        height: '2.24rem',
        borderWidth: '0.32rem',
        borderStyle: 'solid',
        borderColor: '#e0e0e0',
        borderTopColor: '#666',
        borderRadius: '50%',
        ...style,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}
