package com.naqashly.finance.controller;

import com.naqashly.finance.entity.Category;
import com.naqashly.finance.entity.CategoryType;
import com.naqashly.finance.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for User-Defined Categories & Target Monthly Budgets in PostgreSQL.
 * Defaults currency to INR (₹).
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api/v1/finance/categories")
public class CategoryController {

    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Get All Categories for User (Auto-seeds defaults in INR if empty).
     */
    @GetMapping
    @Transactional
    public ResponseEntity<?> getCategories(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        List<Category> categories = categoryRepository.findByUserIdOrderByNameAsc(userId);

        // Auto-seed default categories if empty
        if (categories.isEmpty()) {
            List<Category> defaults = List.of(
                Category.builder().userId(userId).name("Food & Dining").categoryType(CategoryType.EXPENSE).icon("🍔").color("#F59E0B").targetBudget(new BigDecimal("15000.00")).build(),
                Category.builder().userId(userId).name("Bills & Utilities").categoryType(CategoryType.EXPENSE).icon("💡").color("#3B82F6").targetBudget(new BigDecimal("10000.00")).build(),
                Category.builder().userId(userId).name("Travel & Transport").categoryType(CategoryType.EXPENSE).icon("🚗").color("#8B5CF6").targetBudget(new BigDecimal("5000.00")).build(),
                Category.builder().userId(userId).name("Shopping & Supplies").categoryType(CategoryType.EXPENSE).icon("🛍️").color("#EC4899").targetBudget(new BigDecimal("8000.00")).build(),
                Category.builder().userId(userId).name("Salary & Income").categoryType(CategoryType.INCOME).icon("💼").color("#10B981").targetBudget(BigDecimal.ZERO).build()
            );

            categories = categoryRepository.saveAll(defaults);
            log.info("Auto-seeded 5 default categories in INR for User #{}", userId);
        }

        return ResponseEntity.ok(categories);
    }

    /**
     * Create a New Custom Category.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> createCategory(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                             @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        String name = (String) request.get("name");
        String typeStr = (String) request.getOrDefault("type", "EXPENSE");
        String icon = (String) request.getOrDefault("icon", "📂");
        String color = (String) request.getOrDefault("color", "#3B82F6");
        Object budgetVal = request.getOrDefault("targetBudget", "10000");

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category name is required"));
        }

        CategoryType categoryType = typeStr.equalsIgnoreCase("INCOME") ? CategoryType.INCOME : CategoryType.EXPENSE;
        BigDecimal targetBudget = new BigDecimal(budgetVal.toString());

        Category category = Category.builder()
                .userId(userId)
                .name(name.trim())
                .categoryType(categoryType)
                .icon(icon)
                .color(color)
                .targetBudget(targetBudget)
                .build();

        Category saved = categoryRepository.save(category);
        log.info("Created custom Category [{}] in INR for User #{}", name, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Update an Existing Category Target Budget or Metadata.
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateCategory(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                             @PathVariable("id") Long id,
                                             @RequestBody Map<String, Object> request) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Category category = categoryRepository.findByIdAndUserId(id, userId).orElse(null);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Category not found"));
        }

        if (request.containsKey("name")) {
            category.setName(((String) request.get("name")).trim());
        }
        if (request.containsKey("targetBudget")) {
            category.setTargetBudget(new BigDecimal(request.get("targetBudget").toString()));
        }
        if (request.containsKey("icon")) {
            category.setIcon((String) request.get("icon"));
        }
        if (request.containsKey("color")) {
            category.setColor((String) request.get("color"));
        }

        Category updated = categoryRepository.save(category);
        log.info("Updated Category #{} target budget to ₹{}", id, updated.getTargetBudget());

        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a Category.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteCategory(@RequestHeader(value = "X-User-Id", required = false) Long userId,
                                            @PathVariable("id") Long id) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized request"));
        }

        Category category = categoryRepository.findByIdAndUserId(id, userId).orElse(null);
        if (category == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Category not found"));
        }

        categoryRepository.delete(category);
        log.info("Deleted Category #{} [{}]", id, category.getName());

        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}
