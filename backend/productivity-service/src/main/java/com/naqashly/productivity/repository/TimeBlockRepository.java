package com.naqashly.productivity.repository;

import com.naqashly.productivity.entity.TimeBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * <h1>TimeBlock Spring Data JPA Repository</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface TimeBlockRepository extends JpaRepository<TimeBlock, Long> {
    List<TimeBlock> findByUserId(Long userId);
    void deleteByUserIdAndSlotTimeAndBlockDate(Long userId, String slotTime, String blockDate);
}
