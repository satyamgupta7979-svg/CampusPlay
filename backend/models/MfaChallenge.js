import mongoose from 'mongoose';

/**
 * MFA Challenge model
 * Stores temporary OTP challenges during the two-step login flow.
 * - challengeId is a hashed random token (never stored plain)
 * - otpHash stores the bcrypt hash of the OTP (never plain-text)
 * - TTL index on expiresAt ensures MongoDB auto-deletes expired documents
 */
const mfaChallengeSchema = new mongoose.Schema(
  {
    // SHA-256 hash of the raw challengeId sent to the client
    challengeIdHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // The user this challenge belongs to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // bcrypt hash of the 6-digit OTP
    otpHash: {
      type: String,
      required: true,
    },

    // When this challenge expires (5 minutes from creation)
    expiresAt: {
      type: Date,
      required: true,
    },

    // Track failed attempts to prevent brute force
    attempts: {
      type: Number,
      default: 0,
    },

    // Track last OTP send time for resend cooldown
    lastSentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Whether this challenge has been successfully completed
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index — MongoDB automatically removes expired documents
mfaChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MfaChallenge = mongoose.model('MfaChallenge', mfaChallengeSchema);
export default MfaChallenge;
