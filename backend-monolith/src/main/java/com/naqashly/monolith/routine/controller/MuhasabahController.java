package com.naqashly.monolith.routine.controller;

import com.naqashly.monolith.routine.entity.MuhasabahLog;
import com.naqashly.monolith.routine.repository.MuhasabahLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

/**
 * 📜 Muhasabah Self-Reflection REST Controller
 * 
 * Exposes endpoints for saving and querying nightly retrospective logs in PostgreSQL.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/routine/muhasabah")
public class MuhasabahController {

    @Autowired
    private MuhasabahLogRepository muhasabahLogRepository;

    private Long parseUserId(String userIdHeader) {
        try {
            return Long.parseLong(userIdHeader);
        } catch (Exception e) {
            return 1L; // Fallback default user ID
        }
    }

    private LocalDate calculateLogicalDate() {
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now();
        if (now.getHour() < 2) {
            return now.toLocalDate().minusDays(1);
        }
        return now.toLocalDate();
    }

    /**
     * Fetch today's Muhasabah log.
     */
    @GetMapping("/today")
    public ResponseEntity<MuhasabahLog> getTodayMuhasabah(@RequestHeader("X-User-Id") String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        LocalDate logicalDate = calculateLogicalDate();
        Optional<MuhasabahLog> logOpt = muhasabahLogRepository.findByUserIdAndLogDate(userId, logicalDate);
        return logOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.ok().build());
    }

    /**
     * Fetch all past Muhasabah logs for user.
     */
    @GetMapping("/history")
    public ResponseEntity<java.util.List<MuhasabahLog>> getMuhasabahHistory(@RequestHeader("X-User-Id") String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        java.util.List<MuhasabahLog> history = muhasabahLogRepository.findByUserIdOrderByLogDateDesc(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * Save or update today's Muhasabah log.
     */
    @PostMapping
    public ResponseEntity<MuhasabahLog> saveMuhasabah(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestBody MuhasabahLog request) {
        Long userId = parseUserId(userIdHeader);
        LocalDate logicalDate = calculateLogicalDate();

        Optional<MuhasabahLog> existingOpt = muhasabahLogRepository.findByUserIdAndLogDate(userId, logicalDate);
        MuhasabahLog log = existingOpt.orElseGet(() -> MuhasabahLog.builder()
                .userId(userId)
                .logDate(logicalDate)
                .build());

        if (request.getMood() != null) log.setMood(request.getMood());
        if (request.getDailyWin() != null) log.setDailyWin(request.getDailyWin());
        if (request.getTopBlocker() != null) log.setTopBlocker(request.getTopBlocker());
        if (request.getMuhasabahGrade() != null) log.setMuhasabahGrade(request.getMuhasabahGrade());

        MuhasabahLog saved = muhasabahLogRepository.save(log);
        return ResponseEntity.ok(saved);
    }
}
