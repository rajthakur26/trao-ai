import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createTrip,
  listTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  regenerateDay,
  addActivity,
  removeActivity,
  concierge,
  setShare,
  createTripSchema,
  regenerateDaySchema,
  addActivitySchema,
  conciergeSchema,
} from '../controllers/tripController.js';

const router = Router();

// Every route below requires a valid token — user-specific by construction.
router.use(requireAuth);

router.route('/').get(listTrips).post(validateBody(createTripSchema), createTrip);

router.route('/:id').get(getTrip).patch(updateTrip).delete(deleteTrip);

router.post('/:id/days/:day/regenerate', validateBody(regenerateDaySchema), regenerateDay);
router.post('/:id/days/:day/activities', validateBody(addActivitySchema), addActivity);
router.delete('/:id/days/:day/activities/:activityId', removeActivity);

router.post('/:id/concierge', validateBody(conciergeSchema), concierge);
router.post('/:id/share', setShare);

export default router;
