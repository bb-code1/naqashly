package com.naqashly.finance.repository;

import com.naqashly.finance.entity.DebtRecord;
import com.naqashly.finance.entity.DebtStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for {@link DebtRecord}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface DebtRecordRepository extends JpaRepository<DebtRecord, Long> {

    List<DebtRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<DebtRecord> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, DebtStatus status);

    Optional<DebtRecord> findByIdAndUserId(Long id, Long userId);
}
