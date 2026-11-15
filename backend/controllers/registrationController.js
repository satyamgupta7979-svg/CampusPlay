import Registration from '../models/Registration.js';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to check registration block reason
const getBlockReason = async (tournament) => {
  const today = new Date().toISOString().slice(0, 10);
  if (tournament.status === 'completed') return 'This event has already completed.';
  if (tournament.status !== 'registration_open') return 'Registration is not open for this event.';
  if (today > tournament.registrationDeadline) return 'The registration deadline has passed.';

  // Count active entries
  const activeRegistrations = await Registration.countDocuments({
    tournamentId: tournament._id,
    status: { $ne: 'rejected' },
  });

  if (activeRegistrations >= tournament.maxTeams) {
    return 'This event has reached its maximum entry capacity.';
  }

  return null;
};

// @desc    Register for a tournament (team or individual)
// @route   POST /api/registrations
// @access  Private
export const createRegistration = asyncHandler(async (req, res) => {
  const { tournamentId, type = 'team', teamName, playerNames = [], captainName } = req.body;
  const studentId = req.user._id;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  // Check business rules
  const blockReason = await getBlockReason(tournament);
  if (blockReason) {
    throw new ApiError(400, blockReason);
  }

  // Check duplicate registration
  const existingReg = await Registration.findOne({
    tournamentId,
    studentId,
    status: { $ne: 'rejected' },
  });
  if (existingReg) {
    throw new ApiError(409, 'You have already registered for this tournament');
  }

  const isIndividual = type === 'individual' || tournament.registrationType === 'Individual';
  const effectiveCaptain = (captainName || req.user.name).trim();

  let teamId = null;
  let rosterUsers = [];

  if (!isIndividual) {
    if (!teamName || !teamName.trim()) {
      throw new ApiError(400, 'Team name is required for team registration');
    }

    const cleanedPlayerNames = (playerNames || []).map((n) => n.trim()).filter(Boolean);

    // Validate player roster
    if (!cleanedPlayerNames.some((n) => n.toLowerCase() === effectiveCaptain.toLowerCase())) {
      throw new ApiError(400, 'Include the captain in the player roster');
    }

    if (new Set(cleanedPlayerNames.map((n) => n.toLowerCase())).size !== cleanedPlayerNames.length) {
      throw new ApiError(400, 'Each player can only appear once in the roster');
    }

    if (cleanedPlayerNames.length !== tournament.playersPerTeam) {
      throw new ApiError(
        400,
        `This event requires exactly ${tournament.playersPerTeam} players, including the captain`
      );
    }

    // Resolve or create roster users
    const timestamp = Date.now();
    for (let i = 0; i < cleanedPlayerNames.length; i++) {
      const pName = cleanedPlayerNames[i];
      let foundUser = await User.findOne({ name: { $regex: `^${pName}$`, $options: 'i' } });
      if (!foundUser) {
        foundUser = await User.create({
          name: pName,
          email: `${pName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}.${timestamp}.${i}@campus.edu`,
          password: 'password123',
          collegeId: `CP-R${timestamp.toString().slice(-6)}${i}`,
          department: req.user.department || 'Campus',
          year: req.user.year || '1st Year',
          section: req.user.section || 'A',
          role: 'student',
          avatarColor: '#d5f28d',
        });
      }
      rosterUsers.push(foundUser);
    }

    // Check duplicate team name in this tournament
    const existingTeam = await Team.findOne({ tournamentId, name: teamName.trim() });
    if (existingTeam) {
      throw new ApiError(409, `A team named '${teamName.trim()}' already exists in this tournament`);
    }

    // Create Team
    const newTeam = await Team.create({
      name: teamName.trim(),
      tournamentId,
      department: req.user.department || 'Campus',
      captainId: studentId,
      playerIds: rosterUsers.map((u) => u._id),
      initials: teamName
        .trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      color: '#d5f28d',
    });

    teamId = newTeam._id;
  }

  // Create Registration
  const registration = await Registration.create({
    tournamentId,
    teamId: teamId || undefined,
    studentId,
    type: isIndividual ? 'individual' : 'team',
    status: isIndividual ? 'confirmed' : 'pending',
    playerNames: isIndividual ? [effectiveCaptain] : playerNames.map((n) => n.trim()),
    createdAt: new Date().toISOString().slice(0, 10),
  });

  // Target audience for notification
  const organizers = await User.find({ role: 'organizer' }).select('_id');
  const targetUserIds = Array.from(
    new Set([studentId.toString(), ...rosterUsers.map((u) => u._id.toString()), ...organizers.map((o) => o._id.toString())])
  );

  await Notification.create({
    title: isIndividual ? 'Individual entry confirmed' : 'New registration submitted',
    body: `${isIndividual ? effectiveCaptain : teamName} · ${tournament.name}`,
    kind: 'registration',
    time: 'Just now',
    targetUserIds,
  });

  res.status(201).json({
    success: true,
    message: isIndividual ? 'Registered successfully' : 'Team registration submitted for approval',
    registration: registration.toJSON(),
  });
});

// @desc    Get user's registrations
// @route   GET /api/registrations/my
// @access  Private
export const getMyRegistrations = asyncHandler(async (req, res) => {
  // Find teams where user is captain or player
  const userTeams = await Team.find({
    $or: [{ captainId: req.user._id }, { playerIds: req.user._id }],
  }).select('_id');

  const teamIds = userTeams.map((t) => t._id);

  const registrations = await Registration.find({
    $or: [{ studentId: req.user._id }, { teamId: { $in: teamIds } }],
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations: registrations.map((r) => r.toJSON()),
  });
});

// @desc    Get all registrations (Organizer view)
// @route   GET /api/registrations
// @access  Private
export const getAllRegistrations = asyncHandler(async (req, res) => {
  const { tournamentId, status, type } = req.query;
  const query = {};

  if (tournamentId) query.tournamentId = tournamentId;
  if (status && status !== 'All') query.status = status.toLowerCase();
  if (type) query.type = type;

  // Non-organizers can only see their own
  if (req.user.role !== 'organizer') {
    query.studentId = req.user._id;
  }

  const registrations = await Registration.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: registrations.length,
    registrations: registrations.map((r) => r.toJSON()),
  });
});

// @desc    Update registration status (Approve, Reject, Confirm)
// @route   PATCH /api/registrations/:id/status
// @access  Private (Organizer only)
export const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  registration.status = status;
  await registration.save();

  // Find tournament & team for notification details
  const tournament = await Tournament.findById(registration.tournamentId);
  let teamName = registration.playerNames[0] || 'Participant';
  let targetIds = [registration.studentId];

  if (registration.teamId) {
    const team = await Team.findById(registration.teamId);
    if (team) {
      teamName = team.name;
      targetIds = [team.captainId, ...team.playerIds];
    }
  }

  // Send status update notification
  await Notification.create({
    title:
      status === 'approved'
        ? 'Your registration was approved!'
        : status === 'confirmed'
        ? 'Registration confirmed'
        : 'Registration update',
    body: `${teamName} · ${tournament ? tournament.name : 'Tournament'} · ${status}`,
    kind: 'registration',
    time: 'Just now',
    targetUserIds: targetIds,
  });

  res.status(200).json({
    success: true,
    message: `Registration status updated to ${status}`,
    registration: registration.toJSON(),
  });
});

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student owner or Organizer)
export const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    throw new ApiError(404, 'Registration not found');
  }

  if (req.user.role !== 'organizer' && registration.studentId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to cancel this registration');
  }

  if (registration.status === 'confirmed' && req.user.role !== 'organizer') {
    throw new ApiError(400, 'Confirmed registrations cannot be cancelled. Contact the tournament organizer.');
  }

  // If team was created, remove it if not scheduled in matches
  if (registration.teamId) {
    await Team.findByIdAndDelete(registration.teamId);
  }

  await registration.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Registration cancelled successfully',
  });
});

