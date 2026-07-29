import React from 'react';

/**
 * 👑 Brand Logo & Identity Header Component
 */
export const BrandLogo = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'linear-gradient(135deg, #10B981 0%, #38BDF8 100%)',
        color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '900', fontSize: '1.15rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)'
      }}>
        N
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', letterSpacing: '-0.02em' }}>
        Naqashly
      </div>
    </div>
  );
};
