import React from 'react';
import { Button } from '../ui/Button';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { useAuth } from '../../context/AuthContext';

/**
 * Top Header Navigation Bar with Theme Switcher, Public Home Toggle, Authentication Status & User Avatar Menu.
 * 
 * @author Barkat Bashir
 * @version 6.0.0
 */
export const TopBar = ({ activeMode, onOpenPairModal, onOpenAuthModal, onGoToHome }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const getBannerInfo = () => {
    if (activeMode === 'FINANCE') return { text: '💰 MODE: STANDALONE FINANCE APP', color: 'var(--accent-amber)' };
    if (activeMode === 'ROUTINE') return { text: '🌿 MODE: STANDALONE ROUTINE APP', color: 'var(--accent-emerald)' };
    if (activeMode === 'PRODUCTIVITY') return { text: '🎯 MODE: STANDALONE GOAL APP', color: 'var(--accent-indigo)' };
    if (activeMode === 'JOURNAL') return { text: '📝 MODE: STANDALONE JOURNAL APP', color: 'var(--accent-cyan)' };
    return { text: '⚡ MODE: UNIFIED PLATFORM SUITE', color: 'var(--accent-indigo)' };
  };

  const banner = getBannerInfo();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
          Personal Accountability Dashboard
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Real-time microservices data synchronized via API Gateway (Port 8080)
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Public Home Page Button */}
        {onGoToHome && (
          <Button variant="outline" onClick={onGoToHome} style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', border: '1px solid var(--border-subtle)' }}>
            🌐 Public Home
          </Button>
        )}

        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: `1px solid ${banner.color}`,
          color: banner.color,
          padding: '0.4rem 0.9rem',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: '600'
        }}>
          {banner.text}
        </div>

        {/* Dynamic Multi-Theme Switcher Button */}
        <ThemeSwitcher />

        <Button variant="secondary" onClick={onOpenPairModal}>📱 Link Bot</Button>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--accent-emerald)', color: '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.8rem'
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-heading)' }}>
              {user?.username || user?.email}
            </span>
            <Button variant="outline" onClick={logout} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
              Log Out
            </Button>
          </div>
        ) : (
          <Button onClick={onOpenAuthModal}>🔐 Log In / Sign Up</Button>
        )}
      </div>
    </div>
  );
};
