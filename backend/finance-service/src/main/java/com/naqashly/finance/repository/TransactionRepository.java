package com.naqashly.finance.repository;

import com.naqashly.finance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <h1>Transaction Spring Data JPA Repository</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Query Historical Transactions by Wallet ID.
     */
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    /**
     * Query Historical Transactions for a List of Wallet IDs.
     */
    List<Transaction> findByWalletIdInOrderByCreatedAtDesc(List<Long> walletIds);
}
