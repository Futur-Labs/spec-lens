import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Code, Cookie, History, Key, Shield, X } from 'lucide-react';

import { AuthTab } from './auth-tab';
import { CookiesTab } from './cookies-tab';
import { HistoryTab } from './history-tab';
import { TabButton } from './tab-button';
import { VariablesTab } from './variables-tab';
import { useSpecSource, useVariables } from '@/entities/api-spec';
import { useCustomCookies, useSessionCookies } from '@/entities/cookie';
import { useHistoryBySpec } from '@/entities/history';
import { useColors } from '@/shared/theme';

export function ApiSettingsModal() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'auth' | 'cookies' | 'variables' | 'history'>('auth');

  const customCookies = useCustomCookies();
  const sessionCookies = useSessionCookies();
  const variables = useVariables();
  const specSource = useSpecSource();
  const specId = specSource?.name ?? null;
  const history = useHistoryBySpec(specId);

  const handleClose = () => {
    window.history.back();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
        }}
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 201,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '90%',
            maxWidth: '70rem',
            height: '60vh',
            backgroundColor: colors.bg.elevated,
            borderRadius: '1.2rem',
            border: `1px solid ${colors.border.default}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.6rem 2rem',
              borderBottom: `1px solid ${colors.border.subtle}`,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Shield size={18} color={colors.feedback.success} />
              <span style={{ color: colors.text.primary, fontSize: '1.5rem', fontWeight: 600 }}>
                API Settings
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '3rem',
                height: '3rem',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: '0.6rem',
                cursor: 'pointer',
                color: colors.text.secondary,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              padding: '1.2rem 2rem 0',
              flexShrink: 0,
            }}
          >
            <TabButton
              active={activeTab === 'auth'}
              onClick={() => setActiveTab('auth')}
              icon={<Key size={12} />}
              label='Authentication'
            />
            <TabButton
              active={activeTab === 'cookies'}
              onClick={() => setActiveTab('cookies')}
              icon={<Cookie size={12} />}
              label='Cookies'
              count={customCookies.filter((c) => c.enabled).length + sessionCookies.length}
            />
            <TabButton
              active={activeTab === 'variables'}
              onClick={() => setActiveTab('variables')}
              icon={<Code size={12} />}
              label='Variables'
              count={variables.length}
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={<History size={12} />}
              label='History'
              count={history.length}
            />
          </div>

          {/* Tab Content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.6rem 2rem 2rem',
            }}
          >
            {activeTab === 'auth' ? (
              <AuthTab />
            ) : activeTab === 'cookies' ? (
              <CookiesTab />
            ) : activeTab === 'variables' ? (
              <VariablesTab />
            ) : (
              <HistoryTab />
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
