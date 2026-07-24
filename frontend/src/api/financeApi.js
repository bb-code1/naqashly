import { client } from './client';

/**
 * Decoupled API Service Layer for finance-service via API Gateway (Port 8080).
 * Encapsulates raw REST endpoints into typed service functions.
 * 
 * @author Barkat Bashir
 * @version 3.0.0
 */
export const financeApi = {
  getPersons: () => client.get('/finance/debts/persons'),
  getDebts: () => client.get('/finance/debts'),
  getWallets: () => client.get('/finance/wallets'),
  getTransactions: () => client.get('/finance/transactions'),

  createDebt: (debtData) => client.post('/finance/debts', debtData),
  updateDebt: (id, debtData) => client.put(`/finance/debts/${id}`, debtData),
  deleteDebt: (id) => client.delete(`/finance/debts/${id}`),

  createWallet: (walletData) => client.post('/finance/wallets', walletData),
  createTransaction: (txData) => client.post('/finance/transactions', txData)
};
