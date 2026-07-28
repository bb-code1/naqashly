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

      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="how-it-works-timeline">
        {HOW_IT_WORKS_STEPS.map((stepItem, idx) => (
          <motion.div key={idx} variants={itemVariants} className="timeline-item">
            {/* Connector vertical line */}
            <div className="timeline-connector" />

            {/* Step Icon Badge */}
            <div className="timeline-icon-box">
              {stepItem.icon}
            </div>

            {/* Content card */}
            <div className="timeline-content-card">
              <span className="timeline-step-badge">STEP {stepItem.step}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                {stepItem.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                {stepItem.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
