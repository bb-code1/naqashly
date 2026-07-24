/**
 * Landing Page Centralized Configuration Catalog & Balanced Product Copy.
 * Includes Technical Privacy Architecture details, Comparison Chart, How-It-Works, and FAQs.
 * 
 * @author Barkat Bashir
 * @version 7.0.0
 */

export const LANDING_HERO = {
  badge: '✨ RS256 Encrypted • Zero Data Tracking • 100% Private',
  title: 'Master Your Routines, Money, Goals & Daily Life.',
  subtitle: 'Naqashly brings your daily habits, contact bank ledgers, focus goals, and reflection notes together into one private, beautifully organized workspace.'
};

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    icon: '⚡',
    title: 'Set Routines & Budgets',
    desc: 'Define daily habit timelines, goal sliders, and category budget targets in INR (₹).'
  },
  {
    step: '02',
    icon: '📊',
    title: 'Track Daily Progress',
    desc: 'Log routine streaks with 2-hour grace windows and record interpersonal debt ledgers.'
  },
  {
    step: '03',
    icon: '🚀',
    title: 'Achieve Life Balance',
    desc: 'Monitor visual health bars, reflect on daily journal notes, and export formatted reports.'
  }
];

export const COMPARISON_FEATURES = [
  {
    feature: 'Interpersonal Contact Debts & Loans',
    traditional: 'Messy spreadsheets or ad-heavy bill splitters',
    naqashly: 'Bank double-entry running net balance statements in INR (₹)'
  },
  {
    feature: 'Monthly Target Category Budgets',
    traditional: 'Expensive monthly subscriptions ($15/mo) or manual entry',
    naqashly: 'Live DB target budget fill bars + Live form warning guard'
  },
  {
    feature: 'Daily Habit & Routine Tracking',
    traditional: 'Harsh apps that reset streaks if you are 1 hour late',
    naqashly: '24-hour routine timelines + 2-hour streak grace protection'
  },
  {
    feature: 'Data Ownership & Exportability',
    traditional: 'Data locked in proprietary clouds or sold for ad tracking',
    naqashly: 'Private DB vault + 1-click formatted Excel (.xls) exports'
  },
  {
    feature: 'Theme Engine Customization',
    traditional: 'Basic light or dark mode defaults',
    naqashly: '0ms instant switching across 4 curated design themes'
  }
];

export const FEATURE_PREVIEWS = [
  { key: 'routine', label: '🌿 Routine & Habit Engine', icon: '⏰' },
  { key: 'finance', label: '🏦 Bank Ledger & Budgets', icon: '💰' },
  { key: 'productivity', label: '🎯 Focus & Goal Sliders', icon: '📊' },
  { key: 'journal', label: '📝 Knowledge & Mind Vault', icon: '🧠' }
];

export const VALUE_PILLARS = [
  { icon: '🌿', title: 'Routine & Habit Tracker', tag: '2-Hour Grace Protection', desc: 'Build daily habits with 24-hour visual progress timelines and streak freeze passes.' },
  { icon: '🏦', title: 'Smart Bank Ledger', tag: 'Double-Entry Statements', desc: 'Track loans, payments, and receivables with clear contact running balance statements in INR (₹).' },
  { icon: '🎯', title: 'Focus & Goal Sliders', tag: '0% - 100% Milestones', desc: 'Set timeline goals with smooth progress sliders and task priority checklists.' },
  { icon: '🔒', title: 'Private Database Vault', tag: 'RS256 JWT Encryption', desc: 'Secured via RS256 asymmetric RSA keys, isolated PostgreSQL schemas, and zero ad trackers.' }
];

export const FAQS = [
  {
    question: 'How is my personal & financial data kept private?',
    answer: 'Naqashly uses 1) RS256 asymmetric RSA 2048-bit token encryption, 2) Row-level PostgreSQL database isolation where queries strictly filter by authenticated user ID, 3) Redis token revocation on logout, and 4) Zero third-party ad tracking or analytics scripts.'
  },
  {
    question: 'What core tools are included in Naqashly?',
    answer: 'Naqashly combines 4 primary modules: 1) Daily Routine & Habit Flow, 2) Bank Interpersonal Debt Ledger & Budgets, 3) Focus & Goal Progress Trackers, and 4) Knowledge & Reflection Journal Vault.'
  },
  {
    question: 'How does routine grace window logging work?',
    answer: 'Life happens! If you finish a habit slightly late, Naqashly provides a 2-hour grace window so you never lose your hard-earned streak.'
  },
  {
    question: 'How does Naqashly track interpersonal contact debts?',
    answer: 'Naqashly uses double-entry running balance statements. Every money sent or received creates an entry that updates the contact’s net running balance automatically.'
  }
];
