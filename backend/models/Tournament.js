import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
    },
    sport: {
      type: String,
      required: [true, 'Sport is required'],
      enum: ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Table Tennis', 'Chess', 'Carrom', 'Athletics'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['registration_open', 'upcoming', 'live', 'completed'],
      default: 'upcoming',
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: String,
      required: [true, 'Registration deadline is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
      default: 'Campus Sports Committee',
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    format: {
      type: String,
      required: [true, 'Format is required'],
      enum: ['Knockout', 'League', 'Round Robin', 'League + Knockout'],
      default: 'Knockout',
    },
    maxTeams: {
      type: Number,
      required: [true, 'Max teams is required'],
      min: [2, 'Tournament must allow at least 2 teams or participants'],
    },
    playersPerTeam: {
      type: Number,
      required: [true, 'Players per team is required'],
      min: [1, 'Must have at least 1 player per team'],
    },
    registrationType: {
      type: String,
      enum: ['Team', 'Individual', 'Both'],
      default: 'Team',
    },
    rules: {
      type: [String],
      default: [],
    },
    imageTone: {
      type: String,
      default: 'tone-lime',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        if (ret.organizerId) ret.organizerId = ret.organizerId.toString();
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

tournamentSchema.index({ sport: 1, status: 1 });
tournamentSchema.index({ name: 'text', description: 'text', venue: 'text' });

const Tournament = mongoose.model('Tournament', tournamentSchema);
export default Tournament;

