package com.naqashly.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

/**
 * <h1>VerificationToken JPA Entity</h1>
 * 
 * <p><b>WHAT:</b> Entity representing email verification tokens stored in the naqashly_auth_db.</p>
 * <p><b>WHY:</b> Ensures account registration email verification tokens can be securely validated and expired.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Entity
@Table(name = "verification_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private ZonedDateTime expiryDate;
}
