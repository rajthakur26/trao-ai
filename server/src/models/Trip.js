import mongoose from 'mongoose';
import env from '../config/env.js';

const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    // Loose time-of-day hint, e.g. "Morning", "12:30", "Evening".
    time: { type: String, default: '', trim: true },
    // One of the user's interest categories, used for filtering/iconography.
    category: { type: String, default: 'General', trim: true },
  },
  { _id: true }
);

const daySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, default: '', trim: true },
    activities: { type: [activitySchema], default: [] },
  },
  { _id: true }
);

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tier: { type: String, default: 'Mid Range' }, // Budget Friendly | Mid Range | Luxury
    pricePerNight: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    description: { type: String, default: '', trim: true },
  },
  { _id: true }
);

const budgetSchema = new mongoose.Schema(
  {
    currency: { type: String, default: () => env.currency },
    flights: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    // Ownership — the linchpin of multi-user data isolation. Indexed for fast
    // per-user dashboard queries. Every read/write is scoped by this field.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1, max: 30 },
    budgetType: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    interests: { type: [String], default: [] },

    itinerary: { type: [daySchema], default: [] },
    budget: { type: budgetSchema, default: () => ({}) },
    hotels: { type: [hotelSchema], default: [] },

    // Optional public read-only share token (creative feature). Sparse so docs
    // without a token don't collide on the unique index.
    shareToken: { type: String, default: null, index: true, sparse: true, unique: true },

    status: {
      type: String,
      enum: ['generating', 'ready', 'error'],
      default: 'ready',
    },
  },
  { timestamps: true }
);

tripSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Trip', tripSchema);
