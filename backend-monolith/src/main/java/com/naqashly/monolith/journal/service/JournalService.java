package com.naqashly.monolith.journal.service;

import com.naqashly.monolith.journal.entity.DocumentLink;
import com.naqashly.monolith.journal.entity.JournalEntry;
import com.naqashly.monolith.journal.entity.Note;
import com.naqashly.monolith.journal.repository.DocumentLinkRepository;
import com.naqashly.monolith.journal.repository.JournalEntryRepository;
import com.naqashly.monolith.journal.repository.NoteRepository;
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
    public Note createNote(Long userId, String title, String content, String category, Boolean isPinned, Boolean isEncrypted, String mood, String locationTag, String weatherTag, String tags) {
        Note note = Note.builder()
                .userId(userId)
                .title(title)
                .content(content)
                .category(category != null ? category : "GENERAL")
                .isPinned(isPinned != null ? isPinned : false)
                .isEncrypted(isEncrypted != null ? isEncrypted : false)
                .mood(mood)
                .locationTag(locationTag)
                .weatherTag(weatherTag)
                .tags(tags)
                .build();
        Note saved = noteRepository.save(note);
        log.info("Created Note #{} '{}' (Encrypted: {}) for user {}", saved.getId(), title, saved.getIsEncrypted(), userId);
        return saved;
    }

    public List<Note> getUserNotes(Long userId, String category) {
        if (category != null && !category.isBlank()) {
            return noteRepository.findByUserIdAndCategoryOrderByIsPinnedDescCreatedAtDesc(userId, category);
        }
        return noteRepository.findByUserIdOrderByIsPinnedDescCreatedAtDesc(userId);
    }

    @Transactional
    public Note updateNote(Long userId, Long noteId, String title, String content, String category, Boolean isPinned, Boolean isEncrypted, String mood, String locationTag, String weatherTag, String tags) {
        Note note = noteRepository.findById(noteId)
                .filter(n -> n.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Note not found or access denied"));

        if (title != null) note.setTitle(title);
        if (content != null) note.setContent(content);
        if (category != null) note.setCategory(category);
        if (isPinned != null) note.setIsPinned(isPinned);
        if (isEncrypted != null) note.setIsEncrypted(isEncrypted);
        if (mood != null) note.setMood(mood);
        if (locationTag != null) note.setLocationTag(locationTag);
        if (weatherTag != null) note.setWeatherTag(weatherTag);
        if (tags != null) note.setTags(tags);

        return noteRepository.save(note);
    }

    @Transactional
    public void deleteNote(Long userId, Long noteId) {
        Note note = noteRepository.findById(noteId)
                .filter(n -> n.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Note not found or access denied"));
        noteRepository.delete(note);
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
