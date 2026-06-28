import { z } from 'zod';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

function issueAuthResponse(res, user, status = 200) {
  const token = signToken({ sub: user._id.toString() });
  res.status(status).json({ token, user: user.toJSON() });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with that email already exists');

  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();

  issueAuthResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select the hidden passwordHash for verification.
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  issueAuthResponse(res, user);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});
