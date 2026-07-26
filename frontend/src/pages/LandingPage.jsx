import React, { useState } from 'react';
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
 * 🌟 Executive Dynamic Motion Public Home Page for Naqashly.
 * 
 * Features Rich Framer Motion & CSS Animations:
 * 1. 🌌 Animated Background Orbs & Shimmer Gradient Typography
 * 2. 📱 Interactive 3D Showcase Card with Live Pulse Status Indicators
 * 3. 🎯 Animated Layout Switcher for Product Feature Mockups
 * 4. ⚡ Scroll-Triggered Entrance Animations for Advantage & Step Cards
 * 
 * @author Barkat Bashir
 * @version 12.0.0
 */
export const LandingPage = ({ onAuthenticated, onGoToDashboard }) => {
  const [tab, setTab] = useState('register'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('routine');

  // FAQ Accordion Open State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const { isAuthenticated, user, login, register } = useAuth();

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

      {/* 2. STREAMLINED DYNAMIC HERO SECTION */}
      <section className="landing-hero-section">
        
        {/* Hero Left Intro */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div whileHover={{ scale: 1.05 }} className="hero-badge">
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ display: 'inline-block', marginRight: '4px' }}>
              ✨
            </motion.span>
            {LANDING_HERO.badge}
          </motion.div>

          <h1 className="hero-title">
            Master Your <span className="hero-title-gradient">Routines</span>, Money, Goals & Daily Life.
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

          {/* Balanced Value Badges */}
          <div className="hero-value-badges">
            <motion.div whileHover={{ y: -2 }} className="value-badge-item">
              <span className="value-check">✓</span> 24-Hour Routine Timelines
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="value-badge-item">
              <span className="value-check">✓</span> Bank Net Balance Ledgers
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="value-badge-item">
              <span className="value-check">✓</span> AES-256 Vault Protection
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
              
              <motion.div whileHover={{ scale: 1.03, background: 'rgba(16, 185, 129, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActivePreviewTab('routine')}>
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }} style={{ fontSize: '1.4rem' }}>🌿</motion.span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Routine OS</div>
                  <div style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: '700' }}>2-Hr Grace Window</div>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, background: 'rgba(56, 189, 248, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActivePreviewTab('finance')}>
                <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 3 }} style={{ fontSize: '1.4rem' }}>🏦</motion.span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Bank Ledger</div>
                  <div style={{ fontSize: '0.68rem', color: '#38BDF8', fontWeight: '700' }}>Double-Entry INR (₹)</div>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, background: 'rgba(236, 72, 153, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActivePreviewTab('productivity')}>
                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ fontSize: '1.4rem' }}>🎯</motion.span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Focus Goals</div>
                  <div style={{ fontSize: '0.68rem', color: '#EC4899', fontWeight: '700' }}>0% - 100% Sliders</div>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, background: 'rgba(245, 158, 11, 0.08)' }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => setActivePreviewTab('journal')}>
                <motion.span animate={{ rotateY: [0, 180, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ fontSize: '1.4rem', display: 'inline-block' }}>🔒</motion.span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-heading)' }}>Private Vault</div>
                  <div style={{ fontSize: '0.68rem', color: '#F59E0B', fontWeight: '700' }}>AES-256 Encrypted</div>
                </div>
              </motion.div>

            </div>

            {/* Live Interactive CTA Banner inside Showcase */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                Unified Executive Life OS
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.85rem 0' }}>
                Isolated PostgreSQL storage • 0ms theme engine • BIP-39 recovery key
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

      {/* 3. HIGHLIGHT BANNER */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="stats-banner">
        <motion.div whileHover={{ scale: 1.05 }} className="stat-item">
          <span className="stat-icon">🌿</span>
          <div>
            <div className="stat-title">Habit Protection</div>
            <div className="stat-value">2-Hour Grace Window</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="stat-item">
          <span className="stat-icon">🏦</span>
          <div>
            <div className="stat-title">Bank Ledger</div>
            <div className="stat-value">Double-Entry Statements</div>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="stat-item">
          <span className="stat-icon">🔒</span>
          <div>
            <div className="stat-title">Zero-Knowledge Vault</div>
            <div className="stat-value">AES-256-GCM E2EE</div>
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
            Built to replace 4 separate subscription apps with a single, private executive system.
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

          <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2.8rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
              Zero-Knowledge AES-256 E2EE
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Your private journal and financial notes are encrypted directly in your browser using PBKDF2 & AES-256-GCM with zero ad tracking.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#38BDF8', fontWeight: '800', marginTop: 'auto' }}>
              ✓ Hardware Web Crypto API
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

      {/* 6. INTERACTIVE FEATURE PREVIEW SUITE WITH DIRECT MODULE LAUNCH */}
      <section id="features" className="landing-feature-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Badge variant="indigo">⚡ Interactive Product Preview</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Four Core Pillars. One Powerful Personal Workspace.
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Click below to preview live features across Naqashly's four primary domains.
          </p>
        </div>

        {/* Feature Preview Selector Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {FEATURE_PREVIEWS.map(p => (
            <motion.button
              key={p.key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActivePreviewTab(p.key)}
              className={`preview-tab-btn ${activePreviewTab === p.key ? 'active' : 'inactive'}`}
            >
              {p.icon} {p.label}
            </motion.button>
          ))}
        </div>

        {/* Live Mockup Preview Box with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePreviewTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="landing-auth-card"
            style={{ padding: '2.5rem' }}
          >
            {activePreviewTab === 'routine' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      🌿 Daily Routine Engine & Streak Protection
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      24-hour visual routine timelines, 2-hour grace window logging, and streak freeze passes.
                    </p>
                  </div>
                  <Badge variant="emerald">Live Habit Sync</Badge>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                    ⏰
                  </motion.div>
                  <div style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--text-heading)' }}>24-Hour Visual Habit Timeline Active</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '1.5rem' }}>Includes 2-Hour Grace Window logging to prevent missed streaks.</div>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Routine OS →
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {activePreviewTab === 'finance' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      🏦 Interpersonal Bank Ledger & Target Category Budgets (INR ₹)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Double-entry running balance statements, 2-term event directions, and real-time category health tracking.
                    </p>
                  </div>
                  <Badge variant="emerald">Live Ledger Vault</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                  <motion.div whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Inflow</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>+₹45,000.00</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Outflow</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>-₹12,400.00</div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Target Budget</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>₹38,000.00</div>
                  </motion.div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Bank Ledger →
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {activePreviewTab === 'productivity' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      🎯 Focus & Goal Progress Trackers
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Interactive timeline goals (0% - 100%) with real-time sync and task priority checklists.
                    </p>
                  </div>
                  <Badge variant="indigo">Live Goal Sync</Badge>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                    🎯
                  </motion.div>
                  <div style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--text-heading)' }}>Real-Time Goal Sliders & Task Board</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '1.5rem' }}>Instant progress saving with automatic debouncing.</div>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Focus Goals →
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}

            {activePreviewTab === 'journal' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>
                      📝 Knowledge & Mind Vault
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Zero-Knowledge AES-256 E2EE private journal notes with BIP-39 recovery phrases.
                    </p>
                  </div>
                  <Badge variant="pink">AES-256 Vault</Badge>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <motion.div animate={{ rotateY: [0, 180, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ fontSize: '3rem', marginBottom: '0.75rem', display: 'inline-block' }}>
                    🧠
                  </motion.div>
                  <div style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--text-heading)' }}>Zero-Knowledge Reflection & Note Vault</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '1.5rem' }}>Hardware-accelerated AES-256 encryption.</div>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Button variant="emerald" onClick={() => isAuthenticated ? (onGoToDashboard || onAuthenticated)() : openAuthWithTab('register')}>
                      🚀 Launch Mind Vault →
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

      {/* 9. FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', textAlign: 'center', padding: '2.5rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <strong style={{ color: 'var(--text-heading)' }}>Naqashly</strong> • Personal Productivity & Financial Control Suite
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

    </div>
  );
};
