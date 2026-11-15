export type Sport = 'Cricket' | 'Football' | 'Basketball' | 'Volleyball' | 'Badminton' | 'Table Tennis' | 'Chess' | 'Carrom' | 'Athletics'
export type Role = 'student' | 'organizer'
export type TournamentStatus = 'registration_open' | 'upcoming' | 'live' | 'completed'
export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'postponed'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'confirmed'

export interface User {
  id: string
  name: string
  email: string
  collegeId: string
  department: string
  year: string
  section: string
  role: Role
  avatarColor?: string
}

export interface Tournament {
  id: string
  name: string
  sport: Sport
  description: string
  status: TournamentStatus
  startDate: string
  endDate: string
  registrationDeadline: string
  venue: string
  organizer: string
  format: 'Knockout' | 'League' | 'Round Robin' | 'League + Knockout'
  maxTeams: number
  playersPerTeam: number
  registrationType: 'Team' | 'Individual' | 'Both'
  rules: string[]
  imageTone: string
}

export interface Team {
  id: string
  name: string
  tournamentId: string
  department: string
  captainId: string
  playerIds: string[]
  played: number
  wins: number
  losses: number
  points: number
  initials: string
  color: string
}

export interface Match {
  id: string
  tournamentId: string
  round: string
  teamAId: string
  teamBId: string
  date: string
  time: string
  venue: string
  status: MatchStatus
  scoreA?: string
  scoreB?: string
  winnerId?: string
  overs?: string
  notice?: string
}

export interface Registration {
  id: string
  tournamentId: string
  teamId?: string
  studentId: string
  type: 'team' | 'individual'
  status: RegistrationStatus
  createdAt: string
  playerNames: string[]
}

export interface Notice {
  id: string
  title: string
  body: string
  kind: 'match' | 'registration' | 'venue' | 'reminder'
  time: string
  readByUserIds?: string[]
  targetUserIds?: string[]
}

export interface Session {
  userId: string
  role: Role
}

export interface AppData {
  version: number
  seedRevision?: number
  users: User[]
  tournaments: Tournament[]
  teams: Team[]
  matches: Match[]
  registrations: Registration[]
  notifications: Notice[]
  session: Session | null
  theme: 'light' | 'dark'
}
