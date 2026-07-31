package com.naqashly.bot.client;

import com.naqashly.bot.model.HabitDto;
import com.naqashly.bot.model.HabitLogDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "routine-service", url = "${app.services.routine-url:}")
public interface RoutineClient {

    @GetMapping("/api/v1/routine/habits")
    List<HabitDto> getHabits();

    @PostMapping("/api/v1/routine/habits/log")
    HabitLogDto logHabitStatus(@RequestBody HabitLogDto request);
}
