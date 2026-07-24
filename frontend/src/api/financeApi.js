import { client } from './client';

/**
 * Decoupled API Service Layer for finance-service via API Gateway (Port 8080).
 * Encapsulates raw REST endpoints into typed service functions.
 * Default currency in INR (₹).
 * 
 * @author Barkat Bashir
 * @version 5.0.0
 */
export const financeApi = {
  getPersons: () => client.get('/finance/debts/persons'),
  getDebts: () => client.get('/finance/debts'),
  getWallets: () => client.get('/finance/wallets'),
  getTransactions: () => client.get('/finance/transactions'),
  getCategories: () => client.get('/finance/categories'),

  createDebt: (debtData) => client.post('/finance/debts', debtData),
  updateDebt: (id, debtData) => client.put(`/finance/debts/${id}`, debtData),
  deleteDebt: (id) => client.delete(`/finance/debts/${id}`),
  batchDeleteDebts: (ids) => client.post('/finance/debts/batch-delete', { ids }),

  createWallet: (walletData) => client.post('/finance/wallets', walletData),
  createTransaction: (txData) => client.post('/finance/transactions', txData),

  createCategory: (catData) => client.post('/finance/categories', catData),
  updateCategory: (id, catData) => client.put(`/finance/categories/${id}`, catData),
  deleteCategory: (id) => client.delete(`/finance/categories/${id}`)
};
