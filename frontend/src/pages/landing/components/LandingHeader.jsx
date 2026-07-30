import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { ThemeSwitcher } from '../../../components/ui/ThemeSwitcher';

export const LandingHeader = ({ isAuthenticated, onGoToDashboard, onAuthenticated, onOpenAuthModal }) => {
  const openAuthWithTab = (targetTab) => {
    if (onOpenAuthModal) {
      onOpenAuthModal(targetTab);
    }
  };

  return (
    <nav className="landing-nav">
      {/* Brand Logo - Icon Only */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="landing-brand"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ cursor: 'pointer' }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="brand-icon"
        >
          N
        </motion.div>
      </motion.div>

      {/* Center Nav Links */}
      <div className="landing-nav-links">
        <a href="#how-it-works">⚙️ How It Works</a>
        <a href="#features">✨ Features</a>
        <a href="#reviews">⭐ Reviews</a>
        <a href="#faqs">❓ FAQs</a>
      </div>

      {/* Action Controls */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="landing-nav-actions">
        <ThemeSwitcher />

        {isAuthenticated ? (
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <Button variant="emerald" onClick={onGoToDashboard || onAuthenticated} style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
              Dashboard ➔
            </Button>
          </motion.div>
        ) : (
          <>
            <Button className="nav-login-btn" variant="secondary" onClick={() => openAuthWithTab('login')} style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem' }}>
              Log In
            </Button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button variant="emerald" onClick={() => openAuthWithTab('register')} style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem' }}>
                Sign Up Free →
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>
    </nav>
  );
};
