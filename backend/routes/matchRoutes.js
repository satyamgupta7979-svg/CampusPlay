import express from 'express';
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  updateMatchScore,
  deleteMatch,
} from '../controllers/matchController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { requireOrganizer } from '../middleware/roleMiddleware.js';
import { mongoIdParamValidator } from '../validators/tournamentValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getMatches);
router.get('/:id', optionalProtect, mongoIdParamValidator('id'), validate, getMatchById);

// Organizer routes
router.post('/', protect, requireOrganizer, createMatch);
router.put('/:id', protect, requireOrganizer, mongoIdParamValidator('id'), validate, updateMatch);
router.patch('/:id/score', protect, requireOrganizer, mongoIdParamValidator('id'), validate, updateMatchScore);
router.delete('/:id', protect, requireOrganizer, mongoIdParamValidator('id'), validate, deleteMatch);

export default router;

