package com.naqashly.monolith.finance.repository;

import com.naqashly.monolith.finance.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Category & Target Budget Persistence.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrderByNameAsc(Long userId);
    Optional<Category> findByUserIdAndNameIgnoreCase(Long userId, String name);
    Optional<Category> findByIdAndUserId(Long id, Long userId);
}
