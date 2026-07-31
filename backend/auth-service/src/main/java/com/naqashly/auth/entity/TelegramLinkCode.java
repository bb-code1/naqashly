package com.naqashly.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * <h1>TelegramLinkCode JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Stores transient linking activation codes for connecting Telegram account chat IDs with Naqashly users.</p>
 */
@Entity
@Table(name = "telegram_link_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelegramLinkCode {

    @Id
    @Column(nullable = false, unique = true)
    private String code;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id", unique = true)
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private ZonedDateTime expiryDate;
}
