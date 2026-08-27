import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/Badge';
import { REVIEWS } from '../../../constants/landingConstants';

export const LandingReviews = ({ containerVariants, itemVariants }) => {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  // Auto-play horizontal scroll
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll - 10) {
          // Reset to start smoothly
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card width (approx 374px = 350px card + 24px gap)
          container.scrollBy({ left: 374, behavior: 'smooth' });
        }
      }
    }, 4000); // Transitions every 4 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollAmount = direction === 'left' ? -374 : 374;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Keep track of active dot index based on scroll position
  const handleScrollEvent = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollPos = container.scrollLeft;
      const cardWidth = 374;
      const index = Math.round(scrollPos / cardWidth);
      setActiveCard(index % REVIEWS.length);
    }
  };

  return (
    <section id="reviews" className="landing-microservices-section" style={{ padding: '5rem 2rem' }}>
      {/* Premium Header Layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ textAlign: 'left', flex: '1 1 400px' }}>
          <Badge variant="emerald">⭐ Verified User Stories</Badge>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
            Loved by Thinkers, Creators & Daily Achievers
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem', maxWidth: '600px' }}>
            Discover how Naqashly brings clarity to daily habits, financial ledgers, and private thoughts.
          </p>
        </div>
        
        {/* Navigation Controls & Aggregate Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.5rem 1rem', borderRadius: '50px' }}>
            <span style={{ color: '#F59E0B', fontWeight: '800', fontSize: '0.9rem' }}>★ 4.9 / 5.0</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>• 1,240+ Reviews</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleScroll('left')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-heading)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-emerald)'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-surface-elevated)'; }}
              aria-label="Previous reviews"
            >
              ←
            </button>
            <button
              onClick={() => handleScroll('right')}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-heading)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-emerald)'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-surface-elevated)'; }}
              aria-label="Next reviews"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div 
        style={{ width: '100%', overflow: 'hidden', padding: '1rem 0' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={scrollRef}
          onScroll={handleScrollEvent}
          className="reviews-scroll-container"
        >
          {REVIEWS.map((rev, idx) => {
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.01 }}
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
                  overflow: 'hidden',
                  minHeight: '300px'
                }}
              >
                <div>
                  {/* Top Row: User Avatar, Name, Role & Verification Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={rev.avatar} 
                        alt={rev.name}
                        style={{ 
                          width: '46px', 
                          height: '46px', 
                          borderRadius: '50%', 
                          objectFit: 'cover', 
                          border: '2px solid var(--accent-emerald)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                        }} 
                      />
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{rev.name}</span>
                          <span style={{ color: '#10B981', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }} title="Verified User">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>{rev.role}</div>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{rev.date}</span>
                  </div>

                  {/* Stars & Feature Highlights */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ color: '#F59E0B', fontSize: '0.9rem', display: 'flex', gap: '2px' }}>
                      {'★'.repeat(rev.rating)}
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' }}>
                      {rev.tag}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-heading)', lineHeight: '1.65', fontStyle: 'italic', margin: '0 0 1.5rem 0' }}>
                    "{rev.review}"
                  </p>
                </div>

                {/* Was this review helpful widget */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Was this review helpful?
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '0.72rem', 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      👍 Yes ({rev.helpfulCount})
                    </button>
                    <span style={{ fontSize: '0.72rem', color: 'var(--border-subtle)' }}>|</span>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        fontSize: '0.72rem', 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      Report
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Carousel Navigation Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
        {REVIEWS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: idx * 374, behavior: 'smooth' });
              }
            }}
            style={{
              width: activeCard === idx ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: activeCard === idx ? 'var(--accent-emerald)' : 'var(--border-subtle)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
