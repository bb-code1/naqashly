import { z } from 'zod';

/**
 * Client-Side Input Validation Schemas matching Spring Boot @Valid rules 1-to-1.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

// Interpersonal Debt Ledger Schema
export const debtSchema = z.object({
  personName: z.string().min(2, "Contact name must be at least 2 characters"),
  amount: z.number().positive("Amount must be greater than $0"),
  type: z.enum(["CREDIT", "DEBIT"], "Type must be CREDIT or DEBIT"),
  notes: z.string().optional()
});

// Goal Target Progress Schema
export const goalSchema = z.object({
  title: z.string().min(3, "Goal title must be at least 3 characters"),
  timelineLevel: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "LIFETIME"]),
  category: z.enum(["CAREER", "FINANCES", "HEALTH", "PERSONAL", "SPIRITUAL"]),
  progressPercentage: z.number().min(0).max(100, "Progress must be between 0% and 100%")
});

// Note Schema
export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  category: z.string().default("GENERAL"),
  isPinned: z.boolean().default(false)
});
