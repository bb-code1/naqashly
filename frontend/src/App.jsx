import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { ChatPairingModal } from './components/auth/ChatPairingModal';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { NotFoundPage } from './pages/NotFoundPage';

// ⏳ Premium CSS Loading Spinner Fallback
function LoadingSpinner() {
  return (
    <div style={{
      width: '100%',
      height: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '3px solid rgba(99, 102, 241, 0.1)',
        borderTopColor: '#6366f1',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// 📦 Lazy Loading Route Assets (Vite Code Splitting chunks)
const ExecutiveDashboard = lazy(() => import('./apps/dashboard/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));
const RoutineModule = lazy(() => import('./apps/routine/RoutineModule').then(m => ({ default: m.RoutineModule })));
const FinanceModule = lazy(() => import('./apps/finance/FinanceModule').then(m => ({ default: m.FinanceModule })));
const ProductivityModule = lazy(() => import('./apps/productivity/ProductivityModule').then(m => ({ default: m.ProductivityModule })));
const JournalModule = lazy(() => import('./apps/journal/JournalModule').then(m => ({ default: m.JournalModule })));

/**
 * 👑 Authenticated App Layout Wrapper
 */
function AuthenticatedLayout() {
  const [isPairModalOpen, setIsPairModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [authModalSuccessMsg, setAuthModalSuccessMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Highlight correct TopBar tab based on current URL path
  const getActiveModeFromPath = () => {
    const path = location.pathname;
    if (path.startsWith('/routine')) return 'ROUTINE';
    if (path.startsWith('/finance')) return 'FINANCE';
    if (path.startsWith('/productivity')) return 'PRODUCTIVITY';
    if (path.startsWith('/journal')) return 'JOURNAL';
    return 'ALL';
  };

  const handleSelectMode = (newMode) => {
    if (newMode === 'ALL') navigate('/dashboard');
    else if (newMode === 'ROUTINE') navigate('/routine');
    else if (newMode === 'FINANCE') navigate('/finance');
    else if (newMode === 'PRODUCTIVITY') navigate('/productivity');
    else if (newMode === 'JOURNAL') navigate('/journal');
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', overflowX: 'hidden', background: 'var(--bg-surface)' }}>
      <main className="app-main-canvas">
        <TopBar
          activeMode={getActiveModeFromPath()}
          onSelectMode={handleSelectMode}
          onOpenPairModal={() => setIsPairModalOpen(true)}
          onOpenAuthModal={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
          onGoToHome={() => navigate('/')}
        />
        <div style={{ width: '100%' }}>
          {/* Wrap dynamic route transitions in Suspense fallback */}
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet context={{ onNavigateMode: handleSelectMode }} />
          </Suspense>
        </div>
      </main>
      <ChatPairingModal isOpen={isPairModalOpen} onClose={() => setIsPairModalOpen(false)} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => { setIsAuthModalOpen(false); setAuthModalSuccessMsg(''); }} 
        initialTab={authModalTab} 
        initialSuccessMsg={authModalSuccessMsg} 
      />
    </div>
  );
}

/**
 * 🏠 Public Landing Page Route Controller
 */
function PublicRoute() {
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [authModalSuccessMsg, setAuthModalSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setAuthModalTab('login');
      setAuthModalSuccessMsg('Email verified successfully! You can now log in.');
      setIsAuthModalOpen(true);
    }
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoToDashboard = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <LandingPage
        onAuthenticated={() => navigate('/dashboard')}
        onGoToDashboard={handleGoToDashboard}
        onOpenAuthModal={(tab = 'login') => { setAuthModalTab(tab); setIsAuthModalOpen(true); }}
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => { setIsAuthModalOpen(false); setAuthModalSuccessMsg(''); }} 
        initialTab={authModalTab} 
        initialSuccessMsg={authModalSuccessMsg} 
      />
    </>
  );
}

/**
 * 🚀 Naqashly Life OS Main Routing Controller
 */
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<PublicRoute />} />

        {/* Protected Dashboard & Workspace Routes */}
        <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<ExecutiveDashboard />} />
          <Route path="/routine" element={<RoutineModule activeSubTab="overview" />} />
          <Route path="/finance" element={<FinanceModule activeSubTab="overview" />} />
          <Route path="/productivity" element={<ProductivityModule activeSubTab="overview" />} />
          <Route path="/journal" element={<JournalModule activeSubTab="overview" />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}
