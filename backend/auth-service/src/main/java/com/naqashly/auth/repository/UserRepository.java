package com.naqashly.auth.repository;

import com.naqashly.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * <h1>User Spring Data JPA Repository</h1>
 * 
 * <p><b>WHAT:</b> Data Access Object (DAO) interface for executing database operations against the {@link User} entity.</p>
 * <p><b>WHY:</b> Abstracting SQL query execution behind Spring Data JPA eliminates boilerplate JDBC code, prevents SQL injection via parameterized queries, and provides standard CRUD capability out of the box.</p>
 * <p><b>HOW:</b> Extends {@link JpaRepository}, leveraging Spring Data reflection to auto-generate SQL queries from method signature conventions (e.g. {@code findByEmail}).</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see JpaRepository
 * @see User
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Query User Entity by Unique Email.
     * 
     * <p><b>WHAT:</b> Executes {@code SELECT * FROM users WHERE email = ?} in PostgreSQL.</p>
     * <p><b>WHY:</b> Required during user login processing to retrieve stored user records and verify BCrypt password hashes.</p>
     * <p><b>HOW:</b> Returns an {@link Optional} container to safely handle non-existent user lookups without throwing {@code NullPointerException}.</p>
     * 
     * @param email The target user email string.
     * @return An {@link Optional} containing the matched {@link User} if found, or empty if not found.
     */
    Optional<User> findByEmail(String email);

    /**
     * Lookup User Entity by Linked Telegram Chat ID.
     */
    Optional<User> findByTelegramChatId(Long telegramChatId);

    /**
     * Check Email Existence.
     * 
     * <p><b>WHAT:</b> Executes an optimized {@code SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)} query.</p>
     * <p><b>WHY:</b> Validates email uniqueness during new account registration before performing an INSERT, preventing duplicate key violations.</p>
     * <p><b>HOW:</b> Returns {@code true} if a user already exists with the given email, {@code false} otherwise.</p>
     * 
     * @param email The email address string to inspect.
     * @return {@code true} if email is already registered; {@code false} otherwise.
     */
    boolean existsByEmail(String email);
}
