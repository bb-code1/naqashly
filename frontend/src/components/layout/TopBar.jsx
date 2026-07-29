import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from './components/BrandLogo';
import { NavigationTabs } from './components/NavigationTabs';
import { ProfileDropdownMenu } from './components/ProfileDropdownMenu';

/**
 * 👑 Decluttered Modular Top Navigation Bar
 * 
 * Modular Architecture:
 * ├── BrandLogo.jsx              (Clean N Brand Logo & Identity - Far Left)
 * ├── NavigationTabs.jsx         (5 Workspace Domain Tab Pills - Center)
 * └── ProfileDropdownMenu.jsx    (Single Profile Avatar Dropdown - Far Right Corner)
 * 
 * @author Barkat Bashir
 * @version 10.0.0
 */
export const TopBar = ({ activeMode, onSelectMode, onOpenPairModal, onOpenAuthModal, onGoToHome }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app-topbar">
      {/* 1. BRAND IDENTITY (FAR LEFT) */}
      <BrandLogo onClick={() => onSelectMode?.('ALL')} />

      {/* 2. 5 CORE WORKSPACE DOMAIN NAVIGATION TABS (CENTER) */}
      <NavigationTabs
        activeMode={activeMode}
        onSelectMode={onSelectMode}
      />

      {/* 3. SLEEK USER PROFILE MENU (FAR RIGHT CORNER) */}
      <div style={{ marginLeft: 'auto' }}>
        <ProfileDropdownMenu
          user={user}
          isAuthenticated={isAuthenticated}
          logout={logout}
          onGoToHome={onGoToHome}
          onOpenPairModal={onOpenPairModal}
          onOpenAuthModal={onOpenAuthModal}
        />
      </div>
    </div>
  );
};
