import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { FEATURE_PREVIEWS } from '../../../constants/landingConstants';

export const LandingFeatures = ({
  activePreviewTab,
  handleManualSelectPillar,
  isAuthenticated,
  onGoToDashboard,
  onAuthenticated,
  onOpenAuthModal
}) => {
  const activeTabRef = React.useRef(null);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (activeTabRef.current && containerRef.current) {
        const container = containerRef.current;
        const element = activeTabRef.current;
        
        const containerWidth = container.clientWidth;
        const elementOffsetLeft = element.offsetLeft;
        const elementWidth = element.clientWidth;
        
        const targetScrollLeft = elementOffsetLeft - (containerWidth / 2) + (elementWidth / 2);
        
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, [activePreviewTab]);

  const tabColors = {
    routine: 'var(--accent-emerald)',
    finance: 'var(--accent-indigo)',
    productivity: '#EC4899',
    journal: '#F59E0B'
  };

  const openAuthWithTab = (targetTab) => {
    if (onOpenAuthModal) {
      onOpenAuthModal(targetTab);
    }
  };

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      if (onGoToDashboard) onGoToDashboard();
      else if (onAuthenticated) onAuthenticated();
    } else {
      openAuthWithTab('register');
    }
  };

  return (
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
      <div className="preview-tabs-container" ref={containerRef} style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap', position: 'relative' }}>
        {FEATURE_PREVIEWS.map(p => {
          const isActive = activePreviewTab === p.key;
          const activeColor = tabColors[p.key];
          return (
            <motion.button
              key={p.key}
              ref={isActive ? activeTabRef : null}
              className="preview-tab-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleManualSelectPillar(p.key)}
              style={{
                position: 'relative',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                color: isActive ? activeColor : 'var(--text-muted)',
                border: `1px solid ${isActive ? activeColor : 'var(--border-subtle)'}`,
                borderRadius: '14px',
                padding: '0.65rem 1.2rem',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: isActive ? `0 0 20px ${activeColor}40` : 'none',
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
                    border: `2px solid ${activeColor}`,
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
      <div
        className="landing-auth-card"
        style={{ padding: '2.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activePreviewTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mockup-content-wrapper"
          >
            {/* PILLAR 1: 🌿 ROUTINE & HABIT TRACKER ANIMATED MOCKUP */}
            {activePreviewTab === 'routine' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🌿</span> Habits & Routine Engine
                  </h3>
                  <p className="mobile-hide" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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
                <div className="mobile-hide" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--text-heading)' }}>Today's Habit Progress</span>
                  <span style={{ color: '#10B981' }}>85% Completed</span>
                </div>

                <div className="mobile-hide" style={{ height: '10px', background: 'var(--bg-surface-elevated)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.25rem' }}>
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

                  <motion.div className="mobile-hide" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-heading)' }}>⏳ 2-Hour Deep Work Focus</span>
                    <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: '800' }}>09:00 AM • 2-Hr Grace Protected</span>
                  </motion.div>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button variant="emerald" onClick={handleLaunchApp}>
                    🚀 Launch Habit Tracker →
                  </Button>
                </motion.div>
              </div>
            </div>
          )}

          {/* PILLAR 2: 🏦 MONEY & LEDGER ANIMATED MOCKUP */}
          {activePreviewTab === 'finance' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🏦</span> Money Ledger & Debt Tracker
                  </h3>
                  <p className="mobile-hide" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Clear double-entry running net balance statements and real-time monthly category budgets.
                  </p>
                </div>
                <Badge variant="emerald">Live Money Vault</Badge>
              </div>

              {/* Animated Metric Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <motion.div className="mobile-hide" whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Inflow</div>
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>+₹45,000.00</motion.div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Monthly Outflow</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>-₹12,400.00</div>
                </motion.div>
                <motion.div className="mobile-hide" whileHover={{ scale: 1.03 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monthly Budget Health</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>32.6% Used</div>
                </motion.div>
              </div>

              {/* Animated Transactions Feed */}
              <div className="mobile-hide" style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
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
                  <Button variant="emerald" onClick={handleLaunchApp}>
                    🚀 Launch Money Ledger →
                  </Button>
                </motion.div>
              </div>
            </div>
          )}

          {/* PILLAR 3: 🎯 FOCUS GOALS ANIMATED MOCKUP */}
          {activePreviewTab === 'productivity' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>🎯</span> Focus & Goal Trackers
                  </h3>
                  <p className="mobile-hide" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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

                <div className="mobile-hide">
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
                  <Button variant="emerald" onClick={handleLaunchApp}>
                    🚀 Launch Focus Goals →
                  </Button>
                </motion.div>
              </div>
            </div>
          )}

          {/* PILLAR 4: 📖 PRIVATE DIARY ANIMATED MOCKUP */}
          {activePreviewTab === 'journal' && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📖</span> Encrypted Personal Journal
                  </h3>
                  <p className="mobile-hide" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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
                <div className="mobile-hide" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '1.25rem' }}>Write your daily thoughts, ideas, and memories with complete privacy. Your data is 100% encrypted in your browser.</div>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#EC4899', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                  📄 Includes BIP-39 24-Word Emergency Recovery Sheet
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button variant="emerald" onClick={handleLaunchApp}>
                    🚀 Launch Private Diary →
                  </Button>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  </section>
  );
};
