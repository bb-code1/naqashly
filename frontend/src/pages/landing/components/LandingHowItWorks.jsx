import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/Badge';
import { HOW_IT_WORKS_STEPS } from '../../../constants/landingConstants';

export const LandingHowItWorks = ({ containerVariants, itemVariants }) => {
  return (
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
  );
};
