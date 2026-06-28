import { z } from 'zod';
import { nanoid } from 'nanoid';
import Trip from '../models/Trip.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  generatePlan,
  regenerateDay as regenerateDayAgent,
  runConcierge,
} from '../services/llm/itineraryService.js';

/* ----------------------------- validation ----------------------------- */

export const createTripSchema = z.object({
  destination: z.string().trim().min(1, 'Destination is required').max(120),
  days: z.coerce.number().int().min(1, 'At least 1 day').max(30, 'Max 30 days'),
  budgetType: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  interests: z.array(z.string().trim()).max(12).default([]),
  title: z.string().trim().max(120).optional(),
});

export const regenerateDaySchema = z.object({
  instruction: z.string().trim().max(400).optional().default(''),
});

export const addActivitySchema = z.object({
  name: z.string().trim().min(1, 'Activity name is required').max(160),
  description: z.string().trim().max(600).default(''),
  time: z.string().trim().max(60).default(''),
  category: z.string().trim().max(60).default('General'),
});

export const conciergeSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(600),
});

/* ------------------------------ helpers ------------------------------- */

/**
 * Load a trip that belongs to the authenticated user. Using a combined
 * { _id, owner } query means another user's trip is indistinguishable from a
 * non-existent one — no information leak, and ownership is enforced in a single
 * place that every mutating handler reuses.
 */
async function getOwnedTrip(req) {
  const trip = await Trip.findOne({ _id: req.params.id, owner: req.user._id });
  if (!trip) throw ApiError.notFound('Trip not found');
  return trip;
}

function findDay(trip, dayNumber) {
  const day = trip.itinerary.find((d) => d.day === dayNumber);
  if (!day) throw ApiError.notFound(`Day ${dayNumber} not found`);
  return day;
}

/* ----------------------------- controllers ---------------------------- */

export const createTrip = asyncHandler(async (req, res) => {
  const { destination, days, budgetType, interests, title } = req.body;

  const { plan, source } = await generatePlan({ destination, days, budgetType, interests });

  const trip = await Trip.create({
    owner: req.user._id,
    title: title || `${destination} · ${days} day${days > 1 ? 's' : ''}`,
    destination,
    days,
    budgetType,
    interests,
    itinerary: plan.itinerary,
    budget: plan.budget,
    hotels: plan.hotels,
    status: 'ready',
  });

  res.status(201).json({ trip, meta: { source } });
});

export const listTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ owner: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title destination days budgetType interests budget.total budget.currency updatedAt createdAt');
  res.json({ trips });
});

export const getTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  res.json({ trip });
});

export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const schema = z.object({ title: z.string().trim().min(1).max(120) });
  const { title } = schema.parse(req.body);
  trip.title = title;
  await trip.save();
  res.json({ trip });
});

export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  await trip.deleteOne();
  res.json({ success: true });
});

export const regenerateDay = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const dayNumber = Number(req.params.day);
  findDay(trip, dayNumber); // 404 if the day doesn't exist

  const { instruction } = req.body;
  const { day, source } = await regenerateDayAgent({ trip, dayNumber, instruction });

  const idx = trip.itinerary.findIndex((d) => d.day === dayNumber);
  trip.itinerary[idx] = { ...day, day: dayNumber };
  await trip.save();

  res.json({ trip, meta: { source } });
});

export const addActivity = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const dayNumber = Number(req.params.day);
  const day = findDay(trip, dayNumber);

  day.activities.push(req.body);
  await trip.save();
  res.status(201).json({ trip });
});

export const removeActivity = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const dayNumber = Number(req.params.day);
  const day = findDay(trip, dayNumber);

  const activity = day.activities.id(req.params.activityId);
  if (!activity) throw ApiError.notFound('Activity not found');
  activity.deleteOne();
  await trip.save();
  res.json({ trip });
});

/**
 * Conversational editing endpoint (creative feature). The agent returns a list
 * of structured operations which we apply server-side, then persist. Keeping the
 * mutation logic on the server (not trusting the model to mutate state directly)
 * keeps data integrity and authorization intact.
 */
export const concierge = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const { message } = req.body;

  const { result, source } = await runConcierge({ trip, message });
  const applied = [];

  for (const op of result.operations || []) {
    try {
      if (op.type === 'add_activity' && op.day && op.activity) {
        const day = trip.itinerary.find((d) => d.day === op.day);
        if (day) {
          day.activities.push(op.activity);
          applied.push(`Added "${op.activity.name}" to Day ${op.day}`);
        }
      } else if (op.type === 'remove_activity' && op.day != null && op.index != null) {
        const day = trip.itinerary.find((d) => d.day === op.day);
        if (day && day.activities[op.index]) {
          const [removed] = day.activities.splice(op.index, 1);
          applied.push(`Removed "${removed.name}" from Day ${op.day}`);
        }
      } else if (op.type === 'regenerate_day' && op.day) {
        const { day } = await regenerateDayAgent({
          trip,
          dayNumber: op.day,
          instruction: op.instruction || message,
        });
        const idx = trip.itinerary.findIndex((d) => d.day === op.day);
        if (idx !== -1) {
          trip.itinerary[idx] = { ...day, day: op.day };
          applied.push(`Regenerated Day ${op.day}`);
        }
      }
    } catch (err) {
      console.warn('Concierge op failed:', err.message);
    }
  }

  if (applied.length) await trip.save();

  res.json({
    trip,
    reply: result.reply,
    applied,
    meta: { source },
  });
});

/* ----------------------- sharing (creative feature) ------------------- */

export const setShare = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const enable = Boolean(req.body?.enabled);

  if (enable && !trip.shareToken) {
    trip.shareToken = nanoid(16);
  } else if (!enable) {
    trip.shareToken = null;
  }
  await trip.save();
  res.json({ shareToken: trip.shareToken });
});

/** Public, unauthenticated, read-only view of a shared trip. */
export const getSharedTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ shareToken: req.params.token }).select('-owner');
  if (!trip) throw ApiError.notFound('Shared trip not found');
  res.json({ trip });
});
