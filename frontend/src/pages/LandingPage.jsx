import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import {
  LANDING_HERO,
  HOW_IT_WORKS_STEPS,
  FEATURE_PREVIEWS,
  VALUE_PILLARS,
  FAQS
} from '../constants/landingConstants';
import './LandingPage.css';

/**
 * 🌟 Executive Dynamic Motion & Human-Centered Public Home Page for Naqashly.
 * 
 * Features:
 * 1. 🔒 Privacy Policy & Terms & Conditions Glassmorphic Modals
 * 2. 📖 Warm, Crisp Copy ("Private Diary")
 * 3. 🌿 4 Pillars Auto-Rotating & Interactive Micro-Animations Suite
 * 4. 🔄 Dynamic Rotating Text Typewriter Animation for "Master Your [Routines / Money / Goals / Daily Life]"
 * 5. 💖 100% Human-Centered Benefit Copy (Zero technical jargon)
 * 6. 🎯 Direct Service Deep Links to App Modules
 * 
 * @author Barkat Bashir
 * @version 17.0.0
 */
export const LandingPage = ({ onAuthenticated, onGoToDashboard }) => {
  const [tab, setTab] = useState('register'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  
  const [activePreviewTab, setActivePreviewTab] = useState('routine');
  const [isAutoCyclingPillars, setIsAutoCyclingPillars] = useState(true);

  // FAQ Accordion Open State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const { isAuthenticated, user, login, register } = useAuth();

  // 🔄 DYNAMIC ROTATING WORD TYPEWRITER ANIMATION FOR HERO
  const ROTATING_WORDS = [
    { text: 'Routines', color: '#10B981', emoji: '🌿' },
    { text: 'Money', color: '#38BDF8', emoji: '💰' },
    { text: 'Goals', color: '#EC4899', emoji: '🎯' },
    { text: 'Private Diary', color: '#F59E0B', emoji: '📖' }
  ];

  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex(prev => (prev + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        if (onAuthenticated) onAuthenticated();
      } else {
        await register(name || email.split('@')[0], email, password);
        await login(email, password);
        if (onAuthenticated) onAuthenticated();
      }
    } catch (err) {
      console.error('[LandingPage] Auth error:', err);
      const msg = err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const openAuthWithTab = (targetTab) => {
    setTab(targetTab);
    setIsAuthModalOpen(true);
  };

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

  const activeWord = ROTATING_WORDS[wordIndex];

  return (
    <div className="landing-container">
      
      {/* AMBIENT GLOW ORBS BACKGROUND */}
      <div className="glow-orb glow-orb-emerald" />
      <div className="glow-orb glow-orb-indigo" />

      {/* 1. TOP HEADER NAVIGATION BAR */}
      <nav className="landing-nav">
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="landing-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="brand-icon"
          >
            N
          </motion.div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>Naqashly</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', marginLeft: '0.4rem' }}>EXECUTIVE</span>
          </div>
        </motion.div>

        {/* Center Nav Links */}
        <div className="landing-nav-links">
          <a href="#how-it-works">⚙️ How It Works</a>
          <a href="#features">✨ Product Features</a>
          <a href="#advantages">⚡ Why Naqashly</a>
          <a href="#faqs">❓ FAQs</a>
        </div>

        {/* Action Controls */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="landing-nav-actions">
          <ThemeSwitcher />

          {isAuthenticated ? (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Button variant="emerald" onClick={onGoToDashboard || onAuthenticated} style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>
                ⚡ Launch Workspace →
              </Button>
            </motion.div>
          ) : (
            <>
              <Button variant="secondary" onClick={() => openAuthWithTab('login')} style={{ padding: '0.6rem 1.15rem', fontSize: '0.85rem' }}>
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

      {/* 2. DYNAMIC ROTATING TEXT HERO SECTION */}
      <section className="landing-hero-section">
        
        {/* Hero Left Intro */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div whileHover={{ scale: 1.05 }} className="hero-badge" onClick={() => setIsPrivacyModalOpen(true)} style={{ cursor: 'pointer' }}>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ display: 'inline-block', marginRight: '4px' }}>
              🔒
            </motion.span>
            {LANDING_HERO.badge}
          </motion.div>

          {/* DYNAMIC ROTATING WORD TITLE */}
          <h1 className="hero-title" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minHeight: '130px' }}>
            <span>Master Your</span>
            <span style={{ position: 'relative', display: 'inline-block', height: '1.25em', overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeWord.text}
                  initial={{ y: 35, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -35, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    whiteSpace: 'nowrap',
                    color: activeWord.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
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
            </span>
          </h1>

          <p className="hero-subtitle">
            {LANDING_HERO.subtitle}
          </p>

          <div className="hero-cta-group">
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Button variant="emerald" onClick={onGoToDashboard || onAuthenticated} style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', fontWeight: '700' }}>
                  🚀 Launch Executive Workspace →
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
            <motion.div whileHover={{ y: -2 }} className="value-badge-item" onClick={() => setIsPrivacyModalOpen(true)} style={{ cursor: 'pointer' }}>
              <span className="value-check">✓</span> 100% Private Diary
            </motion.div>
          </div>
        </motion.div>

        {/* Hero Right Dynamic 3D Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6, scale: 1.01 }}
        >
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                  naqashly.app / workspace
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
                Your Unified Personal Life OS
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
      <section id="how-it-works" className="landing-microservices-section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="emerald">⚙️ Simple 3-Step Process</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            How Naqashly Brings Balance to Your Life
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Get started in under 60 seconds with total control over your routines, goals, and finances.
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="how-it-works-grid">
          {HOW_IT_WORKS_STEPS.map((stepItem, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="step-card">
              <span className="step-number">STEP {stepItem.step}</span>
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, delay: idx * 0.5 }} style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>
                {stepItem.icon}
              </motion.div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>{stepItem.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{stepItem.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 5. STREAMLINED 3 HIGH-IMPACT ADVANTAGE CARDS */}
      <section id="advantages" className="landing-feature-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="indigo">⚡ The Naqashly Advantage</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Why Executive Leaders Choose Naqashly
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Built to replace separate subscription apps with a single, private executive system.
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          
          <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
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

          <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', cursor: 'pointer' }} onClick={() => setIsPrivacyModalOpen(true)}>
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

          <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
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
      <section id="features" className="landing-feature-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="indigo">⚡ Interactive Product Preview</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Four Core Pillars. One Powerful Personal Workspace.
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Explore the live animated features across Naqashly's four primary domains below.
          </p>
        </div>

        {/* Feature Preview Selector Tabs with Dynamic Sliding Pill Animation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap', position: 'relative' }}>
          {FEATURE_PREVIEWS.map(p => {
            const isActive = activePreviewTab === p.key;
            return (
              <motion.button
                key={p.key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleManualSelectPillar(p.key)}
                style={{
                  position: 'relative',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  border: `1px solid ${isActive ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  borderRadius: '14px',
                  padding: '0.65rem 1.2rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '13px',
                      border: '2px solid #10B981',
                      pointerEvents: 'none'
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Live Dynamic Mockup Preview Box with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePreviewTab}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="landing-auth-card"
            style={{ padding: '2.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}
          >
            {/* PILLAR 1: 🌿 ROUTINE & HABIT TRACKER ANIMATED MOCKUP */}
            {activePreviewTab === 'routine' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>🌿</span> Daily Routine Engine & Flexible Protection
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      24-hour visual routine timelines with 2-hour streak grace window protection.
                    </p>
                  </div>
                  <Badge variant="emerald">
                    <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 2 }}>🟢</motion.span>
                    Live Habit Sync
                  </Badge>
                </div>

                {/* Animated Habit Timeline Progress Bar */}
                <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.6rem' }}>
                    <span style={{ color: 'var(--text-heading)' }}>Today's Habit Progress</span>
                    <span style={{ color: '#10B981' }}>85% Completed</span>
                  </div>

                  <div style={{ height: '10px', background: 'var(--bg-surface-elevated)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #10B981 0%, #38BDF8 100%)', borderRadius: '5px' }}
                    />
                  </div>

                  {/* Animated Habit Checklist Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-heading)' }}>✓ Morning Reflection & Prayer</span>
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800' }}>05:30 AM • Completed</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-heading)' }}>✓ Executive Workout Session</span>
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800' }}>07:00 AM • Completed</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-heading)' }}>⏳ 2-Hour Deep Work Focus</span>
                      <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '800' }}>09:00 AM • 2-Hr Grace Protected</span>
                    </motion.div>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Habit Tracker →
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {/* PILLAR 2: 🏦 MONEY & LEDGER ANIMATED MOCKUP */}
            {activePreviewTab === 'finance' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>🏦</span> Simple Debt & Money Balance Summaries (INR ₹)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Clear double-entry running net balance statements and real-time monthly category budgets.
                    </p>
                  </div>
                  <Badge variant="emerald">Live Money Vault</Badge>
                </div>

                {/* Animated Metric Cards Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <motion.div whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Inflow</div>
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>+₹45,000.00</motion.div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Outflow</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>-₹12,400.00</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monthly Budget Health</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>32.6% Used</div>
                  </motion.div>
                </div>

                {/* Animated Transactions Feed */}
                <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Recent Ledger Activity</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: '700', padding: '0.4rem 0.6rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-heading)' }}>💸 Lent to Rahul (Project Advance)</span>
                    <span style={{ color: '#EF4444', fontFamily: 'var(--font-mono)' }}>-₹2,500.00</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: '700', padding: '0.4rem 0.6rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-heading)' }}>📥 Received Settlement from Amit</span>
                    <span style={{ color: '#10B981', fontFamily: 'var(--font-mono)' }}>+₹1,200.00</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Money Ledger →
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {/* PILLAR 3: 🎯 FOCUS GOALS ANIMATED MOCKUP */}
            {activePreviewTab === 'productivity' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>🎯</span> Focus & Goal Progress Trackers
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Interactive progress sliders (0% - 100%) and daily actionable task checklists.
                    </p>
                  </div>
                  <Badge variant="indigo">Live Goal Sync</Badge>
                </div>

                {/* Animated Goal Progress Sliders */}
                <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-heading)' }}>🚀 Complete Architecture Blueprint</span>
                      <span style={{ color: '#38BDF8' }}>75% Completed</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: '0%' }} animate={{ width: '75%' }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', background: '#38BDF8', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-heading)' }}>💰 Financial Freedom Target</span>
                      <span style={{ color: '#10B981' }}>60% Completed</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: '0%' }} animate={{ width: '60%' }} transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }} style={{ height: '100%', background: '#10B981', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-heading)' }}>📖 Executive Reading Challenge (12 Books)</span>
                      <span style={{ color: '#EC4899' }}>40% Completed</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: '0%' }} animate={{ width: '40%' }} transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }} style={{ height: '100%', background: '#EC4899', borderRadius: '4px' }} />
                    </div>
                  </div>

                </div>

                <div style={{ textAlign: 'center' }}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Focus Goals →
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {/* PILLAR 4: 📖 PRIVATE DIARY ANIMATED MOCKUP */}
            {activePreviewTab === 'journal' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📖</span> Private Diary & Encrypted Journal
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      100% browser-encrypted private diary entries with BIP-39 emergency recovery phrase protection.
                    </p>
                  </div>
                  <Badge variant="pink">100% Private Diary</Badge>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <motion.div animate={{ rotateY: [0, 180, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ fontSize: '3.2rem', marginBottom: '0.75rem', display: 'inline-block' }}>
                    📖
                  </motion.div>
                  <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-heading)' }}>Your Encrypted Personal Reflection Diary</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '1.25rem' }}>Write your daily thoughts, ideas, and memories with complete privacy. Your data is 100% encrypted in your browser.</div>
                  
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#EC4899', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                    📄 Includes BIP-39 24-Word Emergency Recovery Sheet
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Private Diary →
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 7. BALANCED CONSUMER VALUE PILLARS SECTION */}
      <section id="pillars" className="landing-microservices-section">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="amber">🛡️ Four Pillars of Growth</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Why People Choose Naqashly
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Designed from the ground up for habit consistency, financial clarity, and mental focus.
          </p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="microservice-grid">
          {VALUE_PILLARS.map((item, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="microservice-card">
              <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.2rem' }}>{item.title}</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '0.85rem' }}>{item.tag}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 8. BALANCED FAQ ACCORDION SECTION */}
      <section id="faqs" className="landing-microservices-section" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Badge variant="indigo">❓ Clear Answers</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Everything you need to know about routines, ledgers, goals, and privacy.
          </p>
        </div>

        <div className="faq-container">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="faq-question-btn"
                >
                  <span>{faq.question}</span>
                  <span style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                    ▼
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="faq-answer"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. FOOTER WITH PRIVACY POLICY & TERMS LINKS */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', textAlign: 'center', padding: '2.5rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--text-heading)' }}>Naqashly</strong> • Personal Productivity & Financial Control Suite
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '0.85rem 0', fontSize: '0.82rem' }}>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' }}
          >
            🔒 Privacy Policy (What We Collect)
          </button>
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', textDecoration: 'underline', fontWeight: '700' }}
          >
            📜 Terms & Conditions
          </button>
        </div>

        <div>
          Authored by <strong style={{ color: 'var(--text-heading)' }}>Barkat Bashir</strong> &copy; 2026. All rights reserved.
        </div>
      </footer>

      {/* 10. POPUP AUTH MODAL FOR LOG IN / SIGN UP CTA BUTTONS */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal">
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">{tab === 'register' ? '✨ Sign Up Free Account' : '🔐 Log In to Naqashly'}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Encrypted Private Data Vault</p>
                </div>
                <button type="button" onClick={() => setIsAuthModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.65rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="modal-form">
                {tab === 'register' && (
                  <div>
                    <label className="form-label">Full Name</label>
                    <input type="text" placeholder="Barkat Bashir" value={name} onChange={e => setName(e.target.value)} className="form-input" required />
                  </div>
                )}

                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="form-input" required />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input type="password" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
                </div>

                <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErrorMsg(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {tab === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                  </button>

                  <Button type="submit" variant={tab === 'register' ? 'emerald' : 'indigo'} disabled={loading}>
                    {loading ? 'Processing...' : tab === 'register' ? 'Sign Up →' : 'Log In →'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. PRIVACY POLICY MODAL (CLEARLY HIGHLIGHTING WHAT WE COLLECT & WHAT WE DON'T) */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal" style={{ maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🔒 Privacy Policy & Data Collection
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Last updated: July 2026</p>
                </div>
                <button type="button" onClick={() => setIsPrivacyModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                
                {/* HIGHLIGHTED BOX: WHAT WE COLLECT */}
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color: '#10B981', fontWeight: '800', fontSize: '0.98rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ✅ WHAT WE COLLECT
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>Account Basics:</strong> Your email address and hashed password to securely authenticate your workspace.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>Workspace Items:</strong> Habits, routines, contact balance ledgers, target category budgets, and goal progress sliders created inside your workspace.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>Encrypted Diary Entries:</strong> Private diary notes and reflections, which are hardware-encrypted in your browser using AES-256-GCM before saving to your isolated database schema.
                    </li>
                  </ul>
                </div>

                {/* HIGHLIGHTED BOX: WHAT WE NEVER COLLECT */}
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ color: '#EF4444', fontWeight: '800', fontSize: '0.98rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ❌ WHAT WE NEVER COLLECT OR DO
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>NO Third-Party Cookies or Ad Trackers:</strong> We do not use Google Analytics, Facebook Pixels, or any ad tracking scripts.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>NO Selling of Personal Data:</strong> Your routines, financial ledgers, and notes are NEVER sold, rented, or monetized.
                    </li>
                    <li>
                      <strong style={{ color: 'var(--text-heading)' }}>NO Plaintext Diary Reading:</strong> We cannot read your client-side encrypted diary notes. Only you hold the decryption key.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    🛡️ Security & Encryption Architecture
                  </h4>
                  <p>
                    All API communication passes through secure HTTPS TLS 1.3 encryption with RS256 token authentication. Each user's data is isolated in dedicated PostgreSQL schemas.
                  </p>
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <Button variant="emerald" onClick={() => setIsPrivacyModalOpen(false)}>
                    I Understand →
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 12. TERMS & CONDITIONS MODAL */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-dialog wallet-modal" style={{ maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📜 Terms & Conditions of Service
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Last updated: July 2026</p>
                </div>
                <button type="button" onClick={() => setIsTermsModalOpen(false)} className="modal-close-btn">✕</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                
                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    1. 100% User Data Ownership
                  </h4>
                  <p>
                    You retain complete, exclusive ownership of all habits, routines, ledger transactions, goals, and diary notes created in Naqashly.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    2. Zero Lock-In & Export Rights
                  </h4>
                  <p>
                    You have the right to export all your financial statements and routine reports anytime into formatted Excel (.xls) or JSON files with 1 click.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    3. Account Security Responsibility
                  </h4>
                  <p>
                    You are responsible for keeping your login credentials and BIP-39 24-word recovery sheet secure. Because your diary is encrypted client-side, lost master keys cannot be recovered by server administrators.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    4. Service Availability & Free Tier
                  </h4>
                  <p>
                    Naqashly is provided free for personal productivity and financial tracking with zero hidden fees or automatic recurring credit card charges.
                  </p>
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <Button variant="indigo" onClick={() => setIsTermsModalOpen(false)}>
                    Accept & Close →
                  </Button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
