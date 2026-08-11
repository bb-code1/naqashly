package com.naqashly.bot.client.fallback;

import com.naqashly.bot.client.JournalClient;
import com.naqashly.bot.model.NoteDto;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class JournalClientFallback implements JournalClient {

    @Override
    public List<NoteDto> getNotes() {
        log.error("Journal service is offline. Cannot fetch notes.");
        throw new IllegalStateException("Journal service is currently offline. Cannot retrieve notes.");
    }

    @Override
    public NoteDto createNote(Map<String, Object> request) {
        log.error("Journal service is offline. Cannot create note: {}", request.get("title"));
        throw new IllegalStateException("Journal service is currently offline. Cannot save note.");
    }
}
