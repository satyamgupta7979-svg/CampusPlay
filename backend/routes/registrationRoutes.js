import express from 'express';
import {
  createRegistration,
  getMyRegistrations,
  getAllRegistrations,
  updateRegistrationStatus,
  cancelRegistration,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireOrganizer } from '../middleware/roleMiddleware.js';
import {
  createRegistrationValidator,
  updateRegistrationStatusValidator,
} from '../validators/registrationValidator.js';
import { mongoIdParamValidator } from '../validators/tournamentValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createRegistrationValidator, validate, createRegistration);
router.get('/my', getMyRegistrations);
router.get('/', getAllRegistrations);
router.patch(
  '/:id/status',
  requireOrganizer,
  mongoIdParamValidator('id'),
  updateRegistrationStatusValidator,
  validate,
  updateRegistrationStatus
);
router.delete('/:id', mongoIdParamValidator('id'), validate, cancelRegistration);

export default router;

