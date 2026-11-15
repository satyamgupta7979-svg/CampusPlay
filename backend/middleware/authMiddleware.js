import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. No token provided.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'campusplay_secret_key_jwt_super_secure_2026'
    );

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'User account belonging to this token no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired authentication token.');
  }
});

// Optional protect middleware: sets req.user if token present, but doesn't block if absent
export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'campusplay_secret_key_jwt_super_secure_2026'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Ignore token failure for optional auth
    }
  }

  next();
});

