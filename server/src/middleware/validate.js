import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Validates req.body against a Zod schema and replaces it with the parsed
 * (typed, defaulted) result. Turns validation failures into clean 400s.
 */
export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    next(err);
  }
};
