import express from 'express';
import {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentTeams,
  getTournamentFixtures,
  getTournamentParticipants,
} from '../controllers/tournamentController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { requireOrganizer } from '../middleware/roleMiddleware.js';
import { tournamentValidator, mongoIdParamValidator } from '../validators/tournamentValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getTournaments);
router.get('/:id', optionalProtect, mongoIdParamValidator('id'), validate, getTournamentById);
router.get('/:id/teams', mongoIdParamValidator('id'), validate, getTournamentTeams);
router.get('/:id/fixtures', mongoIdParamValidator('id'), validate, getTournamentFixtures);
router.get('/:id/participants', mongoIdParamValidator('id'), validate, getTournamentParticipants);

// Organizer routes
router.post('/', protect, requireOrganizer, tournamentValidator, validate, createTournament);
router.put('/:id', protect, requireOrganizer, mongoIdParamValidator('id'), validate, updateTournament);
router.delete('/:id', protect, requireOrganizer, mongoIdParamValidator('id'), validate, deleteTournament);

export default router;

