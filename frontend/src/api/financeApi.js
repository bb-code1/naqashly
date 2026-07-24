import { client } from './client';

/**
 * Decoupled API Service Layer for finance-service via API Gateway (Port 8080).
 * Encapsulates raw REST endpoints into typed service functions with contacts & partial repayments.
 * 
 * @author Barkat Bashir
 * @version 2.1.0
 */
export const financeApi = {
  getPersons: () => client.get('/finance/debts/persons'),
  getDebts: () => client.get('/finance/debts'),
  getWallets: () => client.get('/finance/wallets'),
  getTransactions: () => client.get('/finance/transactions'),

  createDebt: (debtData) => client.post('/finance/debts', debtData),
  createWallet: (walletData) => client.post('/finance/wallets', walletData),
  createTransaction: (txData) => client.post('/finance/transactions', txData),

  recordPartialRepayment: (id, repayAmount) => client.put(`/finance/debts/${id}/repay`, { repayAmount }),
  toggleDebtStatus: (id) => client.put(`/finance/debts/${id}/toggle`)
};
