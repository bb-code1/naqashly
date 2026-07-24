package com.naqashly.finance.entity;

/**
 * Bank-Grade Immutable Double-Entry Ledger Transaction Types:
 * - GIVE_LOAN: Money lent to person (+ Net Receivable)
 * - TAKE_LOAN: Money borrowed from person (- Net Receivable)
 * - RECEIVE_PAYMENT: Payment received from person (- Net Receivable / Settles Loan)
 * - MAKE_PAYMENT: Payment made to person (+ Net Receivable / Settles Borrowed Debt)
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
public enum DebtType {
    GIVE_LOAN,
    TAKE_LOAN,
    RECEIVE_PAYMENT,
    MAKE_PAYMENT,
    
    // Legacy compatibility fallbacks
    CREDIT,
    DEBIT
}
