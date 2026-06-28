import { Router } from 'express';
import { getSharedTrip } from '../controllers/tripController.js';

const router = Router();

// Unauthenticated, read-only access to a trip via its share token.
router.get('/trips/:token', getSharedTrip);

export default router;
