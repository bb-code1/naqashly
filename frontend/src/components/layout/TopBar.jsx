import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './components/BrandLogo';
import { NavigationTabs } from './components/NavigationTabs';
import { ProfileDropdownMenu } from './components/ProfileDropdownMenu';

/**
 * 👑 Decluttered Modular Top Navigation Bar
 * 
 * Modular Architecture:
 * ├── BrandLogo.jsx              (Clean N Brand Logo & Identity)
 * ├── NavigationTabs.jsx         (5 Workspace Domain Tab Pills)
 * └── ProfileDropdownMenu.jsx    (Single Profile Avatar Dropdown containing settings & logout)
 * 
 * @author Barkat Bashir
 * @version 9.0.0
 */
export const TopBar = ({ activeMode, onSelectMode, onOpenPairModal, onOpenAuthModal, onGoToHome }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div style={{
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      background: 'var(--bg-surface-elevated)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '20px',
      padding: '0.85rem 1.5rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      {/* 1. BRAND IDENTITY */}
      <BrandLogo onClick={() => onSelectMode?.('ALL')} />

      {/* 2. 5 CORE WORKSPACE DOMAIN NAVIGATION TABS */}
      <NavigationTabs
        activeMode={activeMode}
        onSelectMode={onSelectMode}
      />

      {/* 3. SLEEK USER PROFILE MENU (COLLAPSES ALL SECONDARY ACTIONS) */}
      <ProfileDropdownMenu
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
        onGoToHome={onGoToHome}
        onOpenPairModal={onOpenPairModal}
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
};
