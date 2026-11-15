import Match from '../models/Match.js';
import Team from '../models/Team.js';
import Tournament from '../models/Tournament.js';
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to convert "10:30 AM" or "14:30" to minutes from midnight
const timeToMinutes = (value) => {
  if (!value) return -1;
  const matched = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!matched) return -1;
  let hour = Number(matched[1]);
  const min = Number(matched[2]);
  const period = matched[3] ? matched[3].toUpperCase() : null;

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour * 60 + min;
};

// Check for venue conflict within 90 minutes
const checkVenueConflict = async ({ date, time, venue, excludeMatchId = null }) => {
  const reqStart = timeToMinutes(time);
  if (reqStart < 0 || !venue || !venue.trim()) return null;

  const matchesSameDayVenue = await Match.find({
    date,
    venue: { $regex: `^${venue.trim()}$`, $options: 'i' },
    status: { $nin: ['completed', 'postponed'] },
    ...(excludeMatchId ? { _id: { $ne: excludeMatchId } } : {}),
  });

  for (const m of matchesSameDayVenue) {
    const existingStart = timeToMinutes(m.time);
    if (existingStart >= 0 && Math.abs(existingStart - reqStart) < 90) {
      return m;
    }
  }

  return null;
};

// @desc    Get all matches
// @route   GET /api/matches
// @access  Public
export const getMatches = asyncHandler(async (req, res) => {
  const { tournamentId, status, date, venue } = req.query;
  const query = {};

  if (tournamentId) query.tournamentId = tournamentId;
  if (status) query.status = status;
  if (date) query.date = date;
  if (venue) query.venue = { $regex: venue, $options: 'i' };

  const matches = await Match.find(query).sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    count: matches.length,
    matches: matches.map((m) => m.toJSON()),
  });
});

// @desc    Get match by ID
// @route   GET /api/matches/:id
// @access  Public
export const getMatchById = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) {
    throw new ApiError(404, 'Match not found');
  }

  res.status(200).json({
    success: true,
    match: match.toJSON(),
  });
});

// @desc    Create new match fixture
// @route   POST /api/matches
// @access  Private (Organizer only)
export const createMatch = asyncHandler(async (req, res) => {
  const { tournamentId, round, teamAId, teamBId, date, time, venue, status = 'upcoming', notice } = req.body;

  if (teamAId === teamBId) {
    throw new ApiError(400, 'Team A and Team B cannot be the same team');
  }

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, 'Tournament not found');
  }

  const [teamA, teamB] = await Promise.all([Team.findById(teamAId), Team.findById(teamBId)]);
  if (!teamA || !teamB) {
    throw new ApiError(404, 'One or both teams not found');
  }

  if (teamA.tournamentId.toString() !== tournamentId || teamB.tournamentId.toString() !== tournamentId) {
    throw new ApiError(400, 'Both teams must be registered in this tournament');
  }

  // Check venue scheduling conflict
  const conflict = await checkVenueConflict({ date, time, venue });
  if (conflict) {
    throw new ApiError(
      409,
      `Venue conflict: ${venue} is already booked at ${conflict.time} on ${conflict.date} for another fixture`
    );
  }

  const match = await Match.create({
    tournamentId,
    round,
    teamAId,
    teamBId,
    date,
    time,
    venue: venue.trim(),
    status,
    notice: notice || '',
  });

  // Notify team players
  const audienceUserIds = Array.from(
    new Set([teamA.captainId, ...teamA.playerIds, teamB.captainId, ...teamB.playerIds].map((id) => id.toString()))
  );

  await Notification.create({
    title: `Fixture Scheduled: ${teamA.name} vs ${teamB.name}`,
    body: `${tournament.name} · ${round} · ${date} at ${time} · ${venue}`,
    kind: 'match',
    time: 'Just now',
    targetUserIds: audienceUserIds,
  });

  res.status(201).json({
    success: true,
    message: 'Match fixture scheduled successfully',
    match: match.toJSON(),
  });
});

// @desc    Update match schedule & details
// @route   PUT /api/matches/:id
// @access  Private (Organizer only)
export const updateMatch = asyncHandler(async (req, res) => {
  let match = await Match.findById(req.params.id);
  if (!match) {
    throw new ApiError(404, 'Match not found');
  }

  const { round, teamAId, teamBId, date, time, venue, status, notice, overs, scoreA, scoreB, winnerId } = req.body;

  const targetDate = date || match.date;
  const targetTime = time || match.time;
  const targetVenue = venue || match.venue;

  // If time or venue changed, check conflicts
  if (date !== match.date || time !== match.time || venue !== match.venue) {
    const conflict = await checkVenueConflict({
      date: targetDate,
      time: targetTime,
      venue: targetVenue,
      excludeMatchId: match._id,
    });
    if (conflict) {
      throw new ApiError(
        409,
        `Venue conflict: ${targetVenue} is already booked at ${conflict.time} on ${conflict.date}`
      );
    }
  }

  const venueChanged = venue && venue.trim().toLowerCase() !== match.venue.trim().toLowerCase();
  const timeChanged = (date && date !== match.date) || (time && time !== match.time);

  if (round) match.round = round;
  if (teamAId) match.teamAId = teamAId;
  if (teamBId) match.teamBId = teamBId;
  if (date) match.date = date;
  if (time) match.time = time;
  if (venue) match.venue = venue.trim();
  if (status) match.status = status;
  if (notice !== undefined) match.notice = notice;
  if (overs !== undefined) match.overs = overs;
  if (scoreA !== undefined) match.scoreA = scoreA;
  if (scoreB !== undefined) match.scoreB = scoreB;
  if (winnerId !== undefined) match.winnerId = winnerId;

  match = await match.save();

  // Send notifications if venue or schedule changed
  if (venueChanged || timeChanged) {
    const [teamA, teamB] = await Promise.all([Team.findById(match.teamAId), Team.findById(match.teamBId)]);
    if (teamA && teamB) {
      const audience = Array.from(
        new Set([teamA.captainId, ...teamA.playerIds, teamB.captainId, ...teamB.playerIds].map((id) => id.toString()))
      );

      await Notification.create({
        title: venueChanged ? 'Match venue updated' : 'Match rescheduled',
        body: `${teamA.name} vs ${teamB.name} · Now playing ${match.date} at ${match.time} · ${match.venue}`,
        kind: venueChanged ? 'venue' : 'match',
        time: 'Just now',
        targetUserIds: audience,
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Match updated successfully',
    match: match.toJSON(),
  });
});

// @desc    Update live match score
// @route   PATCH /api/matches/:id/score
// @access  Private (Organizer only)
export const updateMatchScore = asyncHandler(async (req, res) => {
  const { scoreA, scoreB, overs, notice, status } = req.body;
  const match = await Match.findById(req.params.id);
  if (!match) {
    throw new ApiError(404, 'Match not found');
  }

  if (scoreA !== undefined) match.scoreA = String(scoreA);
  if (scoreB !== undefined) match.scoreB = String(scoreB);
  if (overs !== undefined) match.overs = overs;
  if (notice !== undefined) match.notice = notice;
  if (status) match.status = status;
  else if (match.status === 'upcoming') match.status = 'live';

  await match.save();

  res.status(200).json({
    success: true,
    message: 'Score updated successfully',
    match: match.toJSON(),
  });
});

// @desc    Delete match fixture
// @route   DELETE /api/matches/:id
// @access  Private (Organizer only)
export const deleteMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) {
    throw new ApiError(404, 'Match not found');
  }

  await match.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Match fixture deleted successfully',
  });
});

