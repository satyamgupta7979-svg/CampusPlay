import express from 'express';
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyOtpValidator,
  resendOtpValidator,
} from '../validators/authValidator.js';
import { validate } from '../middleware/validateMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Strict rate limiting for OTP endpoints (brute-force protection)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 15 minutes.',
  },
});

// Auth routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/verify-otp', otpLimiter, verifyOtpValidator, validate, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtpValidator, validate, resendOtp);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

export default router;
