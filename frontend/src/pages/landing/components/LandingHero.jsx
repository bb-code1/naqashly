import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LANDING_HERO } from '../../../constants/landingConstants';

export const LandingHero = ({
  isAuthenticated,
  onGoToDashboard,
  onAuthenticated,
  onOpenAuthModal,
  onOpenPrivacyModal,
  handleManualSelectPillar
}) => {
  const ROTATING_WORDS = [
    { text: 'Routines', color: '#10B981', emoji: '🌿' },
    { text: 'Money', color: '#38BDF8', emoji: '💰' },
    { text: 'Goals', color: '#EC4899', emoji: '🎯' },
    { text: 'Private Diary', color: '#F59E0B', emoji: '📖' }
  ];

  const [wordIndex, setWordIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const openAuthWithTab = (targetTab) => {
    if (onOpenAuthModal) {
      onOpenAuthModal(targetTab);
    }
  };

  const activeWord = ROTATING_WORDS[wordIndex];

  return (
    <section className="landing-hero-section">
      {/* Hero Left Intro */}
      <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
        <motion.div whileHover={{ scale: 1.05 }} className="hero-badge" onClick={onOpenPrivacyModal} style={{ cursor: 'pointer' }}>
          <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ display: 'inline-block', marginRight: '4px' }}>
            🔒
          </motion.span>
          {LANDING_HERO.badge}
        </motion.div>

        {/* DYNAMIC ROTATING WORD TITLE */}
        <h1 className="hero-title" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minHeight: '130px' }}>
          <span>Master Your</span>
          <span className="hero-word-wrapper">
            {!isMounted ? (
              // 🌿 Static Paint (Instant rendering for LCP)
              <span className="hero-word-item" style={{ color: ROTATING_WORDS[0].color }}>
                <span style={{ fontSize: '0.9em' }}>{ROTATING_WORDS[0].emoji}</span>
                <span style={{
                  background: `linear-gradient(135deg, ${ROTATING_WORDS[0].color} 0%, #FFFFFF 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {ROTATING_WORDS[0].text}.
                </span>
              </span>
            ) : (
              // ✨ Active Animation (Triggered only after mount)
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeWord.text}
                  initial={{ y: 20, opacity: 0, filter: 'blur(3px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -20, opacity: 0, filter: 'blur(3px)' }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="hero-word-item"
                  style={{ color: activeWord.color }}
                >
                  <span style={{ fontSize: '0.9em' }}>{activeWord.emoji}</span>
                  <span style={{
                    background: `linear-gradient(135deg, ${activeWord.color} 0%, #FFFFFF 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {activeWord.text}.
                  </span>
                </motion.span>
              </AnimatePresence>
            )}
          </span>
        </h1>

        <p className="hero-subtitle">
          {LANDING_HERO.subtitle}
        </p>

        <div className="hero-cta-group">
          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button variant="emerald" onClick={onGoToDashboard || onAuthenticated} style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', fontWeight: '700' }}>
                Go to Dashboard ➔
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Button variant="emerald" onClick={() => openAuthWithTab('register')} style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', fontWeight: '700' }}>
                  ✨ Create Free Account →
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="secondary" onClick={() => openAuthWithTab('login')} style={{ padding: '0.9rem 1.5rem', fontSize: '0.95rem' }}>
                  🔐 Existing User Login
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Human-Centered Value Badges */}
        <div className="hero-value-badges">
          <motion.div whileHover={{ y: -2 }} className="value-badge-item">
            <span className="value-check">✓</span> Flexible Habit Timelines
          </motion.div>
          <motion.div whileHover={{ y: -2 }} className="value-badge-item">
            <span className="value-check">✓</span> Clear Debt & Money Summaries
          </motion.div>
          <motion.div whileHover={{ y: -2 }} className="value-badge-item" onClick={onOpenPrivacyModal} style={{ cursor: 'pointer' }}>
            <span className="value-check">✓</span> 100% Private Diary
          </motion.div>
        </div>
      </motion.div>

      {/* Hero Right Dynamic 3D Showcase Card */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        whileHover={{ y: -6, scale: 1.01 }}
      >
        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                Dashboard
              </span>
            </div>
            <Badge variant="emerald">
              <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ marginRight: '4px' }}>
                🟢
              </motion.span>
              Live 4-in-1 Suite
            </Badge>
          </div>

          {/* Dynamic Interactive App Modules Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
            
            <motion.div whileHover={{ scale: 1.03, background: 'rgba(16, 185, 129, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => handleManualSelectPillar('routine')}>
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ fontSize: '1.4rem' }}>🌿</motion.span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Habit Tracker</div>
                <div style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '700' }}>Streak Protection</div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03, background: 'rgba(56, 189, 248, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => handleManualSelectPillar('finance')}>
              <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 3 }} style={{ fontSize: '1.4rem' }}>🏦</motion.span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Money Ledger</div>
                <div style={{ fontSize: '0.68rem', color: '#38BDF8', fontWeight: '700' }}>Simple Statements</div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03, background: 'rgba(236, 72, 153, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => handleManualSelectPillar('productivity')}>
              <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ fontSize: '1.4rem' }}>🎯</motion.span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Focus Goals</div>
                <div style={{ fontSize: '0.68rem', color: '#EC4899', fontWeight: '700' }}>Progress Sliders</div>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03, background: 'rgba(245, 158, 11, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => handleManualSelectPillar('journal')}>
              <motion.span animate={{ rotateY: [0, 180, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ fontSize: '1.4rem', display: 'inline-block' }}>📖</motion.span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Private Diary</div>
                <div style={{ fontSize: '0.68rem', color: '#F59E0B', fontWeight: '700' }}>100% Encrypted</div>
              </div>
            </motion.div>

          </div>

          {/* Live Interactive CTA Banner inside Showcase */}
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
              Your Ultimate Daily Companion
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.85rem 0' }}>
              Zero ads • Zero data selling • Total privacy guarantee
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="emerald" onClick={() => openAuthWithTab('register')} style={{ width: '100%', padding: '0.7rem', fontSize: '0.85rem', justifyContent: 'center' }}>
                🚀 Access All 4 Apps Free →
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
