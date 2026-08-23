package com.naqashly.monolith.bot.model;

/**
 * <h1>Parsed Bot Intent Action Enum</h1>
 * 
 * <p><b>WHAT:</b> Classifies recognized intent actions extracted from chat messages.</p>
 */
public enum IntentAction {
    MARK_TASK_COMPLETE,
    ADD_TASK,
    LOG_EXPENSE,
    CHECK_BALANCE,
    LOG_HABIT,
    LOG_NOTE,
    GET_RECENT_NOTES,
    GET_SPENDING_SUMMARY,
    LOG_DEBT,
    GET_DEBT_SUMMARY,
    DELETE_TASK,
    GET_ACTIVE_TASKS,
    HELP,
    GET_HABIT_STATS,
    GET_TODAYS_HABITS,
    SEED_PRESET_PACK,
    UNKNOWN
}
