import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LandingHeader } from './landing/components/LandingHeader';
import { LandingHero } from './landing/components/LandingHero';
import { LandingHowItWorks } from './landing/components/LandingHowItWorks';
import { LandingFeatures } from './landing/components/LandingFeatures';
import { LandingTelegramBot } from './landing/components/LandingTelegramBot';
import { LandingReviews } from './landing/components/LandingReviews';
import { LandingValuePillars } from './landing/components/LandingValuePillars';
import { LandingFaq } from './landing/components/LandingFaq';
import { LandingPrivacyTermsModals } from './landing/components/LandingPrivacyTermsModals';
import './LandingPage.css';

/**
 * 🌟 Executive Dynamic Motion & Human-Centered Public Home Page for Naqashly.
 * Refactored & Modularized structure.
 * 
 * @author Barkat Bashir
 * @version 20.0.0
 */
export const LandingPage = ({ onAuthenticated, onGoToDashboard, onOpenAuthModal }) => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  
  const [activePreviewTab, setActivePreviewTab] = useState('routine');
  const [isAutoCyclingPillars, setIsAutoCyclingPillars] = useState(true);

  const { isAuthenticated } = useAuth();

  // 🌿 4 PILLARS AUTO-CYCLING TAB ANIMATION
  const PILLAR_KEYS = ['routine', 'finance', 'productivity', 'journal'];

  useEffect(() => {
    if (!isAutoCyclingPillars) return;
    const pillarTimer = setInterval(() => {
      setActivePreviewTab(prev => {
        const currentIdx = PILLAR_KEYS.indexOf(prev);
        return PILLAR_KEYS[(currentIdx + 1) % PILLAR_KEYS.length];
      });
    }, 4500);
    return () => clearInterval(pillarTimer);
  }, [isAutoCyclingPillars]);

  const handleManualSelectPillar = (key) => {
    setIsAutoCyclingPillars(false);
    setActivePreviewTab(key);
  };

  useEffect(() => {
    const handleInitialScroll = () => {
      const hash = window.location.hash || "";
      const path = window.location.pathname || "";
      
      let targetId = "";
      if (hash.includes("how-it-works") || path.includes("how-it-works")) targetId = "how-it-works";
      else if (hash.includes("features") || path.includes("features")) targetId = "features";
      else if (hash.includes("reviews") || path.includes("reviews")) targetId = "reviews";
      else if (hash.includes("faqs") || path.includes("faqs")) targetId = "faqs";

      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 350);
        }
      }
    };

    handleInitialScroll();
    window.addEventListener('hashchange', handleInitialScroll);
    return () => window.removeEventListener('hashchange', handleInitialScroll);
  }, []);

  // Staggered Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="landing-container">
      
      {/* AMBIENT GLOW ORBS BACKGROUND */}
      <div className="glow-orb glow-orb-emerald" />
      <div className="glow-orb glow-orb-indigo" />

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <LandingHeader 
        isAuthenticated={isAuthenticated}
        onGoToDashboard={onGoToDashboard}
        onAuthenticated={onAuthenticated}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* 2. DYNAMIC ROTATING TEXT HERO SECTION */}
      <LandingHero 
        isAuthenticated={isAuthenticated}
        onGoToDashboard={onGoToDashboard}
        onAuthenticated={onAuthenticated}
        onOpenAuthModal={onOpenAuthModal}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        handleManualSelectPillar={handleManualSelectPillar}
      />

      {/* 3. HUMAN-CENTERED HIGHLIGHT BANNER */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="stats-banner">
        <motion.div whileHover={{ scale: 1.05 }} className="stat-item">
          <span className="stat-icon">🌿</span>
          <div>
            <div className="stat-title">Habit Protection</div>
            <div className="stat-value">Flexible Streak Protection</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="stat-item">
          <span className="stat-icon">🏦</span>
          <div>
            <div className="stat-title">Money Ledger</div>
            <div className="stat-value">Clear Debt Summaries</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="stat-item" onClick={() => setIsPrivacyModalOpen(true)} style={{ cursor: 'pointer' }}>
          <span className="stat-icon">📖</span>
          <div>
            <div className="stat-title">Private Diary</div>
            <div className="stat-value">100% Encrypted & Safe</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="stat-item">
          <span className="stat-icon">🎨</span>
          <div>
            <div className="stat-title">Theme Engine</div>
            <div className="stat-value">0ms Instant Switch</div>
          </div>
        </motion.div>
      </motion.div>

      {/* 4. HOW IT WORKS 3-STEP WALKTHROUGH SECTION */}
      <LandingHowItWorks 
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      {/* 5. STREAMLINED 3 HIGH-IMPACT ADVANTAGE CARDS */}
      <section id="advantages" className="landing-feature-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="indigo">⚡ The Naqashly Advantage</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Why High-Performers Choose Naqashly
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Unify your routine, finance, goals, and thoughts in a single private workspace.
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="advantages-grid">
          
          <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="advantage-card">
            <div style={{ fontSize: '2.8rem' }}>🌐</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
              4 Core Apps in 1 Workspace
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Stop context-switching between separate habit trackers, bill splitters, goal spreadsheets, and note apps. Naqashly unifies everything.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '800', marginTop: 'auto' }}>
              ✓ Zero Subscription Fees
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="advantage-card advantage-card-clickable" onClick={() => setIsPrivacyModalOpen(true)}>
            <div style={{ fontSize: '2.8rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
              Total Data Privacy Guarantee
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Your private journal and financial records are encrypted directly in your browser. We never sell your data or show annoying ads.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: '800', marginTop: 'auto' }}>
              ✓ Bank-Grade Security & Peace of Mind
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="advantage-card">
            <div style={{ fontSize: '2.8rem' }}>🎨</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
              0ms Executive Theme Engine
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Instant theme switching across Obsidian Dark, Luxe Light, Cyberpunk, and Forest modes with zero layout shift or page flickering.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#EC4899', fontWeight: '800', marginTop: 'auto' }}>
              ✓ 4 Curated Design Themes
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* 6. DYNAMIC ANIMATED 4 CORE PILLARS FEATURE SHOWCASE */}
      <LandingFeatures 
        activePreviewTab={activePreviewTab}
        handleManualSelectPillar={handleManualSelectPillar}
        isAuthenticated={isAuthenticated}
        onGoToDashboard={onGoToDashboard}
        onAuthenticated={onAuthenticated}
        onOpenAuthModal={onOpenAuthModal}
      />

      <LandingTelegramBot />

      {/* 🌟 7. MODERN EXECUTIVE REVIEWS & SOCIAL PROOF GRID SECTION */}
      <LandingReviews 
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      {/* 8. BALANCED CONSUMER VALUE PILLARS SECTION */}
      <LandingValuePillars 
        containerVariants={containerVariants}
        itemVariants={itemVariants}
      />

      {/* 9. BALANCED FAQ ACCORDION SECTION */}
      <LandingFaq />

      {/* 10. PREMIUM EXECUTIVE FOOTER */}
      <footer className="premium-footer">
        <div className="footer-container">
          <div className="footer-top-row">
            <div className="footer-brand">
              <span className="footer-brand-title">Naqashly Life OS</span>
              <span className="footer-brand-slogan">Your ultimate daily companion. Secure. Private. Unified.</span>
            </div>
            
            <div className="footer-nav">
              <button
                type="button"
                className="footer-nav-btn privacy"
                onClick={() => setIsPrivacyModalOpen(true)}
              >
                🔒 Privacy Policy
              </button>
              <button
                type="button"
                className="footer-nav-btn terms"
                onClick={() => setIsTermsModalOpen(true)}
              >
                📜 Terms &amp; Conditions
              </button>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom-row">
            <div className="footer-copyright">
              Copyright &copy; 2026 Naqashly. All rights reserved.
            </div>
            <div>
              <a 
                href="https://www.linkedin.com/in/barkat-bashir-070a68178/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-linkedin-link"
              >
                <span>🔗</span> Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 11. PRIVACY & TERMS MODALS */}
      <LandingPrivacyTermsModals 
        isPrivacyModalOpen={isPrivacyModalOpen}
        setIsPrivacyModalOpen={setIsPrivacyModalOpen}
        isTermsModalOpen={isTermsModalOpen}
        setIsTermsModalOpen={setIsTermsModalOpen}
      />

    </div>
  );
};

// Helper badge component used inline in advantages/features
const Badge = ({ variant, children }) => {
  return (
    <span className={`badge badge-${variant}`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: variant === 'indigo' ? 'var(--accent-indigo-glow)' : 'var(--accent-emerald-glow)',
      border: `1px solid ${variant === 'indigo' ? 'var(--accent-indigo)' : 'var(--accent-emerald)'}`,
      padding: '0.35rem 0.9rem',
      borderRadius: '9999px',
      fontSize: '0.8rem',
      fontWeight: '700',
      color: variant === 'indigo' ? 'var(--accent-indigo)' : 'var(--accent-emerald)'
    }}>
      {children}
    </span>
  );
};
