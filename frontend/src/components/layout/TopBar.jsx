import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { useAuth } from '../../context/AuthContext';

/**
 * 👑 Executive Full-Width Top Header & Navigation Bar
 * 
 * Replaces left sidebar with integrated 5-domain navigation tabs:
 * 1. ⚡ Dashboard (ALL)
 * 2. 🌿 Routines (ROUTINE)
 * 3. 🏦 Money Ledger (FINANCE)
 * 4. 🎯 Focus Goals (PRODUCTIVITY)
 * 5. 📖 Private Diary (JOURNAL)
 * 
 * @author Barkat Bashir
 * @version 8.0.0
 */
export const TopBar = ({ activeMode, onSelectMode, onOpenPairModal, onOpenAuthModal, onGoToHome }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const NAV_TABS = [
    { key: 'ALL', label: 'Dashboard', icon: '⚡' },
    { key: 'ROUTINE', label: 'Routines', icon: '🌿' },
    { key: 'FINANCE', label: 'Ledger', icon: '🏦' },
    { key: 'PRODUCTIVITY', label: 'Goals', icon: '🎯' },
    { key: 'JOURNAL', label: 'Private Diary', icon: '📖' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      marginBottom: '2rem',
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '1.25rem 1.75rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
    }}>
      {/* Top Row: Brand Title + User Profile & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Identity */}
        <div
          onClick={() => onSelectMode?.('ALL')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)',
            color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            N
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-heading)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Naqashly
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Personal Life OS & Encrypted Vault
            </div>
          </div>
        </div>

        {/* Integrated Navigation Tab Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.35rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          {NAV_TABS.map(tab => {
            const isActive = activeMode === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectMode?.(tab.key)}
                style={{
                  position: 'relative',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  border: `1px solid ${isActive ? 'var(--accent-emerald)' : 'transparent'}`,
                  borderRadius: '10px',
                  padding: '0.5rem 0.95rem',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="topBarActiveTab"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '9px',
                      border: '2px solid #10B981',
                      pointerEvents: 'none'
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Action Suite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Public Home Link */}
          {onGoToHome && (
            <Button variant="outline" onClick={onGoToHome} style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', border: '1px solid var(--border-subtle)' }}>
              🌐 Home
            </Button>
          )}

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Telegram Bot Link */}
          <Button variant="secondary" onClick={onOpenPairModal} style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}>
            📱 Link Bot
          </Button>

          {/* Logged-In User Badge */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.3rem 0.65rem', borderRadius: '10px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'var(--accent-emerald)', color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', fontSize: '0.78rem'
              }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                {user?.username || user?.email?.split('@')[0]}
              </span>
              <Button variant="outline" onClick={logout} style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}>
                Log Out
              </Button>
            </div>
          ) : (
            <Button onClick={onOpenAuthModal}>🔐 Log In</Button>
          )}
        </div>

      </div>
    </div>
  );
};
