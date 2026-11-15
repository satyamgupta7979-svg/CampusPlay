import ApiError from '../utils/ApiError.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export const requireOrganizer = authorize('organizer');
export const requireStudent = authorize('student');

