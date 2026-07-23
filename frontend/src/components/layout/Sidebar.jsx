import React, { useState } from 'react';

/**
 * Navigation Sidebar with 9-Dot App Switcher (⋮⋮⋮).
 */
export const Sidebar = ({ activeMode, onSelectMode }) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const sidebarStyle = {
    width: '270px',
    background: 'rgba(12, 16, 26, 0.6)',
    borderRight: '1px solid var(--border-subtle)',
    backdropFilter: 'blur(24px)',
    padding: '1.75rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const getModeTitle = () => {
    if (activeMode === 'FINANCE') return { title: 'Naqashly Ledger', sub: 'Standalone Finance App' };
    if (activeMode === 'ROUTINE') return { title: 'Naqashly Flow', sub: 'Standalone Routine Engine' };
    if (activeMode === 'PRODUCTIVITY') return { title: 'Naqashly Focus', sub: 'Standalone Goal App' };
    if (activeMode === 'JOURNAL') return { title: 'Naqashly Mind', sub: 'Standalone Journal App' };
    return { title: 'Naqashly', sub: 'Platform Suite' };
  };

  const brand = getModeTitle();

  return (
    <aside style={sidebarStyle}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.25rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, var(--accent-emerald) 0%, var(--accent-indigo) 100%)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFF', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
            }}>
              N
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>{brand.title}</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{brand.sub}</p>
            </div>
          </div>

          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-heading)',
              width: '32px', height: '32px',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Switch Product View Mode"
          >
            ⋮⋮⋮
          </button>

          {isSwitcherOpen && (
            <div style={{
              position: 'absolute', top: '48px', left: 0, width: '240px',
              background: '#0E131F', border: '1px solid var(--border-highlight)',
              borderRadius: 'var(--radius-md)', padding: '0.75rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              zIndex: 100
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                Select Product Mode
              </div>

              {[
                { key: 'ALL', icon: '⚡', name: 'Naqashly Platform', desc: 'Unified Suite Workspace' },
                { key: 'FINANCE', icon: '💰', name: 'Naqashly Ledger', desc: 'Standalone Finance App' },
                { key: 'ROUTINE', icon: '🌿', name: 'Naqashly Flow', desc: 'Standalone Routine Engine' },
                { key: 'PRODUCTIVITY', icon: '🎯', name: 'Naqashly Focus', desc: 'Standalone Goal App' },
                { key: 'JOURNAL', icon: '📝', name: 'Naqashly Mind', desc: 'Standalone Journal App' }
              ].map(opt => (
                <div
                  key={opt.key}
                  onClick={() => { onSelectMode(opt.key); setIsSwitcherOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-body)'
                  }}
                >
                  <span>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{opt.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <li onClick={() => onSelectMode('ALL')} style={{ padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', cursor: 'pointer', background: activeMode === 'ALL' ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: activeMode === 'ALL' ? 'var(--text-heading)' : 'var(--text-muted)' }}>⚡ Overview</li>
          <li onClick={() => onSelectMode('ROUTINE')} style={{ padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', cursor: 'pointer', background: activeMode === 'ROUTINE' ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: activeMode === 'ROUTINE' ? 'var(--text-heading)' : 'var(--text-muted)' }}>🌿 Routines & Habits</li>
          <li onClick={() => onSelectMode('FINANCE')} style={{ padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', cursor: 'pointer', background: activeMode === 'FINANCE' ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: activeMode === 'FINANCE' ? 'var(--text-heading)' : 'var(--text-muted)' }}>💰 Financial Ledger</li>
          <li onClick={() => onSelectMode('PRODUCTIVITY')} style={{ padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', cursor: 'pointer', background: activeMode === 'PRODUCTIVITY' ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: activeMode === 'PRODUCTIVITY' ? 'var(--text-heading)' : 'var(--text-muted)' }}>🎯 Tasks & Goals</li>
          <li onClick={() => onSelectMode('JOURNAL')} style={{ padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', cursor: 'pointer', background: activeMode === 'JOURNAL' ? 'rgba(99, 102, 241, 0.08)' : 'transparent', color: activeMode === 'JOURNAL' ? 'var(--text-heading)' : 'var(--text-muted)' }}>📝 Notes & Reflections</li>
        </ul>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0.9rem' }}>
        System Version v1.0.0<br />
        All 7 Services Connected
      </div>
    </aside>
  );
};
