package com.naqashly.finance.repository;

import com.naqashly.finance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <h1>Transaction Spring Data JPA Repository</h1>
 * 
 * <p><b>WHAT:</b> Data Access Object (DAO) interface for executing database operations against the {@link Transaction} entity.</p>
 * <p><b>WHY:</b> Queries historical transaction ledgers by Wallet ID.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see JpaRepository
 * @see Transaction
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Query Historical Transactions by Wallet ID.
     * 
     * @param walletId Target Wallet ID.
     * @return List of matching {@link Transaction} instances.
     */
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
