import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../../components/ui/Badge';
import { FAQS } from '../../../constants/landingConstants';

export const LandingFaq = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <section id="faqs" className="landing-microservices-section" style={{ paddingTop: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <Badge variant="indigo">❓ Clear Answers</Badge>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-heading)', letterSpacing: '-0.03em', marginTop: '0.75rem' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
          Everything you need to know about routines, ledgers, goals, and privacy.
        </p>
      </div>

      <div className="faq-container">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div key={idx} className="faq-item">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                className="faq-question-btn"
              >
                <span>{faq.question}</span>
                <span style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>
                  ▼
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="faq-answer"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};
