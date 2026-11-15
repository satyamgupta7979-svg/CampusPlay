import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long'),
  body('collegeId').trim().notEmpty().withMessage('College ID is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('year').trim().notEmpty().withMessage('Year is required'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('role')
    .optional()
    .isIn(['student', 'organizer'])
    .withMessage('Role must be student or organizer'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const verifyOtpValidator = [
  body('challengeId').trim().notEmpty().withMessage('Challenge ID is required'),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only digits'),
];

export const resendOtpValidator = [
  body('challengeId').trim().notEmpty().withMessage('Challenge ID is required'),
];

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('year').optional().trim().notEmpty().withMessage('Year cannot be empty'),
  body('section').optional().trim().notEmpty().withMessage('Section cannot be empty'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 4 })
    .withMessage('New password must be at least 4 characters long'),
];

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 4 })
    .withMessage('New password must be at least 4 characters long'),
];
