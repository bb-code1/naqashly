package com.naqashly.monolith.finance.repository;

import com.naqashly.monolith.finance.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * <h1>Wallet Spring Data JPA Repository</h1>
 * 
 * <p><b>WHAT:</b> Data Access Object (DAO) interface for executing database operations against the {@link Wallet} entity.</p>
 * <p><b>WHY:</b> Abstracts SQL query generation for retrieving user wallets, finding wallet by ID and User ID, and saving balance updates.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see JpaRepository
 * @see Wallet
 */
@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    /**
     * Query Wallets by Owner User ID.
     * 
     * @param userId Owner User ID.
     * @return List of matching {@link Wallet} instances.
     */
    List<Wallet> findByUserId(Long userId);

    /**
     * Find Specific Wallet by ID and User ID.
     * 
     * @param id Wallet ID.
     * @param userId Owner User ID.
     * @return Optional containing matched {@link Wallet}.
     */
    Optional<Wallet> findByIdAndUserId(Long id, Long userId);
}
