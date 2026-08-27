package com.naqashly.routine.repository;

import com.naqashly.routine.entity.MuhasabahLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

import java.util.List;
import java.util.Optional;

/**
 * 📜 Muhasabah Daily Reflection Repository
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface MuhasabahLogRepository extends JpaRepository<MuhasabahLog, Long> {
    Optional<MuhasabahLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
    List<MuhasabahLog> findByUserIdOrderByLogDateDesc(Long userId);
}
