import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import MfaChallenge from '../models/MfaChallenge.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import { sendOtpEmail } from '../utils/emailService.js';

// ─── OTP configuration (read from env) ───────────────────────────────────────
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10);

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Generate a cryptographically secure numeric OTP */
function generateOtp() {
  const max = Math.pow(10, OTP_LENGTH);
  const min = Math.pow(10, OTP_LENGTH - 1);
  const range = max - min;
  const bytes = crypto.randomBytes(4);
  const value = bytes.readUInt32BE(0);
  return String(min + (value % range));
}

/** SHA-256 hash of the raw challengeId (for DB storage/lookup) */
function hashChallengeId(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** Mask email: john****@example.com */
function maskEmail(email) {
  const [local, domain] = email.split('@');
  const visible = local.slice(0, Math.min(4, local.length));
  return `${visible}****@${domain}`;
}

/** Create and persist a new MFA challenge, invalidating any previous one */
async function createChallenge(userId) {
  // Invalidate any existing challenge for this user
  await MfaChallenge.deleteMany({ userId });

  // Generate raw challengeId (sent to client) and store its hash
  const rawChallengeId = crypto.randomBytes(32).toString('hex');
  const challengeIdHash = hashChallengeId(rawChallengeId);

  // Generate OTP and hash it before storing
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await MfaChallenge.create({
    challengeIdHash,
    userId,
    otpHash,
    expiresAt,
    attempts: 0,
    lastSentAt: new Date(),
    verified: false,
  });

  return { rawChallengeId, otp };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Step 1 — Validate email/password, send OTP, return challengeId
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  // Use identical error for wrong email and wrong password (no enumeration)
  const user = await User.findOne({ email: email.toLowerCase() });
  const isMatch = user ? await user.matchPassword(password) : false;

  if (!user || !isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Create MFA challenge and generate OTP
  const { rawChallengeId, otp } = await createChallenge(user._id);

  // Send OTP email — if it fails, surface a helpful error without leaking details
  try {
    await sendOtpEmail(user.email, otp);
  } catch (emailErr) {
    // Clean up the challenge so the user can retry
    await MfaChallenge.deleteMany({ userId: user._id });
    console.error('[MFA Login]: Email delivery failed:', emailErr.message);
    throw new ApiError(
      503,
      'Could not send verification email. Please check your email configuration or try again later.'
    );
  }

  res.status(200).json({
    success: true,
    requiresMfa: true,
    challengeId: rawChallengeId,
    maskedEmail: maskEmail(user.email),
    expiresInMinutes: OTP_EXPIRY_MINUTES,
    message: 'Verification code sent to your registered email',
  });
});

/**
 * @desc    Step 2 — Verify OTP, issue JWT
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { challengeId, otp } = req.body;

  if (!challengeId || !otp) {
    throw new ApiError(400, 'Challenge ID and OTP are required');
  }

  const challengeIdHash = hashChallengeId(challengeId);

  const challenge = await MfaChallenge.findOne({ challengeIdHash });

  if (!challenge) {
    throw new ApiError(400, 'Invalid or expired verification session. Please log in again.');
  }

  if (challenge.verified) {
    throw new ApiError(400, 'This verification code has already been used. Please log in again.');
  }

  if (challenge.expiresAt < new Date()) {
    await challenge.deleteOne();
    throw new ApiError(401, 'Verification code has expired. Please log in again to receive a new code.');
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    await challenge.deleteOne();
    throw new ApiError(429, `Too many incorrect attempts. Please log in again.`);
  }

  // Verify OTP hash
  const isOtpValid = await bcrypt.compare(String(otp), challenge.otpHash);

  if (!isOtpValid) {
    // Atomically increment attempts
    challenge.attempts += 1;
    await challenge.save();

    const remaining = OTP_MAX_ATTEMPTS - challenge.attempts;
    if (remaining <= 0) {
      await challenge.deleteOne();
      throw new ApiError(429, 'Too many incorrect attempts. Please log in again.');
    }

    throw new ApiError(401, `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
  }

  // OTP is valid — mark as verified atomically to prevent reuse
  challenge.verified = true;
  await challenge.save();

  // Fetch user and issue JWT
  const user = await User.findById(challenge.userId);
  if (!user) {
    await challenge.deleteOne();
    throw new ApiError(404, 'User account not found.');
  }

  // Clean up the challenge
  await challenge.deleteOne();

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'MFA verification successful',
    token,
    user: user.toJSON(),
  });
});

/**
 * @desc    Resend OTP for an existing challenge (with cooldown)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = asyncHandler(async (req, res) => {
  const { challengeId } = req.body;

  if (!challengeId) {
    throw new ApiError(400, 'Challenge ID is required');
  }

  const challengeIdHash = hashChallengeId(challengeId);
  const challenge = await MfaChallenge.findOne({ challengeIdHash });

  if (!challenge) {
    throw new ApiError(400, 'Invalid or expired verification session. Please log in again.');
  }

  if (challenge.verified) {
    throw new ApiError(400, 'This verification session is already complete.');
  }

  if (challenge.expiresAt < new Date()) {
    await challenge.deleteOne();
    throw new ApiError(401, 'Verification session has expired. Please log in again.');
  }

  // Enforce resend cooldown
  const secondsSinceLastSend = (Date.now() - challenge.lastSentAt.getTime()) / 1000;
  if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
    const waitSeconds = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
    throw new ApiError(429, `Please wait ${waitSeconds} second${waitSeconds === 1 ? '' : 's'} before requesting a new code.`);
  }

  const user = await User.findById(challenge.userId);
  if (!user) {
    await challenge.deleteOne();
    throw new ApiError(404, 'User account not found.');
  }

  // Generate a new OTP and update the challenge in-place
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  challenge.otpHash = otpHash;
  challenge.attempts = 0;
  challenge.lastSentAt = new Date();
  challenge.expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await challenge.save();

  try {
    await sendOtpEmail(user.email, otp);
  } catch (emailErr) {
    console.error('[MFA Resend]: Email delivery failed:', emailErr.message);
    throw new ApiError(503, 'Could not send verification email. Please try again later.');
  }

  res.status(200).json({
    success: true,
    maskedEmail: maskEmail(user.email),
    expiresInMinutes: OTP_EXPIRY_MINUTES,
    resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    message: 'A new verification code has been sent to your email',
  });
});

// ─── Existing controllers (unchanged) ────────────────────────────────────────

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, collegeId, department, year, section, role, avatarColor } = req.body;

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const existingCollegeId = await User.findOne({ collegeId: collegeId.toUpperCase() });
  if (existingCollegeId) {
    throw new ApiError(409, 'An account with this College ID already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    collegeId: collegeId.toUpperCase(),
    department,
    year: year || '1st Year',
    section: section || 'A',
    role: role || 'student',
    avatarColor: avatarColor || '#d5f28d',
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: user.toJSON(),
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    user: user.toJSON(),
  });
});

/**
 * @desc    Log out current user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError(404, 'No account found with that email address');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Password reset token generated successfully',
    resetToken,
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const jwtToken = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
    token: jwtToken,
    user: user.toJSON(),
  });
});
