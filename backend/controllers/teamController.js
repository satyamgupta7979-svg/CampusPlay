import Team from '../models/Team.js';
import Tournament from '../models/Tournament.js';
import User from '../models/User.js';
import Match from '../models/Match.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
export const getTeams = asyncHandler(async (req, res) => {
  const { tournamentId, department } = req.query;
  const query = {};

  if (tournamentId) query.tournamentId = tournamentId;
  if (department) query.department = department;

  const teams = await Team.find(query).sort({ points: -1, wins: -1 });

  res.status(200).json({
    success: true,
    count: teams.length,
    teams: teams.map((t) => t.toJSON()),
  });
});

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Public
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  res.status(200).json({
    success: true,
    team: team.toJSON(),
  });
});

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
export const createTeam = asyncHandler(async (req, res) => {
  const { name, tournamentId, department, captainId, playerIds = [], initials, color } = req.body;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  // Check duplicate team name in same tournament
  const existingTeam = await Team.findOne({ tournamentId, name: name.trim() });
  if (existingTeam) {
    throw new ApiError(409, `A team named '${name}' is already registered in this tournament`);
  }

  // Validate team capacity
  const teamCount = await Team.countDocuments({ tournamentId });
  if (teamCount >= tournament.maxTeams) {
    throw new ApiError(400, 'Tournament has reached maximum team capacity');
  }

  const resolvedCaptain = captainId || req.user._id;
  const resolvedPlayers = playerIds.length > 0 ? playerIds : [resolvedCaptain];

  const team = await Team.create({
    name: name.trim(),
    tournamentId,
    department: department || req.user.department || 'Campus',
    captainId: resolvedCaptain,
    playerIds: resolvedPlayers,
    initials:
      initials ||
      name
        .trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    color: color || '#d5f28d',
  });

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    team: team.toJSON(),
  });
});

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
export const updateTeam = asyncHandler(async (req, res) => {
  let team = await Team.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check permission: Captain or Organizer
  if (req.user.role !== 'organizer' && team.captainId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team captain or organizers can update team details');
  }

  const { name, department, initials, color } = req.body;
  if (name) team.name = name.trim();
  if (department) team.department = department.trim();
  if (initials) team.initials = initials;
  if (color) team.color = color;

  team = await team.save();

  res.status(200).json({
    success: true,
    message: 'Team updated successfully',
    team: team.toJSON(),
  });
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Captain or Organizer)
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (req.user.role !== 'organizer' && team.captainId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team captain or organizers can delete a team');
  }

  // Check if team has played matches
  const matchCount = await Match.countDocuments({
    $or: [{ teamAId: team._id }, { teamBId: team._id }],
  });
  if (matchCount > 0 && req.user.role !== 'organizer') {
    throw new ApiError(400, 'Cannot delete team with scheduled or completed matches');
  }

  await team.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Team deleted successfully',
  });
});

// @desc    Add players to team
// @route   POST /api/teams/:id/players
// @access  Private (Captain or Organizer)
export const addPlayer = asyncHandler(async (req, res) => {
  const { playerId, playerName } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (req.user.role !== 'organizer' && team.captainId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only captain or organizer can add players to the team');
  }

  let userToAdd;
  if (playerId) {
    userToAdd = await User.findById(playerId);
  } else if (playerName) {
    userToAdd = await User.findOne({ name: { $regex: `^${playerName}$`, $options: 'i' } });
  }

  if (!userToAdd) {
    throw new ApiError(404, 'Player not found');
  }

  if (team.playerIds.some((p) => p.toString() === userToAdd._id.toString())) {
    throw new ApiError(400, 'Player is already in this team');
  }

  team.playerIds.push(userToAdd._id);
  await team.save();

  res.status(200).json({
    success: true,
    message: 'Player added to team',
    team: team.toJSON(),
  });
});

// @desc    Remove player from team
// @route   DELETE /api/teams/:id/players/:playerId
// @access  Private (Captain or Organizer)
export const removePlayer = asyncHandler(async (req, res) => {
  const { id, playerId } = req.params;
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (req.user.role !== 'organizer' && team.captainId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only captain or organizer can remove players');
  }

  if (team.captainId.toString() === playerId) {
    throw new ApiError(400, 'Cannot remove the captain from the team roster');
  }

  team.playerIds = team.playerIds.filter((p) => p.toString() !== playerId);
  await team.save();

  res.status(200).json({
    success: true,
    message: 'Player removed from team',
    team: team.toJSON(),
  });
});

// @desc    Assign team captain
// @route   PATCH /api/teams/:id/captain
// @access  Private (Current Captain or Organizer)
export const assignCaptain = asyncHandler(async (req, res) => {
  const { newCaptainId } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (req.user.role !== 'organizer' && team.captainId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only current captain or organizer can reassign captain');
  }

  const newCaptain = await User.findById(newCaptainId);
  if (!newCaptain) {
    throw new ApiError(404, 'New captain user not found');
  }

  team.captainId = newCaptain._id;
  if (!team.playerIds.some((p) => p.toString() === newCaptain._id.toString())) {
    team.playerIds.push(newCaptain._id);
  }
  await team.save();

  res.status(200).json({
    success: true,
    message: `Captain updated to ${newCaptain.name}`,
    team: team.toJSON(),
  });
});

