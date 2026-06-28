/**
 * Prompt builders for the travel-planning agent.
 *
 * Design notes:
 * - Every prompt asks for STRICT JSON matching a documented shape. We pair this
 *   with Groq's JSON response_format and server-side Zod validation, so the
 *   model output is constrained on both ends.
 * - The system prompt fixes the agent's persona and hard rules (budget realism,
 *   activity counts, currency) so results are consistent across requests.
 */

import env from '../../config/env.js';

const CURRENCY = env.currency; // e.g. "INR"
const CURRENCY_HINT =
  CURRENCY === 'INR'
    ? 'Indian Rupees (INR, ₹). Use realistic Indian-market prices a traveller from India would actually pay.'
    : `${CURRENCY}.`;

export const SYSTEM_PROMPT = `You are "Trao", an expert travel-planning agent.
You design realistic, well-paced, day-by-day itineraries and estimate costs.

Hard rules:
- Always respond with VALID JSON only. No markdown, no prose outside the JSON.
- Costs are realistic estimates for ONE traveller, expressed in ${CURRENCY_HINT}
  Set every "currency" field to "${CURRENCY}".
- A "Low" budget means hostels/street food/public transport; "Medium" means
  3-star hotels and mid-range restaurants; "High" means 4-5 star hotels and
  premium experiences. Scale every cost accordingly.
- Each day should have 3-5 activities, sensibly ordered (morning -> evening),
  and reflect the traveller's stated interests.
- Activity "category" must be one of the traveller's interests when relevant,
  otherwise "General".`;

const PLAN_SHAPE = `{
  "itinerary": [
    { "day": 1, "title": "string", "activities": [
      { "name": "string", "description": "string", "time": "Morning|Afternoon|Evening or a clock time", "category": "string" }
    ] }
  ],
  "budget": {
    "currency": "${CURRENCY}",
    "flights": number, "accommodation": number, "food": number,
    "activities": number, "transport": number, "total": number,
    "notes": "short string explaining assumptions"
  },
  "hotels": [
    { "name": "string", "tier": "Budget Friendly|Mid Range|Luxury", "pricePerNight": number, "rating": number (0-5), "description": "string" }
  ]
}`;

export function buildPlanPrompt({ destination, days, budgetType, interests }) {
  const interestStr = interests?.length ? interests.join(', ') : 'general sightseeing';
  return `Plan a trip with these details:
- Destination: ${destination}
- Duration: ${days} day(s)
- Budget level: ${budgetType}
- Interests: ${interestStr}

Produce:
1. A day-by-day itinerary (exactly ${days} day object(s), day numbers 1..${days}).
2. An estimated budget broken down into flights, accommodation, food, activities,
   transport, and a total (sum of the parts).
3. Three hotel suggestions for ${destination}: one Budget Friendly, one Mid Range,
   one Luxury, each with a realistic price-per-night and a rating out of 5.

Return ONLY JSON in exactly this shape:
${PLAN_SHAPE}`;
}

export function buildRegenerateDayPrompt({ trip, dayNumber, instruction }) {
  const context = trip.itinerary
    .map((d) => `Day ${d.day}: ${d.activities.map((a) => a.name).join('; ')}`)
    .join('\n');

  return `Existing itinerary for a ${trip.days}-day ${trip.budgetType}-budget trip to ${trip.destination} (interests: ${trip.interests.join(', ') || 'general'}):
${context}

Regenerate ONLY Day ${dayNumber}. Instruction from the traveller: "${instruction || 'make it better and varied'}".
Keep it consistent with the rest of the trip and avoid repeating activities from other days.

Return ONLY JSON in this shape:
{ "day": { "day": ${dayNumber}, "title": "string", "activities": [ { "name": "string", "description": "string", "time": "string", "category": "string" } ] } }`;
}

/**
 * The "Concierge" agent prompt. Given the current trip and a free-text request,
 * the model returns BOTH a friendly reply and a structured list of operations
 * for the backend to apply. This is what powers the conversational editing.
 */
export function buildConciergePrompt({ trip }) {
  const summary = trip.itinerary
    .map(
      (d) =>
        `Day ${d.day} (${d.title}): ${d.activities
          .map((a, i) => `[${i}] ${a.name}`)
          .join(', ')}`
    )
    .join('\n');

  return `You are the editing concierge for an existing trip. Current state:
Destination: ${trip.destination} | ${trip.days} days | ${trip.budgetType} budget | interests: ${trip.interests.join(', ') || 'general'}
Itinerary:
${summary}

Interpret the traveller's message and return a JSON object with:
- "reply": a short, friendly natural-language confirmation of what you changed.
- "operations": an array of structured edits to apply. Each operation is one of:
   { "type": "add_activity", "day": <number>, "activity": { "name": "...", "description": "...", "time": "...", "category": "..." } }
   { "type": "remove_activity", "day": <number>, "index": <0-based index into that day's activities> }
   { "type": "regenerate_day", "day": <number>, "instruction": "..." }
   { "type": "none" }  // when no change is needed, just answering a question

Only include operations that the message actually requests. Return ONLY JSON:
{ "reply": "string", "operations": [ ... ] }`;
}
