import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeSwitcher } from '../../ui/ThemeSwitcher';
import { Button } from '../../ui/Button';

/**
 * 👑 Executive User Profile Dropdown Menu Component
 * 
 * Positioned on the far right corner with zIndex 9999 & solid opaque glass background.
 */
export const ProfileDropdownMenu = ({ user, isAuthenticated, logout, onGoToHome, onOpenPairModal, onOpenAuthModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) {
    return (
      <Button variant="emerald" onClick={onOpenAuthModal} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
        🔐 Log In / Sign Up
      </Button>
    );
  }

  const username = user?.username || user?.email?.split('@')[0] || 'User';
  const initial = username[0]?.toUpperCase() || 'U';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      
      {/* Far Right User Profile Avatar Pill */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${isOpen ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
          borderRadius: '12px',
          padding: '0.35rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 15px rgba(16, 185, 129, 0.25)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{
          width: '26px', height: '26px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)',
          color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '900', fontSize: '0.78rem'
        }}>
          {initial}
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>
          {username}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </motion.button>

      {/* Solid Opaque Glassmorphic Dropdown Menu (z-index 9999) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 0.6rem)',
              width: '250px',
              backgroundColor: 'var(--bg-surface-elevated)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '0.85rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.65), 0 0 0 1px var(--border-subtle)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}
          >
            {/* User Info Header */}
            <div style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.2rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                {username}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {user?.email || 'Authenticated User'}
              </div>
            </div>

            {/* Menu Option 1: 🌐 Public Home Page */}
            {onGoToHome && (
              <motion.button
                whileHover={{ x: 3, background: 'var(--bg-surface)' }}
                onClick={() => { setIsOpen(false); onGoToHome(); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: 'var(--text-heading)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span>🌐</span> Public Home Page
              </motion.button>
            )}

            {/* Menu Option 2: 🎨 Theme Engine */}
            <div style={{ padding: '0.2rem 0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-heading)' }}>🎨 Theme</span>
              <ThemeSwitcher />
            </div>

            {/* Menu Option 3: 📱 Link Telegram Bot */}
            <motion.button
              whileHover={{ x: 3, background: 'var(--bg-surface)' }}
              onClick={() => { setIsOpen(false); onOpenPairModal?.(); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: 'var(--text-heading)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>📱</span> Link Telegram Bot
            </motion.button>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.2rem 0' }} />

            {/* Menu Option 4: 🚪 Log Out */}
            <motion.button
              whileHover={{ x: 3, background: 'rgba(239, 68, 68, 0.1)' }}
              onClick={() => { setIsOpen(false); logout(); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.82rem',
                fontWeight: '800',
                color: '#EF4444',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>🚪</span> Log Out Workspace
            </motion.button>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
