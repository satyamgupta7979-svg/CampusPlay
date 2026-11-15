import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { mongoIdParamValidator } from '../validators/tournamentValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', mongoIdParamValidator('id'), validate, markAsRead);
router.patch('/read-all', markAllAsRead);

export default router;

