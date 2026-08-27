package com.naqashly.finance.repository;

import com.naqashly.finance.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for {@link Person}.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

    List<Person> findByUserIdOrderByNameAsc(Long userId);

    List<Person> findByUserIdAndNameIgnoreCase(Long userId, String name);
}
