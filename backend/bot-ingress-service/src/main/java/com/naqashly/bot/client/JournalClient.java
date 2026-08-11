package com.naqashly.bot.client;

import com.naqashly.bot.client.fallback.JournalClientFallback;
import com.naqashly.bot.model.NoteDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "journal-service", url = "${app.services.journal-url:}", fallback = JournalClientFallback.class)
public interface JournalClient {

    @GetMapping("/api/v1/journal/notes")
    List<NoteDto> getNotes();

    @PostMapping("/api/v1/journal/notes")
    NoteDto createNote(@RequestBody Map<String, Object> request);
}
