package com.naqashly.finance.controller;

import com.naqashly.finance.entity.*;
import com.naqashly.finance.repository.DebtRecordRepository;
import com.naqashly.finance.repository.PersonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * <h1>Interpersonal Debt Ledger REST Controller</h1>
 * 
 * <p><b>WHAT:</b> REST API endpoints for managing credit/debit debt records and contact ledgers.</p>
 * <p><b>WHY:</b> Tracks interpersonal financial lending (CREDIT) and borrowing (DEBIT) with settlement status toggles.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/finance/debts")
public class DebtController {

    private static final Logger log = LoggerFactory.getLogger(DebtController.class);

    private final DebtRecordRepository debtRepository;
    private final PersonRepository personRepository;

    public DebtController(DebtRecordRepository debtRepository, PersonRepository personRepository) {
        this.debtRepository = debtRepository;
        this.personRepository = personRepository;
    }

    /**
     * Get All Debt Records for User.
     */
    @GetMapping
    public ResponseEntity<?> getDebts(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                      @RequestParam(value = "status", required = false) String statusStr) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        List<DebtRecord> debts;
        if (statusStr != null && !statusStr.isBlank()) {
            DebtStatus status = DebtStatus.valueOf(statusStr.toUpperCase());
            debts = debtRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        } else {
            debts = debtRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return ResponseEntity.ok(debts);
    }

    /**
     * Create Debt Record (Auto-upserts Person contact).
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createDebtRecord(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        String personName = (String) request.get("personName");
        Number amountNum = (Number) request.get("amount");
        String debtTypeStr = (String) request.get("type"); // CREDIT or DEBIT

        if (personName == null || amountNum == null || debtTypeStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "personName, amount, and type are required"));
        }

        // Find or create person contact
        Person person = personRepository.findByUserIdAndNameIgnoreCase(userId, personName)
                .orElseGet(() -> personRepository.save(Person.builder()
                        .userId(userId)
                        .name(personName)
                        .build()));

        DebtType debtType = DebtType.valueOf(debtTypeStr.toUpperCase());
        BigDecimal amount = new BigDecimal(amountNum.toString());
        String notes = (String) request.get("notes");

        DebtRecord record = DebtRecord.builder()
                .userId(userId)
                .personId(person.getId())
                .personName(person.getName())
                .amount(amount)
                .debtType(debtType)
                .status(DebtStatus.PENDING)
                .notes(notes)
                .build();

        DebtRecord saved = debtRepository.save(record);
        log.info("Created DebtRecord #{} for person [{}] amount ${} ({})", saved.getId(), personName, amount, debtType);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Toggle Settlement Status (PENDING <-> PAID).
     */
    @PutMapping("/{id}/toggle")
    @Transactional
    public ResponseEntity<?> toggleDebtStatus(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @PathVariable("id") Long id) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        DebtRecord record = debtRepository.findByIdAndUserId(id, userId).orElse(null);
        if (record == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Debt record not found"));
        }

        DebtStatus newStatus = record.getStatus() == DebtStatus.PENDING ? DebtStatus.PAID : DebtStatus.PENDING;
        record.setStatus(newStatus);
        DebtRecord updated = debtRepository.save(record);

        log.info("Toggled DebtRecord #{} status to {}", id, newStatus);
        return ResponseEntity.ok(updated);
    }
}
