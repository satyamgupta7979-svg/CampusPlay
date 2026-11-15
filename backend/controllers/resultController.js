import Match from '../models/Match.js';
import Team from '../models/Team.js';
import Tournament from '../models/Tournament.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to recalculate team stats from completed matches
export const updateTeamStats = async (tournamentId) => {
  const teams = await Team.find({ tournamentId });
  const completedMatches = await Match.find({ tournamentId, status: 'completed' });

  for (const team of teams) {
    const teamMatches = completedMatches.filter(
      (m) => m.teamAId.toString() === team._id.toString() || m.teamBId.toString() === team._id.toString()
    );

    const played = teamMatches.length;
    const wins = teamMatches.filter((m) => m.winnerId && m.winnerId.toString() === team._id.toString()).length;
    const losses = played - wins;
    const points = wins * 3;

    team.played = played;
    team.wins = wins;
    team.losses = losses;
    team.points = points;
    await team.save();
  }
};

// @desc    Submit match results & declare winner
// @route   POST /api/results/:matchId
// @access  Private (Organizer only)
export const submitResult = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const { scoreA, scoreB, winnerId, notice, overs } = req.body;

  const match = await Match.findById(matchId);
  if (!match) {
    throw new ApiError(404, 'Match not found');
  }

  const [teamA, teamB, tournament] = await Promise.all([
    Team.findById(match.teamAId),
    Team.findById(match.teamBId),
    Tournament.findById(match.tournamentId),
  ]);

  if (!teamA || !teamB) {
    throw new ApiError(404, 'Match teams not found');
  }

  // Determine winner if not provided explicitly
  let resolvedWinnerId = winnerId;
  if (!resolvedWinnerId && scoreA !== undefined && scoreB !== undefined) {
    const numA = Number(scoreA);
    const numB = Number(scoreB);
    if (!isNaN(numA) && !isNaN(numB)) {
      resolvedWinnerId = numA >= numB ? teamA._id : teamB._id;
    }
  }

  match.scoreA = String(scoreA ?? match.scoreA ?? '0');
  match.scoreB = String(scoreB ?? match.scoreB ?? '0');
  match.winnerId = resolvedWinnerId || undefined;
  match.status = 'completed';
  if (notice) match.notice = notice;
  if (overs) match.overs = overs;

  await match.save();

  // Recalculate team standings for this tournament
  await updateTeamStats(match.tournamentId);

  // Send result notification to all participants of both teams
  const winnerTeam = resolvedWinnerId?.toString() === teamA._id.toString() ? teamA : teamB;
  const audience = Array.from(
    new Set([teamA.captainId, ...teamA.playerIds, teamB.captainId, ...teamB.playerIds].map((id) => id.toString()))
  );

  await Notification.create({
    title: `Match Result: ${winnerTeam.name} won!`,
    body: `${teamA.name} (${match.scoreA}) vs ${teamB.name} (${match.scoreB}) · ${tournament ? tournament.name : ''}`,
    kind: 'match',
    time: 'Just now',
    targetUserIds: audience,
  });

  res.status(200).json({
    success: true,
    message: 'Match result submitted and standings updated',
    match: match.toJSON(),
  });
});

// @desc    Get all completed match results
// @route   GET /api/results
// @access  Public
export const getResults = asyncHandler(async (req, res) => {
  const { tournamentId } = req.query;
  const query = { status: 'completed' };

  if (tournamentId) {
    query.tournamentId = tournamentId;
  }

  const matches = await Match.find(query).sort({ date: -1, updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: matches.length,
    results: matches.map((m) => m.toJSON()),
  });
});

// @desc    Get tournament leaderboard
// @route   GET /api/results/leaderboard/:tournamentId
// @access  Public
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  const teams = await Team.find({ tournamentId }).sort({
    points: -1,
    wins: -1,
    losses: 1,
    name: 1,
  });

  res.status(200).json({
    success: true,
    tournament: tournament.toJSON(),
    count: teams.length,
    leaderboard: teams.map((team, index) => ({
      rank: index + 1,
      ...team.toJSON(),
    })),
  });
});

