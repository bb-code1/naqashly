package com.naqashly.auth.repository;

import com.naqashly.auth.entity.TelegramLinkCode;
import com.naqashly.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * <h1>TelegramLinkCodeRepository</h1>
 */
@Repository
public interface TelegramLinkCodeRepository extends JpaRepository<TelegramLinkCode, String> {
    Optional<TelegramLinkCode> findByUser(User user);
    void deleteByUser(User user);
}
