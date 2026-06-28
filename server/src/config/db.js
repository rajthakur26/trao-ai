import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connect to MongoDB. Mongoose buffers queries until the connection is ready,
 * so callers don't need to await this before defining models.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ MongoDB connected');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    throw err;
  }

  mongoose.connection.on('disconnected', () => console.warn('⚠ MongoDB disconnected'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
}
