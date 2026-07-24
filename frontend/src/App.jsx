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
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { getActiveSubdomainApp } from './config/domain';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeMode, setActiveMode] = useState(() => getActiveSubdomainApp());
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setActiveMode(getActiveSubdomainApp());
  }, []);

  return (
    <ProtectedRoute fallback={<LandingPage onAuthenticated={() => setActiveMode(getActiveSubdomainApp())} />}>
      <div style={{ display: 'flex', width: '100vw', minHeight: '100vh' }}>
        <Sidebar activeMode={activeMode} onSelectMode={setActiveMode} />

        <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
          <TopBar
            activeMode={activeMode}
            onOpenPairModal={() => setIsPairModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            {(activeMode === 'ALL' || activeMode === 'ROUTINE') && <RoutineModule />}
            {(activeMode === 'ALL' || activeMode === 'FINANCE') && <FinanceModule />}
            {(activeMode === 'ALL' || activeMode === 'PRODUCTIVITY') && <ProductivityModule />}
            {(activeMode === 'ALL' || activeMode === 'JOURNAL') && <JournalModule />}
          </div>
        </main>

        <ChatPairingModal isOpen={isPairModalOpen} onClose={() => setIsPairModalOpen(false)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
