import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import Registration from '../models/Registration.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get organizer dashboard high-level metrics
// @route   GET /api/analytics/dashboard
// @access  Private (Organizer only)
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const [
    totalTournaments,
    activeTournaments,
    upcomingTournaments,
    completedTournaments,
    totalTeams,
    pendingRegistrations,
    upcomingMatches,
    completedMatches,
    liveMatches,
  ] = await Promise.all([
    Tournament.countDocuments(),
    Tournament.countDocuments({ status: { $in: ['live', 'registration_open'] } }),
    Tournament.countDocuments({ status: 'upcoming' }),
    Tournament.countDocuments({ status: 'completed' }),
    Team.countDocuments(),
    Registration.countDocuments({ status: 'pending' }),
    Match.countDocuments({ status: 'upcoming' }),
    Match.countDocuments({ status: 'completed' }),
    Match.countDocuments({ status: 'live' }),
  ]);

  // Count distinct participants across all active registrations
  const registrations = await Registration.find({ status: { $ne: 'rejected' } }).select('playerNames studentId');
  const participantSet = new Set();
  registrations.forEach((reg) => {
    if (reg.playerNames && reg.playerNames.length > 0) {
      reg.playerNames.forEach((name) => participantSet.add(name.trim().toLowerCase()));
    } else if (reg.studentId) {
      participantSet.add(reg.studentId.toString());
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalTournaments,
      activeTournaments,
      upcomingTournaments,
      completedTournaments,
      totalTeams,
      totalParticipants: participantSet.size,
      pendingRegistrations,
      upcomingMatches,
      completedMatches,
      liveMatches,
    },
  });
});

// @desc    Get sport-wise & tournament-wise participation stats
// @route   GET /api/analytics/participation
// @access  Private (Organizer only)
export const getParticipationAnalytics = asyncHandler(async (req, res) => {
  // Aggregate tournaments and teams by sport
  const sportAggregation = await Tournament.aggregate([
    {
      $lookup: {
        from: 'teams',
        localField: '_id',
        foreignField: 'tournamentId',
        as: 'teams',
      },
    },
    {
      $lookup: {
        from: 'registrations',
        localField: '_id',
        foreignField: 'tournamentId',
        as: 'registrations',
      },
    },
    {
      $group: {
        _id: '$sport',
        tournamentCount: { $sum: 1 },
        teamCount: { $sum: { $size: '$teams' } },
        registrationCount: { $sum: { $size: '$registrations' } },
      },
    },
    {
      $project: {
        sport: '$_id',
        tournamentCount: 1,
        teamCount: 1,
        registrationCount: 1,
        _id: 0,
      },
    },
    { $sort: { teamCount: -1 } },
  ]);

  // Aggregate department participation
  const departmentAggregation = await Team.aggregate([
    {
      $group: {
        _id: '$department',
        teams: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        totalWins: { $sum: '$wins' },
      },
    },
    {
      $project: {
        department: '$_id',
        teams: 1,
        totalPoints: 1,
        totalWins: 1,
        _id: 0,
      },
    },
    { $sort: { teams: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      bySport: sportAggregation,
      byDepartment: departmentAggregation,
    },
  });
});

// @desc    Get team performance & match statistics
// @route   GET /api/analytics/performance
// @access  Private (Organizer only)
export const getPerformanceAnalytics = asyncHandler(async (req, res) => {
  const topTeams = await Team.find()
    .sort({ points: -1, wins: -1 })
    .limit(10)
    .populate('tournamentId', 'name sport');

  const matchStats = await Match.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      topTeams: topTeams.map((t) => ({
        ...t.toJSON(),
        tournamentName: t.tournamentId?.name,
        sport: t.tournamentId?.sport,
      })),
      matchDistribution: matchStats,
    },
  });
});

