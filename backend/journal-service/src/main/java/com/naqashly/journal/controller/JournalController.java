package com.naqashly.journal.controller;

import com.naqashly.journal.entity.DocumentLink;
import com.naqashly.journal.entity.JournalEntry;
import com.naqashly.journal.entity.Note;
import com.naqashly.journal.service.JournalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * <h1>Knowledge & Journal REST Controller</h1>
 * 
 * <p><b>WHAT:</b> REST endpoints for personal notes, categorized reflections, and saved document links.</p>
 * <p><b>WHY:</b> Consumes gateway injected {@code X-User-Id} header to enforce multi-tenant isolation.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 * @see JournalService
 */
@RestController
@RequestMapping("/api/v1/journal")
public class JournalController {

    private final JournalService journalService;

    public JournalController(JournalService journalService) {
        this.journalService = journalService;
    }

    // --- NOTES ENDPOINTS ---
    @GetMapping("/notes")
    public ResponseEntity<?> getNotes(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                      @RequestParam(value = "category", required = false) String category) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        List<Note> notes = journalService.getUserNotes(userId, category);
        return ResponseEntity.ok(notes);
    }

    @PostMapping("/notes")
    public ResponseEntity<?> createNote(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                         @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        String title = (String) request.get("title");
        if (title == null || title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title is required"));
        }

        String content = (String) request.get("content");
        String category = (String) request.get("category");
        Boolean isPinned = (Boolean) request.get("isPinned");
        Boolean isEncrypted = (Boolean) request.get("isEncrypted");
        String mood = (String) request.get("mood");
        String locationTag = (String) request.get("locationTag");
        String weatherTag = (String) request.get("weatherTag");
        String tags = (String) request.get("tags");

        Note note = journalService.createNote(userId, title, content, category, isPinned, isEncrypted, mood, locationTag, weatherTag, tags);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    @PutMapping("/notes/{id}")
    public ResponseEntity<?> updateNote(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                         @PathVariable("id") Long noteId,
                                         @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        String category = (String) request.get("category");
        Boolean isPinned = (Boolean) request.get("isPinned");
        Boolean isEncrypted = (Boolean) request.get("isEncrypted");
        String mood = (String) request.get("mood");
        String locationTag = (String) request.get("locationTag");
        String weatherTag = (String) request.get("weatherTag");
        String tags = (String) request.get("tags");

        try {
            Note note = journalService.updateNote(userId, noteId, title, content, category, isPinned, isEncrypted, mood, locationTag, weatherTag, tags);
            return ResponseEntity.ok(note);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                         @PathVariable("id") Long noteId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        try {
            journalService.deleteNote(userId, noteId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    // --- JOURNAL ENTRIES ENDPOINTS ---
    @GetMapping("/entries")
    public ResponseEntity<?> getEntries(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @RequestParam(value = "category", required = false) String category) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        List<JournalEntry> entries = journalService.getUserEntries(userId, category);
        return ResponseEntity.ok(entries);
    }

    @PostMapping("/entries")
    public ResponseEntity<?> createEntry(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                          @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        if (title == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title and content are required"));
        }

        String category = (String) request.get("category");
        String tags = (String) request.get("tags");
        String projectName = (String) request.get("projectName");
        String ticketId = (String) request.get("ticketId");
        Number durationNum = (Number) request.get("durationMinutes");
        Integer duration = durationNum != null ? durationNum.intValue() : null;

        JournalEntry entry = journalService.createEntry(userId, title, content, category, tags, projectName, ticketId, duration);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    // --- DOCUMENT LINKS ENDPOINTS ---
    @GetMapping("/links")
    public ResponseEntity<?> getLinks(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                      @RequestParam(value = "category", required = false) String category) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        List<DocumentLink> links = journalService.getUserLinks(userId, category);
        return ResponseEntity.ok(links);
    }

    @PostMapping("/links")
    public ResponseEntity<?> createLink(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                        @RequestBody Map<String, String> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }
        String title = request.get("title");
        String url = request.get("url");
        if (title == null || url == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title and URL are required"));
        }

        String category = request.get("category");
        String description = request.get("description");

        DocumentLink link = journalService.createLink(userId, title, url, category, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(link);
    }
}
