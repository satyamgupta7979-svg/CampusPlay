import { body } from 'express-validator';

export const createRegistrationValidator = [
  body('tournamentId').isMongoId().withMessage('Valid tournament ID is required'),
  body('type')
    .isIn(['team', 'individual'])
    .withMessage('Registration type must be team or individual'),
  body('playerNames')
    .isArray({ min: 1 })
    .withMessage('Player names array must contain at least one player'),
  body('teamName')
    .if(body('type').equals('team'))
    .trim()
    .notEmpty()
    .withMessage('Team name is required for team registration'),
];

export const updateRegistrationStatusValidator = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'confirmed'])
    .withMessage('Status must be pending, approved, rejected, or confirmed'),
];

