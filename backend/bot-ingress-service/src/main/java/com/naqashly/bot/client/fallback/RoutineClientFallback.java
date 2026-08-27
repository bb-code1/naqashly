package com.naqashly.bot.client.fallback;

import com.naqashly.bot.client.RoutineClient;
import com.naqashly.bot.model.HabitDto;
import com.naqashly.bot.model.HabitLogDto;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class RoutineClientFallback implements RoutineClient {

    @Override
    public List<HabitDto> getHabits() {
        log.warn("Routine service is offline. Returning empty habits list.");
        return Collections.emptyList();
    }

    @Override
    public HabitLogDto logHabitStatus(HabitLogDto request) {
        log.error("Routine service is offline. Cannot log completion for habit #{}", request.getHabitId());
        throw new IllegalStateException("Routine service is currently offline. Cannot log habit completion.");
    }

    @Override
    public List<HabitDto> seedPresetPack(String pack) {
        log.error("Routine service is offline. Cannot seed preset pack: {}", pack);
        throw new IllegalStateException("Routine service is currently offline. Cannot seed habits preset.");
    }
}
