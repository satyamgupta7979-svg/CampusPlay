import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: [true, 'Tournament ID is required'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    captainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Captain ID is required'],
      index: true,
    },
    playerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    played: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    initials: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#d5f28d',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        ret.tournamentId = ret.tournamentId?.toString();
        ret.captainId = ret.captainId?.toString();
        if (Array.isArray(ret.playerIds)) {
          ret.playerIds = ret.playerIds.map((p) => (typeof p === 'object' && p !== null && p._id ? p._id.toString() : p.toString()));
        }
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

teamSchema.index({ tournamentId: 1, name: 1 }, { unique: true });

const Team = mongoose.model('Team', teamSchema);
export default Team;

