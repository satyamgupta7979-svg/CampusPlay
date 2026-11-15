import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: [true, 'Tournament ID is required'],
      index: true,
    },
    round: {
      type: String,
      required: [true, 'Round name is required'],
      trim: true,
    },
    teamAId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team A ID is required'],
    },
    teamBId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team B ID is required'],
    },
    date: {
      type: String,
      required: [true, 'Match date is required (YYYY-MM-DD)'],
    },
    time: {
      type: String,
      required: [true, 'Match time is required'],
    },
    venue: {
      type: String,
      required: [true, 'Match venue is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'postponed'],
      default: 'upcoming',
      index: true,
    },
    scoreA: {
      type: String,
      default: '',
    },
    scoreB: {
      type: String,
      default: '',
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    overs: {
      type: String,
      default: '',
    },
    notice: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        ret.tournamentId = ret.tournamentId?.toString();
        ret.teamAId = ret.teamAId?.toString();
        ret.teamBId = ret.teamBId?.toString();
        if (ret.winnerId) ret.winnerId = ret.winnerId.toString();
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

matchSchema.index({ date: 1, venue: 1 });

const Match = mongoose.model('Match', matchSchema);
export default Match;

