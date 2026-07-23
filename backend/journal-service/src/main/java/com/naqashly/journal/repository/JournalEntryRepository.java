package com.naqashly.journal.repository;

import com.naqashly.journal.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for {@link JournalEntry}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<JournalEntry> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);
}
