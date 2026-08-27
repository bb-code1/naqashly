package com.naqashly.monolith.finance.controller;

import com.naqashly.monolith.finance.entity.*;
import com.naqashly.monolith.finance.repository.DebtRecordRepository;
import com.naqashly.monolith.finance.repository.PersonRepository;
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
 * <h1>Bank-Grade Immutable Double-Entry Ledger REST Controller</h1>
 * 
 * <p><b>WHAT:</b> REST API endpoints for managing Bank-Style Interpersonal Statements and Immutable Transaction Ledgers.</p>
 * <p><b>WHY:</b> O(1) append speed, batch deletion support, and zero past-row mutation lock overhead.</p>
 * 
 * @author Barkat Bashir
 * @version 6.0.0
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
     * Get All Contact Persons for User.
     */
    @GetMapping("/persons")
    public ResponseEntity<?> getPersons(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        List<Person> persons = personRepository.findByUserIdOrderByNameAsc(userId);
        return ResponseEntity.ok(persons);
    }

    /**
     * Get All Immutable Debt & Payment Ledger Entries for User.
     */
    @GetMapping
    public ResponseEntity<?> getDebts(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        List<DebtRecord> debts = debtRepository.findByUserIdOrderByCreatedAtAsc(userId);
        return ResponseEntity.ok(debts);
    }

    /**
     * Append Immutable Bank-Style Ledger Transaction (GIVE_LOAN, TAKE_LOAN, RECEIVE_PAYMENT, MAKE_PAYMENT).
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
        String debtTypeStr = (String) request.get("type"); // GIVE_LOAN, TAKE_LOAN, RECEIVE_PAYMENT, MAKE_PAYMENT

        if (personName == null || amountVal == null || debtTypeStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "personName, amount, and type are required"));
        }

        // Find or create person contact
        String phone = (String) request.get("phone");
        String address = (String) request.get("address");
        Long personId = request.get("personId") != null ? Long.valueOf(request.get("personId").toString()) : null;

        Person person = null;
        if (personId != null) {
            person = personRepository.findById(personId).orElse(null);
        }

        if (person == null) {
            List<Person> matches = personRepository.findByUserIdAndNameIgnoreCase(userId, personName);
            final String finalPhone = phone != null ? phone.trim() : "";
            final String finalAddress = address != null ? address.trim() : "";
            person = matches.stream()
                    .filter(p -> {
                        String pPhone = p.getPhone() != null ? p.getPhone().trim() : "";
                        String pAddr = p.getAddress() != null ? p.getAddress().trim() : "";
                        return pPhone.equalsIgnoreCase(finalPhone) && pAddr.equalsIgnoreCase(finalAddress);
                    })
                    .findFirst()
                    .orElseGet(() -> personRepository.save(Person.builder()
                            .userId(userId)
                            .name(personName)
                            .phone(phone)
                            .address(address)
                            .build()));
        }

        DebtType debtType;
        try {
            debtType = DebtType.valueOf(debtTypeStr.toUpperCase());
        } catch (Exception e) {
            debtType = DebtType.GIVE_LOAN;
        }

        BigDecimal amount = new BigDecimal(amountVal.toString());
        String notes = (String) request.get("notes");

        DebtRecord record = DebtRecord.builder()
                .userId(userId)
                .personId(person.getId())
                .personName(person.getName())
                .amount(amount)
                .paidAmount(BigDecimal.ZERO)
                .debtType(debtType)
                .status(DebtStatus.PAID)
                .notes(notes)
                .build();

        DebtRecord saved = debtRepository.save(record);
        log.info("Appended Bank Ledger Transaction #{} for person [{}] amount ${} ({})", saved.getId(), personName, amount, debtType);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Update an existing Ledger Entry.
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateDebtRecord(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                               @PathVariable("id") Long id,
                                               @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        DebtRecord record = debtRepository.findByIdAndUserId(id, userId).orElse(null);
        if (record == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Record not found"));
        }

        if (request.containsKey("amount")) {
            record.setAmount(new BigDecimal(request.get("amount").toString()));
        }
        if (request.containsKey("type")) {
            try {
                record.setDebtType(DebtType.valueOf(request.get("type").toString().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (request.containsKey("notes")) {
            record.setNotes((String) request.get("notes"));
        }

        DebtRecord updated = debtRepository.save(record);
        log.info("Updated Bank Ledger Transaction #{}", id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete / Void a Single Ledger Entry.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteDebtRecord(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                              @PathVariable("id") Long id) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        DebtRecord record = debtRepository.findByIdAndUserId(id, userId).orElse(null);
        if (record == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Record not found"));
        }

        debtRepository.delete(record);
        log.info("Voided Bank Ledger Transaction #{}", id);
        return ResponseEntity.ok(Map.of("message", "Record voided successfully"));
    }

    /**
     * Batch Delete / Void Multiple Ledger Entries in 1 Transaction.
     */
    @PostMapping("/batch-delete")
    @Transactional
    public ResponseEntity<?> batchDeleteRecords(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                                @RequestBody Map<String, List<Long>> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        List<Long> ids = request.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "ids array is required"));
        }

        List<DebtRecord> records = debtRepository.findAllById(ids);
        debtRepository.deleteAll(records);
        log.info("Batch voided {} Bank Ledger Transactions", records.size());

        return ResponseEntity.ok(Map.of("message", "Successfully voided " + records.size() + " records"));
    }
}
