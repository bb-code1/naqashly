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
 * <p><b>WHAT:</b> REST API endpoints for managing credit/debit debt records and partial repayments.</p>
 * <p><b>WHY:</b> Supports itemized partial repayments against specific debt transactions and status calculations (PENDING, PARTIAL, PAID).</p>
 * 
 * @author Barkat Bashir
 * @version 2.1.0
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
        Object amountVal = request.get("amount");
        String debtTypeStr = (String) request.get("type"); // CREDIT or DEBIT

        if (personName == null || amountVal == null || debtTypeStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "personName, amount, and type are required"));
        }

        // Find or create person contact
        Person person = personRepository.findByUserIdAndNameIgnoreCase(userId, personName)
                .orElseGet(() -> personRepository.save(Person.builder()
                        .userId(userId)
                        .name(personName)
                        .build()));

        DebtType debtType = DebtType.valueOf(debtTypeStr.toUpperCase());
        BigDecimal amount = new BigDecimal(amountVal.toString());
        String notes = (String) request.get("notes");

        DebtRecord record = DebtRecord.builder()
                .userId(userId)
                .personId(person.getId())
                .personName(person.getName())
                .amount(amount)
                .paidAmount(BigDecimal.ZERO)
                .debtType(debtType)
                .status(DebtStatus.PENDING)
                .notes(notes)
                .build();

        DebtRecord saved = debtRepository.save(record);
        log.info("Created DebtRecord #{} for person [{}] amount ${} ({})", saved.getId(), personName, amount, debtType);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Record Partial or Full Repayment against specific DebtRecord ID.
     */
    @PutMapping("/{id}/repay")
    @Transactional
    public ResponseEntity<?> recordPartialRepayment(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                    @PathVariable("id") Long id,
                                                    @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Object repayVal = request.get("repayAmount");
        if (repayVal == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "repayAmount is required"));
        }

        BigDecimal repayAmount;
        try {
            repayAmount = new BigDecimal(repayVal.toString());
            if (repayAmount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "repayAmount must be greater than zero"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid repayAmount format"));
        }

        DebtRecord record = debtRepository.findByIdAndUserId(id, userId).orElse(null);
        if (record == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Debt record not found"));
        }

        BigDecimal currentPaid = record.getPaidAmount() != null ? record.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newPaidAmount = currentPaid.add(repayAmount);

        if (newPaidAmount.compareTo(record.getAmount()) >= 0) {
            record.setPaidAmount(record.getAmount());
            record.setStatus(DebtStatus.PAID);
        } else {
            record.setPaidAmount(newPaidAmount);
            record.setStatus(DebtStatus.PARTIAL);
        }

        DebtRecord updated = debtRepository.save(record);
        log.info("Recorded Partial Repayment ${} for DebtRecord #{}. New Paid = ${}/{}", repayAmount, id, updated.getPaidAmount(), updated.getAmount());

        return ResponseEntity.ok(updated);
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

        if (record.getStatus() == DebtStatus.PAID) {
            record.setStatus(DebtStatus.PENDING);
            record.setPaidAmount(BigDecimal.ZERO);
        } else {
            record.setStatus(DebtStatus.PAID);
            record.setPaidAmount(record.getAmount());
        }

        DebtRecord updated = debtRepository.save(record);
        log.info("Toggled DebtRecord #{} status to {}", id, updated.getStatus());
        return ResponseEntity.ok(updated);
    }
}
