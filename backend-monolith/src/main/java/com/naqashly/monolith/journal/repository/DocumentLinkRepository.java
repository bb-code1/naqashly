package com.naqashly.monolith.journal.repository;

import com.naqashly.monolith.journal.entity.DocumentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA Repository for {@link DocumentLink}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface DocumentLinkRepository extends JpaRepository<DocumentLink, Long> {

    List<DocumentLink> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<DocumentLink> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);
}
