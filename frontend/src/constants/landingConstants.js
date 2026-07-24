/**
 * Landing Page Centralized Configuration Catalog & Consumer Copy.
 * Includes How-It-Works steps, FAQ items, and value proposition constants.
 * 
 * @author Barkat Bashir
 * @version 4.0.0
 */

export const LANDING_HERO = {
  badge: '✨ Simple, Private & Powerfully Organized',
  title: 'Take Control of Your Money, Habits & Daily Goals.',
  subtitle: 'Naqashly gives you total clarity over your daily routines, contact debt ledgers, and monthly budget targets — all in one private, beautifully designed workspace.'
};

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    icon: '🎯',
    title: 'Set Monthly Targets',
    desc: 'Define custom target budgets in INR (₹) for Food, Utilities, Travel, and Custom Categories.'
  },
  {
    step: '02',
    icon: '🤝',
    title: 'Record Ledgers & Expenses',
    desc: 'Log interpersonal contact loans with automatic running net balance statements.'
  },
  {
    step: '03',
    icon: '📊',
    title: 'Track Health & Export',
    desc: 'Monitor 3-tier visual budget fill bars, get live warnings, and export formatted Excel (.xls) sheets.'
  }
];

export const FEATURE_PREVIEWS = [
  { key: 'finance', label: '🏦 Bank Ledger & Budgets', icon: '💰' },
  { key: 'routine', label: '🌿 Routine & Habit Engine', icon: '⏰' },
  { key: 'productivity', label: '🎯 Focus & Goal Sliders', icon: '📊' },
  { key: 'journal', label: '📝 Knowledge & Mind Vault', icon: '🧠' }
];

export const VALUE_PILLARS = [
  { icon: '🏦', title: 'Smart Interpersonal Ledger', tag: 'Double-Entry Statements', desc: 'Track loans, payments, and receivables with clear contact running balance statements in INR (₹).' },
  { icon: '🎯', title: 'Target Budget Tracker', tag: 'Real-Time Health Fill', desc: 'Set monthly category targets with 3-tier visual progress bars and live over-budget alerts.' },
  { icon: '🌿', title: 'Habit & Routine Tracker', tag: '2-Hour Grace Protection', desc: 'Build daily routines with 24-hour visual progress timelines and streak protection.' },
  { icon: '🔒', title: 'Bank-Grade Privacy', tag: 'Private Data Vault', desc: 'Your financial data and personal reflections remain encrypted, private, and 100% under your control.' }
];

export const FAQS = [
  {
    question: 'How does Naqashly track interpersonal contact debts?',
    answer: 'Naqashly uses double-entry running balance statements. Every money sent or received creates an entry that updates the contact’s net running balance automatically.'
  },
  {
    question: 'Can I export my financial data to Excel?',
    answer: 'Yes! Naqashly generates clean, formatted Excel (.xls) files with styled dark headers and native INR (₹) currency number formatting.'
  },
  {
    question: 'How do target category budgets work?',
    answer: 'You can set monthly target budgets (e.g. ₹15,000 for Food). As you log expenses, visual 3-tier progress bars fill up (Green <80%, Amber 80-99%, Red 100%+ Over Budget).'
  },
  {
    question: 'Is my personal & financial data private?',
    answer: 'Absolutely. Your data is isolated in secure PostgreSQL databases and authenticated via encrypted tokens. Zero data is shared with third parties.'
  }
];
