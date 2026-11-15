import express from 'express';
import {
  submitResult,
  getResults,
  getLeaderboard,
} from '../controllers/resultController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { requireOrganizer } from '../middleware/roleMiddleware.js';
import { mongoIdParamValidator } from '../validators/tournamentValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getResults);
router.get('/leaderboard/:tournamentId', optionalProtect, mongoIdParamValidator('tournamentId'), validate, getLeaderboard);

// Organizer routes
router.post('/:matchId', protect, requireOrganizer, mongoIdParamValidator('matchId'), validate, submitResult);

export default router;

