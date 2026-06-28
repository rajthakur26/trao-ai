import { z } from 'zod';

/**
 * Zod schemas that describe the exact JSON shape we expect back from the LLM.
 * We validate every model response against these so a malformed/hallucinated
 * payload can never reach the database or the client.
 */

export const activitySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  time: z.string().default(''),
  category: z.string().default('General'),
});

export const daySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().default(''),
  activities: z.array(activitySchema).default([]),
});

export const budgetSchema = z.object({
  currency: z.string().default('USD'),
  flights: z.number().nonnegative().default(0),
  accommodation: z.number().nonnegative().default(0),
  food: z.number().nonnegative().default(0),
  activities: z.number().nonnegative().default(0),
  transport: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
  notes: z.string().default(''),
});

export const hotelSchema = z.object({
  name: z.string().min(1),
  tier: z.string().default('Mid Range'),
  pricePerNight: z.number().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(0),
  description: z.string().default(''),
});

export const fullPlanSchema = z.object({
  itinerary: z.array(daySchema).min(1),
  budget: budgetSchema,
  hotels: z.array(hotelSchema).default([]),
});

export const singleDaySchema = z.object({
  day: daySchema,
});

/** Recompute the budget total from its parts so the displayed sum is always correct. */
export function reconcileBudget(budget) {
  const total =
    budget.flights + budget.accommodation + budget.food + budget.activities + budget.transport;
  return { ...budget, total: Math.round(total) };
}
