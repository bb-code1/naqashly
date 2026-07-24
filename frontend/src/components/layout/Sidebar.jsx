import React, { useState } from 'react';

/**
 * Option A Navigation Sidebar & 9-Dot App Switcher (⋮⋮⋮).
 * Fully Theme-Aware for Obsidian Dark, Luxe Light, Cyberpunk, and Forest themes!
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const Sidebar = ({ activeMode, onSelectMode, activeSubRoute, onSelectSubRoute }) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const sidebarStyle = {
    width: '270px',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    backdropFilter: 'blur(24px)',
    padding: '1.75rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--card-shadow)'
  };

  const getModeTitle = () => {
    if (activeMode === 'FINANCE') return { title: 'Naqashly Ledger', sub: 'Standalone Finance App' };
    if (activeMode === 'ROUTINE') return { title: 'Naqashly Flow', sub: 'Standalone Routine Engine' };
    if (activeMode === 'PRODUCTIVITY') return { title: 'Naqashly Focus', sub: 'Standalone Goal App' };
    if (activeMode === 'JOURNAL') return { title: 'Naqashly Mind', sub: 'Standalone Journal App' };
    return { title: 'Naqashly Platform', sub: 'Unified Suite Workspace' };
  };

  const brand = getModeTitle();

  const getSubRoutes = () => {
    if (activeMode === 'FINANCE') {
      return [
        { key: 'overview', label: '📊 Ledger Overview' },
        { key: 'wallets', label: '💳 Multi-Wallet Hub' },
        { key: 'transactions', label: '📑 Income & Expenses' },
        { key: 'debts', label: '🤝 Debt Ledger (/debts)' }
      ];
    }
    if (activeMode === 'ROUTINE') {
      return [
        { key: 'timeline', label: '📊 24h Routine Timeline' },
        { key: 'habits', label: '🌿 Habit Contracts' },
        { key: 'grace', label: '⏳ Grace Window Logger' }
      ];
    }
    if (activeMode === 'PRODUCTIVITY') {
      return [
        { key: 'goals', label: '🎯 Goal Target Sliders' },
        { key: 'kanban', label: '📋 Task Priority Kanban' }
      ];
    }
    if (activeMode === 'JOURNAL') {
      return [
        { key: 'notes', label: '📝 Markdown Notes' },
        { key: 'reflections', label: '🏢 Work Reflections' }
      ];
    }
    return [
      { key: 'ALL', label: '⚡ Platform Overview' },
      { key: 'ROUTINE', label: '🌿 Routines & Habits' },
      { key: 'FINANCE', label: '💰 Financial Ledger' },
      { key: 'PRODUCTIVITY', label: '🎯 Tasks & Goals' },
      { key: 'JOURNAL', label: '📝 Notes & Reflections' }
    ];
  };

  const subRoutes = getSubRoutes();

  return (
    <aside style={sidebarStyle}>
      <div>
        {/* Brand Header & 9-Dot App Switcher */}
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

          {/* 9-Dot Switcher Waffle Icon */}
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-heading)',
              width: '34px', height: '34px',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="9-Dot App Switcher (Product Context)"
          >
            ⋮⋮⋮
          </button>

          {/* 9-Dot Waffle Dropdown */}
          {isSwitcherOpen && (
            <div style={{
              position: 'absolute', top: '48px', left: 0, width: '250px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-highlight)',
              borderRadius: 'var(--radius-md)', padding: '0.75rem', boxShadow: 'var(--card-shadow)',
              zIndex: 100
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                9-Dot Standalone App Switcher
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
                    padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem', cursor: 'pointer',
                    background: activeMode === opt.key ? 'var(--accent-indigo-glow)' : 'transparent',
                    color: 'var(--text-body)'
                  }}
                >
                  <span>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{opt.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Sub-Routes List */}
        <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem', paddingLeft: '0.5rem' }}>
          {activeMode === 'ALL' ? 'Platform Navigation' : `${brand.title} Routes`}
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: 0 }}>
          {subRoutes.map(item => {
            const isSelected = activeMode === 'ALL' ? activeMode === item.key : activeSubRoute === item.key;
            return (
              <li
                key={item.key}
                onClick={() => {
                  if (activeMode === 'ALL') {
                    onSelectMode(item.key);
                  } else if (onSelectSubRoute) {
                    onSelectSubRoute(item.key);
                  }
                }}
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  fontWeight: isSelected ? '600' : '400',
                  background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isSelected ? 'var(--text-heading)' : 'var(--text-muted)',
                  border: isSelected ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0.9rem' }}>
        System Version v1.0.0<br />
        All 7 Services Connected
      </div>
    </aside>
  );
};
