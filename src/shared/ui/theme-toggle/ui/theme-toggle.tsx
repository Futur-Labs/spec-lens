import { motion } from 'framer-motion';

import { Moon, Sun } from 'lucide-react';

import { useThemeStore } from '@/shared/theme';

export function ThemeToggle() {
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const isDark = resolvedMode === 'dark';

  return (
    <button
      onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
      style={{
        userSelect: 'none',
        position: 'relative',
        width: '5.6rem',
        height: '2.8rem',
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.3s ease',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '2.2rem',
          height: '2.2rem',
          borderRadius: '50%',
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: isDark ? '0.3rem' : '3.1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        <motion.div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          key={resolvedMode}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Moon size={12} color='#e5e5e5' /> : <Sun size={12} color='#f59e0b' />}
        </motion.div>
      </motion.div>
    </button>
  );
}
