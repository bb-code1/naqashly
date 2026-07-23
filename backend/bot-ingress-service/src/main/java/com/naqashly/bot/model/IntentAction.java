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

    /** Request help menu or available commands. */
    HELP,

    /** Unrecognized intent fallback. */
    UNKNOWN
}
