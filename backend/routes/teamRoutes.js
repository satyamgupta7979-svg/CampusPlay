import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayer,
  removePlayer,
  assignCaptain,
} from '../controllers/teamController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { mongoIdParamValidator } from '../validators/tournamentValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', optionalProtect, getTeams);
router.get('/:id', optionalProtect, mongoIdParamValidator('id'), validate, getTeamById);

// Protected routes
router.post('/', protect, createTeam);
router.put('/:id', protect, mongoIdParamValidator('id'), validate, updateTeam);
router.delete('/:id', protect, mongoIdParamValidator('id'), validate, deleteTeam);
router.post('/:id/players', protect, mongoIdParamValidator('id'), validate, addPlayer);
router.delete('/:id/players/:playerId', protect, mongoIdParamValidator('id'), validate, removePlayer);
router.patch('/:id/captain', protect, mongoIdParamValidator('id'), validate, assignCaptain);

export default router;

