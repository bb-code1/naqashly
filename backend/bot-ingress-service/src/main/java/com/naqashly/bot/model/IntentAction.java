package com.naqashly.bot.model;

/**
 * <h1>Parsed Bot Intent Action Enum</h1>
 * 
 * <p><b>WHAT:</b> Classifies recognized intent actions extracted from chat messages.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
public enum IntentAction {
    /** Mark an existing task as COMPLETED. */
    MARK_TASK_COMPLETE,

    /** Create a new task item. */
    ADD_TASK,

    /** Record a financial expense transaction. */
    LOG_EXPENSE,

    /** Query wallet account balances. */
    CHECK_BALANCE,

    /** Log completion of a routine habit. */
    LOG_HABIT,

    /** Create a new personal note or reflection. */
    LOG_NOTE,

    /** Retrieve recent notes list. */
    GET_RECENT_NOTES,

    /** Retrieve spending summary statistics. */
    GET_SPENDING_SUMMARY,

    /** Log an interpersonal loan or debt. */
    LOG_DEBT,

    /** Retrieve statement of active interpersonal debts. */
    GET_DEBT_SUMMARY,

    /** Request help menu or available commands. */
    HELP,

    /** Unrecognized intent fallback. */
    UNKNOWN
}
