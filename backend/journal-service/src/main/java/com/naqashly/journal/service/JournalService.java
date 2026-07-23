package com.naqashly.journal.service;

import com.naqashly.journal.entity.DocumentLink;
import com.naqashly.journal.entity.JournalEntry;
import com.naqashly.journal.entity.Note;
import com.naqashly.journal.repository.DocumentLinkRepository;
import com.naqashly.journal.repository.JournalEntryRepository;
import com.naqashly.journal.repository.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * <h1>Core Journal & Knowledge Management Service</h1>
 * 
 * <p><b>WHAT:</b> Orchestrates creation, querying, pinning, and deletion of notes, journal entries, and document links.</p>
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@Service
public class JournalService {

    private static final Logger log = LoggerFactory.getLogger(JournalService.class);

    private final NoteRepository noteRepository;
    private final JournalEntryRepository entryRepository;
    private final DocumentLinkRepository linkRepository;

    public JournalService(NoteRepository noteRepository,
                          JournalEntryRepository entryRepository,
                          DocumentLinkRepository linkRepository) {
        this.noteRepository = noteRepository;
        this.entryRepository = entryRepository;
        this.linkRepository = linkRepository;
    }

    // --- NOTES MANAGEMENT ---
    @Transactional
    public Note createNote(Long userId, String title, String content, String category, Boolean isPinned) {
        Note note = Note.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .category(category != null ? category : "GENERAL")
                .isPinned(isPinned != null ? isPinned : false)
                .build();
        Note saved = noteRepository.save(note);
        log.info("Created Note #{} '{}' for user {}", saved.getId(), title, userId);
        return saved;
    }

    public List<Note> getUserNotes(Long userId, String category) {
        if (category != null && !category.isBlank()) {
            return noteRepository.findByUserIdAndCategoryOrderByIsPinnedDescCreatedAtDesc(userId, category);
        }
        return noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(userId);
    }

    // --- JOURNAL ENTRIES MANAGEMENT ---
    @Transactional
    public JournalEntry createEntry(Long userId, String title, String content, String category, String tags, String projectName, String ticketId, Integer durationMinutes) {
        JournalEntry entry = JournalEntry.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .category(category != null ? category : "REFLECTIONS")
                .tags(tags)
                .projectName(projectName)
                .ticketId(ticketId)
                .durationMinutes(durationMinutes)
                .build();
        JournalEntry saved = entryRepository.save(entry);
        log.info("Created JournalEntry #{} [{}] '{}' for user {}", saved.getId(), category, title, userId);
        return saved;
    }

    public List<JournalEntry> getUserEntries(Long userId, String category) {
        if (category != null && !category.isBlank()) {
            return entryRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
        }
        return entryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // --- DOCUMENT LINKS MANAGEMENT ---
    @Transactional
    public DocumentLink createLink(Long userId, String title, String url, String category, String description) {
        DocumentLink link = DocumentLink.builder()
                .userId(userId)
                .title(title)
                .url(url)
                .category(category != null ? category : "REFERENCE")
                .description(description)
                .build();
        DocumentLink saved = linkRepository.save(link);
        log.info("Created DocumentLink #{} '{}' for user {}", saved.getId(), title, userId);
        return saved;
    }

    public List<DocumentLink> getUserLinks(Long userId, String category) {
        if (category != null && !category.isBlank()) {
            return linkRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
        }
        return linkRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
