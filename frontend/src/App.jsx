import React, { useState, useEffect } from 'react';
import { TopBar } from './components/layout/TopBar';
import { ExecutiveDashboard } from './apps/dashboard/ExecutiveDashboard';
import { RoutineModule } from './apps/routine/RoutineModule';
import { FinanceModule } from './apps/finance/FinanceModule';
import { ProductivityModule } from './apps/productivity/ProductivityModule';
import { JournalModule } from './apps/journal/JournalModule';
import { ChatPairingModal } from './components/auth/ChatPairingModal';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { useAuth } from './context/AuthContext';
import { getActiveSubdomainApp } from './config/domain';

/**
 * 🚀 Naqashly Life OS Executive Single Page Application.
 * 
 * Features:
 * 1. 100% Full-Width Screen Canvas (Removed 270px left sidebar clutter)
 * 2. Integrated Top Header Navigation Tabs ([⚡ Dashboard] [🌿 Routines] [🏦 Ledger] [🎯 Goals] [📖 Diary])
 * 3. Modular Post-Login Executive Dashboard
 * 
 * @author Barkat Bashir
 * @version 12.0.0
 */
export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeMode, setActiveMode] = useState(() => getActiveSubdomainApp());
  const [activeSubRoute, setActiveSubRoute] = useState('overview');
  const [viewMode, setViewMode] = useState(() => (isAuthenticated ? 'DASHBOARD' : 'HOME'));
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  useEffect(() => {
    setActiveMode(getActiveSubdomainApp());
  }, []);

  const handleSelectMode = (newMode) => {
    setActiveMode(newMode);
    setActiveSubRoute('overview');
  };

  useEffect(() => {
    if (isAuthenticated) {
      setViewMode('DASHBOARD');
    } else {
      setViewMode('HOME');
    }
  }, [isAuthenticated]);

  const handleOpenAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      setViewMode('DASHBOARD');
    } else {
      setViewMode('HOME');
      handleOpenAuthModal('login');
    }
  };

  if (!isAuthenticated || viewMode === 'HOME') {
    return (
      <>
        <LandingPage
          onAuthenticated={() => setViewMode('DASHBOARD')}
          onGoToDashboard={handleGoToDashboard}
          onOpenAuthModal={handleOpenAuthModal}
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialTab={authModalTab} />
      </>
    );
  }

  return (
    <div style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg-surface)' }}>
      
      {/* 100% FULL-WIDTH EXECUTIVE CANVAS */}
      <main style={{ maxWidth: '1480px', margin: '0 auto', padding: '1.5rem 2rem', boxSizing: 'border-box' }}>
        
        {/* INTEGRATED FULL-WIDTH TOP HEADER & NAVIGATION TABS */}
        <TopBar
          activeMode={activeMode}
          onSelectMode={handleSelectMode}
          onOpenPairModal={() => setIsPairModalOpen(true)}
          onOpenAuthModal={() => handleOpenAuthModal('login')}
          onGoToHome={() => setViewMode('HOME')}
        />

        {/* ACTIVE DOMAIN VIEW CANVAS */}
        <div style={{ width: '100%' }}>
          {activeMode === 'ALL' && (
            <ExecutiveDashboard onNavigateMode={handleSelectMode} />
          )}
          {activeMode === 'ROUTINE' && (
            <RoutineModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
          {activeMode === 'FINANCE' && (
            <FinanceModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
          {activeMode === 'PRODUCTIVITY' && (
            <ProductivityModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
          {activeMode === 'JOURNAL' && (
            <JournalModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
        </div>
      </main>

      <ChatPairingModal isOpen={isPairModalOpen} onClose={() => setIsPairModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialTab={authModalTab} />
    </div>
  );
}
