import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

/**
 * Authentication gate. Validates the Bearer token, loads the user, and attaches
 * it to req.user. Any route mounted behind this middleware is protected.
 */
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) throw ApiError.unauthorized('Authentication token missing');

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('User no longer exists');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
