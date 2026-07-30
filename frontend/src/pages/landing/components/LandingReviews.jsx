import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/Badge';
import { REVIEWS } from '../../../constants/landingConstants';

export const LandingReviews = ({ containerVariants, itemVariants }) => {
  return (
    <section id="reviews" className="landing-microservices-section">
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <Badge variant="emerald">⭐ Verified User Stories</Badge>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
          Loved by Thinkers, Creators & Daily Achievers
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Discover how Naqashly brings clarity to daily habits, financial ledgers, and private thoughts.
        </p>
      </div>

      <div style={{ width: '100%', overflow: 'hidden', padding: '1rem 0' }}>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="reviews-carousel-container">
          {[...REVIEWS, ...REVIEWS].map((rev, idx) => {
            const isDuplicate = idx >= REVIEWS.length;
            return (
              <motion.div
                key={idx}
                className={isDuplicate ? 'marquee-dup' : ''}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '22px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Row: User Avatar, Name & Role */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        {rev.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{rev.name}</span>
                          <span style={{ color: '#10B981', fontSize: '0.75rem', title: 'Verified User' }}>✓</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>{rev.role}</div>
                      </div>
                    </div>

                    {/* 5-Star Indicator */}
                    <div style={{ color: '#F59E0B', fontSize: '0.85rem', letterSpacing: '2px' }}>
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>

                  {/* Feature Highlight Pill */}
                  <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10B981', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: '800', marginBottom: '1rem' }}>
                    {rev.tag}
                  </div>

                  {/* Review Body Quote */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-heading)', lineHeight: '1.65', fontStyle: 'italic', margin: 0 }}>
                    "{rev.review}"
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
