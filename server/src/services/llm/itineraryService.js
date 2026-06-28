import { chatJSON, llmEnabled } from './groqClient.js';
import {
  SYSTEM_PROMPT,
  buildPlanPrompt,
  buildRegenerateDayPrompt,
  buildConciergePrompt,
} from './prompts.js';
import { fullPlanSchema, singleDaySchema, reconcileBudget } from './schemas.js';
import { mockPlan, mockDay, mockConcierge } from './mock.js';
import { z } from 'zod';

/**
 * The travel agent service. Each method:
 *   1. Builds a constrained prompt.
 *   2. Calls the LLM in JSON mode (when a key is present).
 *   3. Validates + normalises the response with Zod.
 *   4. Falls back to a deterministic generator on any failure.
 *
 * This "validate-or-fallback" pattern is what makes the AI integration robust:
 * the rest of the app always receives well-formed data.
 */

const conciergeSchema = z.object({
  reply: z.string().default('Done.'),
  operations: z
    .array(
      z.object({
        type: z.enum(['add_activity', 'remove_activity', 'regenerate_day', 'none']),
        day: z.number().int().optional(),
        index: z.number().int().optional(),
        instruction: z.string().optional(),
        activity: z
          .object({
            name: z.string(),
            description: z.string().default(''),
            time: z.string().default(''),
            category: z.string().default('General'),
          })
          .optional(),
      })
    )
    .default([{ type: 'none' }]),
});

export async function generatePlan(input) {
  if (llmEnabled) {
    try {
      const raw = await chatJSON({
        system: SYSTEM_PROMPT,
        user: buildPlanPrompt(input),
      });
      const parsed = fullPlanSchema.parse(raw);
      parsed.budget = reconcileBudget(parsed.budget);
      // Guard against the model returning the wrong number of days.
      parsed.itinerary = normaliseDays(parsed.itinerary, input.days);
      return { plan: parsed, source: 'groq' };
    } catch (err) {
      console.warn('LLM generatePlan failed, using mock:', err.message);
    }
  }
  const plan = mockPlan(input);
  plan.itinerary = normaliseDays(plan.itinerary, input.days);
  return { plan, source: 'mock' };
}

export async function regenerateDay({ trip, dayNumber, instruction }) {
  if (llmEnabled) {
    try {
      const raw = await chatJSON({
        system: SYSTEM_PROMPT,
        user: buildRegenerateDayPrompt({ trip, dayNumber, instruction }),
        temperature: 0.9,
      });
      const parsed = singleDaySchema.parse(raw);
      parsed.day.day = dayNumber; // force correct day number
      return { day: parsed.day, source: 'groq' };
    } catch (err) {
      console.warn('LLM regenerateDay failed, using mock:', err.message);
    }
  }
  const parsed = mockDay({
    destination: trip.destination,
    budgetType: trip.budgetType,
    interests: trip.interests,
    dayNumber,
    instruction,
  });
  return { day: parsed.day, source: 'mock' };
}

export async function runConcierge({ trip, message }) {
  if (llmEnabled) {
    try {
      const raw = await chatJSON({
        system: SYSTEM_PROMPT,
        user: `${buildConciergePrompt({ trip })}\n\nTraveller message: "${message}"`,
        temperature: 0.5,
      });
      return { result: conciergeSchema.parse(raw), source: 'groq' };
    } catch (err) {
      console.warn('LLM concierge failed, using mock:', err.message);
    }
  }
  return { result: mockConcierge({ message }), source: 'mock' };
}

/** Ensure exactly `count` days, numbered 1..count. */
function normaliseDays(days, count) {
  const sorted = [...days].sort((a, b) => a.day - b.day).slice(0, count);
  return sorted.map((d, i) => ({ ...d, day: i + 1 }));
}
