package com.naqashly.productivity.controller;

import com.naqashly.productivity.entity.TimeBlock;
import com.naqashly.productivity.repository.TimeBlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * <h1>TimeBlock REST Controller Endpoints</h1>
 * 
 * <p>Exposes REST endpoints for querying, creating, and updating time-blocking calendar slots in PostgreSQL.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/productivity/time-blocks")
public class TimeBlockController {

    @Autowired
    private TimeBlockRepository timeBlockRepository;

    /**
     * Fetch all scheduled time blocks for a user.
     */
    @GetMapping
    public ResponseEntity<List<TimeBlock>> getTimeBlocks(@RequestHeader("X-User-Id") String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        List<TimeBlock> blocks = timeBlockRepository.findByUserId(userId);
        return ResponseEntity.ok(blocks);
    }

    /**
     * Create or Update a scheduled time block.
     */
    @PostMapping
    public ResponseEntity<TimeBlock> saveTimeBlock(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestBody TimeBlock block) {
        Long userId = parseUserId(userIdHeader);
        block.setUserId(userId);

        if (block.getStatus() == null) {
            block.setStatus("TODO");
        }
        if (block.getPriority() == null) {
            block.setPriority("HIGH");
        }

        TimeBlock saved = timeBlockRepository.save(block);
        return ResponseEntity.ok(saved);
    }

    /**
     * Delete a scheduled time block by ID.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteTimeBlock(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable Long id) {
        Long userId = parseUserId(userIdHeader);
        timeBlockRepository.findById(id).ifPresent(block -> {
            if (block.getUserId().equals(userId)) {
                timeBlockRepository.delete(block);
            }
        });
        return ResponseEntity.noContent().build();
    }

    private Long parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return 1L;
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException e) {
            return 1L;
        }
    }
}
