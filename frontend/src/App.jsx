import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
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
 * Root Application Shell for Naqashly Life OS.
 * Enforces Strict Protected Workspace Boundaries.
 * 100% Synchronized Navigation Shell: Links Left Sidebar Click Actions directly to In-Module Sub-Tabs!
 * 
 * @author Barkat Bashir
 * @version 7.0.0
 */
export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeMode, setActiveMode] = useState(() => getActiveSubdomainApp());
  const [activeSubRoute, setActiveSubRoute] = useState('overview');
  const [viewMode, setViewMode] = useState(() => (isAuthenticated ? 'DASHBOARD' : 'HOME'));
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setActiveMode(getActiveSubdomainApp());
  }, []);

  // Reset activeSubRoute when activeMode changes
  const handleSelectMode = (newMode) => {
    setActiveMode(newMode);
    setActiveSubRoute('overview');
  };

  // Sync viewMode with authentication status
  useEffect(() => {
    if (isAuthenticated) {
      setViewMode('DASHBOARD');
    } else {
      setViewMode('HOME');
    }
  }, [isAuthenticated]);

  // Protected Route Navigation Handler
  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      setViewMode('DASHBOARD');
    } else {
      setViewMode('HOME');
      setIsAuthModalOpen(true);
    }
  };

  // If user is not authenticated OR explicitly viewing the Public Home Page
  if (!isAuthenticated || viewMode === 'HOME') {
    return (
      <>
        <LandingPage
          onAuthenticated={() => setViewMode('DASHBOARD')}
          onGoToDashboard={handleGoToDashboard}
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  // Dashboard View (Strict Protected Workspace — Rendered ONLY when isAuthenticated === true)
  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      <Sidebar
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        activeSubRoute={activeSubRoute}
        onSelectSubRoute={setActiveSubRoute}
      />

      <main style={{ flex: 1, padding: '2rem 2.5rem', width: 'calc(100vw - 270px)', boxSizing: 'border-box', overflowY: 'auto' }}>
        <TopBar
          activeMode={activeMode}
          onOpenPairModal={() => setIsPairModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onGoToHome={() => setViewMode('HOME')}
        />

        <div style={{ width: '100%' }}>
          {activeMode === 'ROUTINE' && (
            <RoutineModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
          {activeMode === 'FINANCE' && (
            <FinanceModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
          {(activeMode === 'ALL' || activeMode === 'PRODUCTIVITY') && (
            <ProductivityModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
          {activeMode === 'JOURNAL' && (
            <JournalModule activeSubTab={activeSubRoute} onSelectSubTab={setActiveSubRoute} />
          )}
        </div>
      </main>

      <ChatPairingModal isOpen={isPairModalOpen} onClose={() => setIsPairModalOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
