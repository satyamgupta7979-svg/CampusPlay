import express from 'express';
import {
  getDashboardAnalytics,
  getParticipationAnalytics,
  getPerformanceAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireOrganizer } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireOrganizer);

router.get('/dashboard', getDashboardAnalytics);
router.get('/participation', getParticipationAnalytics);
router.get('/performance', getPerformanceAnalytics);

export default router;

