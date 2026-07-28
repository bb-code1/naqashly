import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/Badge';
import { VALUE_PILLARS } from '../../../constants/landingConstants';

export const LandingValuePillars = ({ containerVariants, itemVariants }) => {
  return (
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
  );
};
