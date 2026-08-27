/**
 * Finance System Centralized Configuration Catalog & Dropdown Constants.
 * Decouples static UI select options, categories, and badge mappings.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

export const TRANSACTION_CATEGORIES = [
  { value: 'FOOD', label: '🍔 Food & Dining' },
  { value: 'RENT', label: '🏠 Rent & Housing' },
  { value: 'SALARY', label: '💰 Salary & Income' },
  { value: 'ELECTRONICS', label: '💻 Electronics & Gear' },
  { value: 'TRAVEL', label: '🚗 Transport & Travel' },
  { value: 'UTILITIES', label: '⚡ Bills & Utilities' },
  { value: 'SHOPPING', label: '🛍️ General Shopping' }
];

export const DEBT_PURPOSE_CATEGORIES = [
  { value: 'SHARED_EXPENSE', label: '🍽️ Shared Dining & Outing' },
  { value: 'PERSONAL_LOAN', label: '🤝 Personal Loan' },
  { value: 'TRAVEL', label: '✈️ Travel & Hotel Share' },
  { value: 'BUSINESS', label: '💼 Business Advance' },
  { value: 'EMERGENCY', label: '🚨 Emergency Cash' }
];

export const DEBT_TYPES = [
  { value: 'CREDIT', label: 'CREDIT (Money You Lent)' },
  { value: 'DEBIT', label: 'DEBIT (Money You Owe)' }
];

export const TRANSACTION_TYPES = [
  { value: 'EXPENSE', label: '- EXPENSE' },
  { value: 'INCOME', label: '+ INCOME' }
];
