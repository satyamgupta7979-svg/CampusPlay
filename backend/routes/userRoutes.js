import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfileValidator, changePasswordValidator } from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidator, validate, updateProfile);
router.put('/change-password', changePasswordValidator, validate, changePassword);
router.get('/', getAllUsers);

export default router;

