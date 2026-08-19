package com.naqashly.monolith.journal.repository;

import com.naqashly.monolith.journal.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for {@link Note}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUserIdOrderByIsPinnedDescCreatedAtDesc(Long userId);

    List<Note> findByUserIdAndCategoryOrderByIsPinnedDescCreatedAtDesc(Long userId, String category);
}
