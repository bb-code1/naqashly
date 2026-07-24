import { client } from './client';

/**
 * Decoupled API Service Layer for finance-service via API Gateway (Port 8080).
 * Encapsulates raw REST endpoints into typed service functions.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const financeApi = {
  getDebts: () => client.get('/finance/debts'),
  getWallets: () => client.get('/finance/wallets'),
  getTransactions: () => client.get('/finance/transactions'),

  createDebt: (debtData) => client.post('/finance/debts', debtData),
  createWallet: (walletData) => client.post('/finance/wallets', walletData),
  createTransaction: (txData) => client.post('/finance/transactions', txData),

  toggleDebtStatus: (id) => client.put(`/finance/debts/${id}/toggle`)
};
