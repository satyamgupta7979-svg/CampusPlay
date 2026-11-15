import type { AppData, Match, Registration, Tournament } from '../types'

export function getStudentTeamIds(data: AppData, studentId: string): Set<string> {
  const registered = data.registrations
    .filter((registration) => registration.studentId === studentId && registration.teamId)
    .map((registration) => registration.teamId as string)
  const rostered = data.teams
    .filter((team) => team.captainId === studentId || team.playerIds.includes(studentId))
    .map((team) => team.id)
  return new Set([...registered, ...rostered])
}

export function getTeamAudienceIds(data: AppData, teamIds: string[]): string[] {
  const ids = new Set(teamIds)
  const registeredPlayers = data.registrations
    .filter((registration) => registration.teamId && ids.has(registration.teamId))
    .flatMap((registration) => [registration.studentId, ...(data.teams.find((team) => team.id === registration.teamId)?.playerIds ?? [])])
  const rosterPlayers = data.teams
    .filter((team) => ids.has(team.id))
    .flatMap((team) => [team.captainId, ...team.playerIds])
  return Array.from(new Set([...registeredPlayers, ...rosterPlayers].filter(Boolean)))
}

export function getRegistrationAudienceIds(data: AppData, registration: Registration): string[] {
  return Array.from(new Set([
    registration.studentId,
    ...(registration.teamId ? data.teams.find((team) => team.id === registration.teamId)?.playerIds ?? [] : []),
  ].filter(Boolean)))
}

export function getTournamentEntryCount(data: AppData, tournamentId: string): number {
  const tournament = data.tournaments.find((item) => item.id === tournamentId)
  if (!tournament) return 0
  const registrations = data.registrations.filter((registration) => registration.tournamentId === tournamentId)
  const activeRegistrations = registrations.filter((registration) => registration.status !== 'rejected')
  const activeTeamIds = activeRegistrations.filter((registration) => registration.type === 'team' && registration.teamId).map((registration) => registration.teamId as string)
  const previouslyRegisteredTeamIds = new Set(registrations.filter((registration) => registration.teamId).map((registration) => registration.teamId as string))
  const unregisteredSeedTeamIds = data.teams.filter((team) => team.tournamentId === tournamentId && !previouslyRegisteredTeamIds.has(team.id)).map((team) => team.id)
  const teamEntries = new Set([...activeTeamIds, ...unregisteredSeedTeamIds]).size
  const individualEntries = activeRegistrations.filter((registration) => registration.type === 'individual').length
  if (tournament.registrationType === 'Individual') return individualEntries
  if (tournament.registrationType === 'Both') return teamEntries + individualEntries
  return teamEntries
}

export function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getRegistrationBlockReason(data: AppData, tournament: Tournament, today = getLocalDateKey()): string | undefined {
  if (tournament.status === 'completed') return 'This event has already completed.'
  if (tournament.status !== 'registration_open') return 'Registration is not open for this event.'
  if (today > tournament.registrationDeadline) return 'The registration deadline has passed.'
  if (getTournamentEntryCount(data, tournament.id) >= tournament.maxTeams) return 'This event has reached its entry limit.'
  return undefined
}

export function countUniqueParticipants(data: AppData): number {
  const participantNames = data.registrations.flatMap((registration) => {
    const names = registration.playerNames.map((name) => name.trim().toLowerCase()).filter(Boolean)
    return names.length ? names : [registration.studentId]
  })
  return new Set(participantNames).size
}

export function countRegistrationParticipants(registrations: Registration[]): number {
  return registrations.reduce((count, registration) => count + Math.max(1, registration.playerNames.filter((name) => name.trim()).length), 0)
}

export function timeToMinutes(value: string): number {
  const matched = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i) ?? value.match(/(\d{2}):(\d{2})/)
  if (!matched) return -1
  let hour = Number(matched[1])
  if (matched[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12
  if (matched[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0
  return hour * 60 + Number(matched[2])
}

export function findFixtureConflict(
  matches: Match[],
  slot: { date: string; time: string; venue: string; excludeMatchId?: string },
): Match | undefined {
  const start = timeToMinutes(slot.time)
  if (start < 0 || !slot.venue.trim()) return undefined
  return matches.find((match) =>
    match.id !== slot.excludeMatchId &&
    match.status !== 'completed' &&
    match.status !== 'postponed' &&
    match.date === slot.date &&
    match.venue.toLowerCase().trim() === slot.venue.toLowerCase().trim() &&
    Math.abs(timeToMinutes(match.time) - start) < 90,
  )
}
