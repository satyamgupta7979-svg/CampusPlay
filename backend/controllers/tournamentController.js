import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import Registration from '../models/Registration.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all tournaments with filtering and search
// @route   GET /api/tournaments
// @access  Public
export const getTournaments = asyncHandler(async (req, res) => {
  const { sport, status, search } = req.query;
  const query = {};

  if (sport && sport !== 'All sports') {
    query.sport = sport;
  }
  if (status && status !== 'All statuses') {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
    ];
  }

  const tournaments = await Tournament.find(query).sort({ startDate: 1 });

  res.status(200).json({
    success: true,
    count: tournaments.length,
    tournaments: tournaments.map((t) => t.toJSON()),
  });
});

// @desc    Get single tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
export const getTournamentById = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  res.status(200).json({
    success: true,
    tournament: tournament.toJSON(),
  });
});

// @desc    Create new tournament
// @route   POST /api/tournaments
// @access  Private (Organizer only)
export const createTournament = asyncHandler(async (req, res) => {
  const {
    name,
    sport,
    description,
    status = 'upcoming',
    startDate,
    endDate,
    registrationDeadline,
    venue,
    organizer,
    format,
    maxTeams,
    playersPerTeam,
    registrationType = 'Team',
    rules = [],
    imageTone = 'tone-lime',
  } = req.body;

  const tournament = await Tournament.create({
    name,
    sport,
    description,
    status,
    startDate,
    endDate,
    registrationDeadline,
    venue,
    organizer: organizer || req.user.name || 'Campus Sports Committee',
    organizerId: req.user._id,
    format,
    maxTeams,
    playersPerTeam,
    registrationType,
    rules,
    imageTone,
  });

  // Create broadcast announcement notification
  const students = await User.find({ role: 'student' }).select('_id');
  await Notification.create({
    title: `New Tournament Announced: ${tournament.name}`,
    body: `${tournament.sport} · Starts ${tournament.startDate} · Register by ${tournament.registrationDeadline}`,
    kind: 'reminder',
    time: 'Just now',
    targetUserIds: students.map((s) => s._id),
  });

  res.status(201).json({
    success: true,
    message: 'Tournament created successfully',
    tournament: tournament.toJSON(),
  });
});

// @desc    Update tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Organizer only)
export const updateTournament = asyncHandler(async (req, res) => {
  let tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  const allowedUpdates = [
    'name',
    'sport',
    'description',
    'status',
    'startDate',
    'endDate',
    'registrationDeadline',
    'venue',
    'organizer',
    'format',
    'maxTeams',
    'playersPerTeam',
    'registrationType',
    'rules',
    'imageTone',
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      tournament[field] = req.body[field];
    }
  });

  tournament = await tournament.save();

  res.status(200).json({
    success: true,
    message: 'Tournament updated successfully',
    tournament: tournament.toJSON(),
  });
});

// @desc    Delete tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Organizer only)
export const deleteTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  // Delete associated teams, matches, and registrations
  await Promise.all([
    Team.deleteMany({ tournamentId: tournament._id }),
    Match.deleteMany({ tournamentId: tournament._id }),
    Registration.deleteMany({ tournamentId: tournament._id }),
    tournament.deleteOne(),
  ]);

  res.status(200).json({
    success: true,
    message: 'Tournament and all associated fixtures, teams and registrations deleted successfully',
  });
});

// @desc    Get teams in tournament
// @route   GET /api/tournaments/:id/teams
// @access  Public
export const getTournamentTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ tournamentId: req.params.id }).sort({ points: -1, wins: -1 });

  res.status(200).json({
    success: true,
    count: teams.length,
    teams: teams.map((t) => t.toJSON()),
  });
});

// @desc    Get tournament fixtures
// @route   GET /api/tournaments/:id/fixtures
// @access  Public
export const getTournamentFixtures = asyncHandler(async (req, res) => {
  const matches = await Match.find({ tournamentId: req.params.id }).sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    count: matches.length,
    matches: matches.map((m) => m.toJSON()),
  });
});

// @desc    Get tournament participants count and list
// @route   GET /api/tournaments/:id/participants
// @access  Public
export const getTournamentParticipants = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    tournamentId: req.params.id,
    status: { $ne: 'rejected' },
  });

  const participantNames = new Set();
  registrations.forEach((r) => {
    (r.playerNames || []).forEach((name) => participantNames.add(name.trim()));
  });

  res.status(200).json({
    success: true,
    count: participantNames.size,
    participants: Array.from(participantNames),
  });
});

