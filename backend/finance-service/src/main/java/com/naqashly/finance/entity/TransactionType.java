package com.naqashly.finance.entity;

/**
 * <h1>Financial Transaction Type Enum</h1>
 * 
 * <p><b>WHAT:</b> Enumeration classifying ledger transactions as either credit (income) or debit (expense).</p>
 * <p><b>WHY:</b> Dictates whether transaction amounts add to or subtract from the associated wallet balance.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
public enum TransactionType {
    /** Income / Credit transaction (increases wallet balance). */
    INCOME,

    /** Expense / Debit transaction (decreases wallet balance). */
    EXPENSE
}
