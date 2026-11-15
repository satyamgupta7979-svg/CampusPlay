import { body, param } from 'express-validator';

export const tournamentValidator = [
  body('name').trim().notEmpty().withMessage('Tournament name is required'),
  body('sport')
    .isIn([
      'Cricket',
      'Football',
      'Basketball',
      'Volleyball',
      'Badminton',
      'Table Tennis',
      'Chess',
      'Carrom',
      'Athletics',
    ])
    .withMessage('Invalid sport selected'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required'),
  body('registrationDeadline').notEmpty().withMessage('Registration deadline is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('format')
    .isIn(['Knockout', 'League', 'Round Robin', 'League + Knockout'])
    .withMessage('Invalid tournament format'),
  body('maxTeams')
    .isInt({ min: 2 })
    .withMessage('Max teams must be at least 2'),
  body('playersPerTeam')
    .isInt({ min: 1 })
    .withMessage('Players per team must be at least 1'),
  body('registrationType')
    .optional()
    .isIn(['Team', 'Individual', 'Both'])
    .withMessage('Registration type must be Team, Individual, or Both'),
  body('status')
    .optional()
    .isIn(['registration_open', 'upcoming', 'live', 'completed'])
    .withMessage('Invalid tournament status'),
];

export const mongoIdParamValidator = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`),
];

