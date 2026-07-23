import React from 'react';
import { Button } from '../ui/Button';

/**
 * Top Header Navigation Bar.
 */
export const TopBar = ({ activeMode, onOpenPairModal }) => {
  const getBannerInfo = () => {
    if (activeMode === 'FINANCE') return { text: '💰 MODE: STANDALONE FINANCE APP', color: 'var(--accent-amber)' };
    if (activeMode === 'ROUTINE') return { text: '🌿 MODE: STANDALONE ROUTINE APP', color: 'var(--accent-emerald)' };
    if (activeMode === 'PRODUCTIVITY') return { text: '🎯 MODE: STANDALONE GOAL APP', color: 'var(--accent-indigo)' };
    if (activeMode === 'JOURNAL') return { text: '📝 MODE: STANDALONE JOURNAL APP', color: 'var(--accent-cyan)' };
    return { text: '⚡ MODE: UNIFIED PLATFORM SUITE', color: 'var(--accent-indigo)' };
  };

  const banner = getBannerInfo();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
          Personal Accountability Dashboard
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Real-time microservices data synchronized via API Gateway (Port 8080)
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: `1px solid ${banner.color}`,
          color: banner.color,
          padding: '0.4rem 0.9rem',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: '600'
        }}>
          {banner.text}
        </div>

        <Button onClick={onOpenPairModal}>📱 Link Telegram / WhatsApp</Button>
      </div>
    </div>
  );
};
