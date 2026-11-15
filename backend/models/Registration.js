import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: [true, 'Tournament ID is required'],
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['team', 'individual'],
      required: [true, 'Registration type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'confirmed'],
      default: 'pending',
      index: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
    playerNames: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        ret.tournamentId = ret.tournamentId?.toString();
        if (ret.teamId) ret.teamId = ret.teamId.toString();
        ret.studentId = ret.studentId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent duplicate student registration for the same tournament
registrationSchema.index({ tournamentId: 1, studentId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;

