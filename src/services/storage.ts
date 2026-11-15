import { createSeedData } from '../data/seed'
import type { AppData, Notice } from '../types'

const STORAGE_KEY = 'campusplay-data-v1'
const LEGACY_TEAM_NAMES: Record<string, string> = {
  'team-01': 'CSE Warriors', 'team-02': 'CSE Titans', 'team-03': 'CSE Kings', 'team-04': 'CSE 2A', 'team-05': 'CSE 2B',
  'team-06': 'Mech Mavericks', 'team-07': 'Volt United', 'team-08': 'Civil Strikers', 'team-09': 'Biz Falcons', 'team-10': 'CSE 3B',
  'team-11': 'Mech Meteors', 'team-12': 'Powerhouse XI', 'team-13': 'Block North', 'team-14': 'Biz Ballers', 'team-15': 'CSE 1A',
  'team-16': 'CSE 3A', 'team-17': 'Robo Rovers', 'team-18': 'Grid Guardians', 'team-19': 'Brick Breakers', 'team-20': 'Market Makers',
}
const LEGACY_VENUES: Record<string, string> = {
  'tournament-01': 'Main Ground', 'tournament-02': 'Sports Complex · Court 2', 'tournament-03': 'North Field',
  'tournament-04': 'Indoor Arena', 'tournament-05': 'Central Court', 'tournament-06': 'Rec Room · Table 4',
  'tournament-07': 'Library Commons', 'tournament-08': 'Student Union', 'tournament-09': 'Track & Field', 'tournament-10': 'East Turf',
}

function normalizeNotice(notice: Notice, teamNameChanges: Map<string, string>, venueChanges: Map<string, string>): Notice {
  const { read: _legacyRead, ...current } = notice as Notice & { read?: boolean }
  let body = current.body
  for (const [oldName, newName] of teamNameChanges) body = body.split(oldName).join(newName)
  for (const [oldVenue, newVenue] of venueChanges) body = body.split(oldVenue).join(newVenue)
  return { ...current, body, readByUserIds: Array.isArray(current.readByUserIds) ? current.readByUserIds : [] }
}

function migrateSeededRecords(parsed: AppData): AppData {
  if ((parsed.seedRevision ?? 0) >= 3) {
    const seedNotices = createSeedData().notifications
    return {
      ...parsed,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications.map((notice) => normalizeNotice(notice, new Map(), new Map())) : seedNotices,
    }
  }

  const seed = createSeedData()
  const seedTournaments = new Map(seed.tournaments.map((item) => [item.id, item]))
  const seedTeams = new Map(seed.teams.map((item) => [item.id, item]))
  const seedMatches = new Map(seed.matches.map((item) => [item.id, item]))
  const seededDemoStudentName = seed.users.find((user) => user.id === 'student-01')?.name
  const venueChanges = new Map<string, string>()
  for (const [id, oldVenue] of Object.entries(LEGACY_VENUES)) {
    const newVenue = seedTournaments.get(id)?.venue
    if (newVenue && newVenue !== oldVenue) venueChanges.set(oldVenue, newVenue)
  }
  const teamNameChanges = new Map<string, string>()
  for (const [id, oldName] of Object.entries(LEGACY_TEAM_NAMES)) {
    const newName = seedTeams.get(id)?.name
    if (newName && newName !== oldName) teamNameChanges.set(oldName, newName)
  }

  return {
    ...parsed,
    seedRevision: 3,
    users: parsed.users.map((user) => user.id === 'student-01' && user.name === 'Manthan Singh' && seededDemoStudentName
      ? { ...user, name: seededDemoStudentName }
      : user),
    tournaments: parsed.tournaments.map((item) => {
      const oldVenue = LEGACY_VENUES[item.id]
      const updated = seedTournaments.get(item.id)
      return oldVenue && updated && item.venue === oldVenue ? { ...item, venue: updated.venue } : item
    }),
    teams: parsed.teams.map((item) => {
      const updated = seedTeams.get(item.id)
      return LEGACY_TEAM_NAMES[item.id] === item.name && updated
        ? { ...item, name: updated.name, department: updated.department, initials: updated.initials }
        : item
    }),
    matches: [
      ...parsed.matches.map((item) => {
        const oldVenue = LEGACY_VENUES[item.tournamentId]
        const updated = seedMatches.get(item.id)
        return oldVenue && updated && item.venue === oldVenue ? { ...item, venue: updated.venue } : item
      }),
      ...seed.matches.filter((item) => item.id === 'match-31' && !parsed.matches.some((existing) => existing.id === item.id)),
    ],
    registrations: parsed.registrations.map((registration) => {
      const seededRegistration = ['reg-01', 'reg-03', 'reg-07'].includes(registration.id)
      return seededRegistration && seededDemoStudentName
        ? { ...registration, playerNames: registration.playerNames.map((name) => name === 'Manthan Singh' ? seededDemoStudentName : name) }
        : registration
    }),
    notifications: Array.isArray(parsed.notifications)
      ? parsed.notifications.map((notice) => normalizeNotice(notice, teamNameChanges, venueChanges))
      : seed.notifications,
  }
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return createSeedData()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed?.version === 1 && Array.isArray(parsed.tournaments) && Array.isArray(parsed.matches)) {
        const normalized = migrateSeededRecords(parsed)
        saveData(normalized)
        return normalized
      }
    }
  } catch {
    // A corrupt local prototype snapshot should never prevent the demo from loading.
  }
  const initial = createSeedData()
  saveData(initial)
  return initial
}

export function saveData(data: AppData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Private browsing/storage restrictions are non-fatal; the current in-memory session still works.
  }
}

export function resetData(): AppData {
  const seed = createSeedData()
  saveData(seed)
  return seed
}
