package com.naqashly.auth.repository;

import com.naqashly.auth.entity.VerificationToken;
import com.naqashly.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * <h1>VerificationTokenRepository</h1>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);
    void deleteByUser(User user);
}
