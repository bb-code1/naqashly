package com.naqashly.productivity.repository;

import com.naqashly.productivity.entity.ProductivitySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * <h1>ProductivitySettings Spring Data JPA Repository</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface ProductivitySettingsRepository extends JpaRepository<ProductivitySettings, Long> {
    Optional<ProductivitySettings> findByUserId(Long userId);
}
