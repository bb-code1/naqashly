package com.naqashly.monolith.productivity.entity;

/**
 * <h1>Task Status Lifecycle Enum</h1>
 * 
 * <p><b>WHAT:</b> Enumeration representing task progression lifecycle stages.</p>
 * <p><b>WHY:</b> Enables task state filtering (e.g. active vs completed tasks) and supports automated status toggling via chat integrations (e.g. Telegram command "/done").</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
public enum TaskStatus {
    /** Initial pending state. */
    TODO,

    /** Work in progress state. */
    IN_PROGRESS,

    /** Successfully completed state. */
    COMPLETED,

    /** Cancelled or archived state. */
    CANCELLED
}
