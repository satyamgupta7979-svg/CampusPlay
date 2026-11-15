// import type { AppData, Match, Sport, Team, Tournament, User } from '../types'

// const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Business']
// const colors = ['#d5f28d', '#b8dfe0', '#f6d39b', '#d8c6ef', '#f0b8a7', '#b8caed']
// const sports: Sport[] = ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Table Tennis', 'Chess', 'Carrom', 'Athletics']

// const tournamentSpecs: Array<[string, Sport, string, string, string, Tournament['status'], number, number]> = [
//   ['Inter-Class Cricket Championship', 'Cricket', '2026-11-02', '2026-12-05', 'Koshish Ground', 'live', 16, 11],
//   ['Badminton Open 2026', 'Badminton', '2026-11-03', '2026-11-28', 'Badminton Court', 'live', 24, 2],
//   ['Campus Football League', 'Football', '2026-11-22', '2026-12-12', 'Soccer Ground', 'registration_open', 12, 11],
//   ['Hoops on Campus', 'Basketball', '2026-11-29', '2026-12-04', 'Basketball Court', 'upcoming', 8, 5],
//   ['Block Volleyball Cup', 'Volleyball', '2026-12-02', '2026-12-08', 'Volleyball Court', 'upcoming', 10, 6],
//   ['Table Tennis Rally', 'Table Tennis', '2026-11-13', '2026-11-30', 'ET-607', 'live', 16, 2],
//   ['Checkmate Challenge', 'Chess', '2026-11-18', '2026-11-21', 'MT-304', 'upcoming', 32, 1],
//   ['Carrom Doubles Night', 'Carrom', '2026-11-11', '2026-11-12', 'Carrom Hall', 'completed', 16, 2],
//   ['Campus Athletics Meet', 'Athletics', '2026-11-25', '2026-11-28', 'Track & Field', 'registration_open', 80, 1],
//   ['Freshers Futsal Series', 'Football', '2026-11-06', '2026-11-10', 'Soccer Ground', 'completed', 8, 5],
// ]

// const tournaments: Tournament[] = tournamentSpecs.map(([name, sport, startDate, endDate, venue, status, maxTeams, playersPerTeam], i) => ({
//   id: `tournament-${String(i + 1).padStart(2, '0')}`,
//   name,
//   sport,
//   description: `${sport} brings the campus together. Register your class or block, bring your best game, and make this season one to remember.`,
//   status,
//   startDate,
//   endDate,
//   registrationDeadline: i === 0 ? '2026-11-18' : '2026-11-20',
//   venue,
//   organizer: i % 2 ? 'Campus Sports Committee' : 'Student Athletics Council',
//   format: i % 3 === 0 ? 'Knockout' : i % 3 === 1 ? 'Round Robin' : 'League',
//   maxTeams,
//   playersPerTeam,
//   registrationType: i === 8 ? 'Individual' : 'Team',
//   rules: sport === 'Cricket' ? ['11 players per team', '10 overs per innings', 'Knockout format', 'College ID required'] : ['Represent your class, department or block', 'Arrive 15 minutes before your fixture', 'College ID required', 'Respect the referee’s decision'],
//   imageTone: ['tone-lime', 'tone-blue', 'tone-orange', 'tone-purple', 'tone-teal'][i % 5],
// }))

// const names = [
//   'Jasnoor Kaur', 'Aarav Patel', 'Isha Sharma', 'Rahul Mehta', 'Aman Verma', 'Diya Nair', 'Kabir Rao', 'Sana Khan', 'Arjun Reddy', 'Mira Joshi',
//   'Vivaan Gupta', 'Anaya Iyer', 'Aditya Shah', 'Zoya Ali', 'Rohan Das', 'Kiara Bose', 'Dev Malhotra', 'Tara Menon', 'Neil Thomas', 'Pia Kapoor',
//   'Ishaan Roy', 'Aditi Kulkarni', 'Reyansh Jain', 'Myra Sethi', 'Kunal Bhat', 'Sia Chawla', 'Yash Pandey', 'Nisha Rao', 'Samar Gill', 'Riya Sen',
//   'Omkar Pawar', 'Aanya Desai', 'Veer Sood', 'Navya Krishnan', 'Dhruv Saxena', 'Meera Pillai', 'Atharv Joshi', 'Pari Shah', 'Ayaan Sheikh', 'Saanvi Rao',
//   'Karan Gill', 'Anvi Kapoor', 'Siddharth Bose', 'Ira Menon', 'Ritvik Nair', 'Avni Mehta', 'Pranav Shah', 'Tia Banerjee', 'Lakshya Jain', 'Suhana Das',
// ]

// const students: User[] = names.map((name, i) => ({
//   id: `student-${String(i + 1).padStart(2, '0')}`,
//   name,
//   email: `${name.toLowerCase().replace(/ /g, '.')}@campus.edu`,
//   collegeId: `CP${String(240100 + i).slice(2)}`,
//   department: departments[i % departments.length],
//   year: `${(i % 4) + 1}${['st', 'nd', 'rd', 'th'][i % 4]} Year`,
//   section: ['A', 'B', 'C'][i % 3],
//   role: 'student',
//   avatarColor: colors[i % colors.length],
// }))

// const organizer: User = {
//   id: 'organizer-demo', name: 'Rhea Kapoor', email: 'sports@campus.edu', collegeId: 'CP-SPORTS',
//   department: 'Sports Committee', year: 'Coordinator', section: '—', role: 'organizer', avatarColor: '#d5f28d',
// }

// const teamSpecs: Array<[string, string, number, number]> = [
//   ['BTech-2A', 'BTech', 0, 0], ['BTech-2B', 'BTech', 3, 0],
//   ['BCA-1A', 'BCA', 4, 3], ['BCA-1B', 'BCA', 0, 1], ['BCA-2A', 'BCA', 1, 1],
//   ['BTech-1A', 'BTech', 2, 2], ['BPharma-2A', 'BPharma', 5, 5], ['BPharma-2B', 'BPharma', 6, 4],
//   ['BCOM-1A', 'BCOM', 7, 7], ['BTech-3A', 'BTech', 8, 2], ['BHMC-1A', 'BHMC', 9, 6],
//   ['BTTM-2A', 'BTTM', 10, 5], ['BPharma-1A', 'BPharma', 11, 4], ['BCOM-2A', 'BCOM', 12, 3],
//   ['BHMC-2A', 'BHMC', 13, 7], ['BTTM-1A', 'BTTM', 14, 8], ['BTech-3B', 'BTech', 15, 9],
//   ['BPharma-3A', 'BPharma', 16, 6], ['BCOM-3A', 'BCOM', 17, 8], ['BHMC-3A', 'BHMC', 18, 9],
// ]

// const teams: Team[] = teamSpecs.map(([name, department, captain, tournamentIndex], i) => {
//   const played = i < 4 ? 4 : (i % 4) + 1
//   const wins = i < 4 ? [4, 3, 2, 1][i] : Math.min(played, (i * 3) % (played + 1))
//   return {
//     id: `team-${String(i + 1).padStart(2, '0')}`,
//     name,
//     tournamentId: tournaments[tournamentIndex].id,
//     department,
//     captainId: students[captain].id,
//     playerIds: Array.from({ length: tournaments[tournamentIndex].playersPerTeam }, (_, n) => students[(captain + n) % students.length].id),
//     played,
//     wins,
//     losses: played - wins,
//     points: wins * 3,
//     initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
//     color: colors[i % colors.length],
//   }
// })

// const fixtureDates = [
//   ['2026-11-02', '2026-11-12', '2026-11-13'],
//   ['2026-11-03', '2026-11-12', '2026-11-21'],
//   ['2026-11-22', '2026-11-27', '2026-12-02'],
//   ['2026-11-29', '2026-11-30', '2026-12-01'],
//   ['2026-12-02', '2026-12-03', '2026-12-04'],
//   ['2026-11-13', '2026-11-20', '2026-11-25'],
//   ['2026-11-18', '2026-11-19', '2026-11-20'],
//   ['2026-11-11', '2026-11-11', '2026-11-12'],
//   ['2026-11-25', '2026-11-26', '2026-11-27'],
//   ['2026-11-06', '2026-11-08', '2026-11-10'],
// ]
// const matchStatusByTournament: Record<number, Match['status'][]> = {
//   0: ['completed', 'completed', 'live'],
//   1: ['completed', 'completed', 'upcoming'],
//   2: ['upcoming', 'upcoming', 'upcoming'],
//   3: ['upcoming', 'upcoming', 'upcoming'],
//   4: ['upcoming', 'upcoming', 'upcoming'],
//   5: ['live', 'upcoming', 'upcoming'],
//   6: ['upcoming', 'upcoming', 'upcoming'],
//   7: ['completed', 'completed', 'completed'],
//   8: ['upcoming', 'upcoming', 'upcoming'],
//   9: ['completed', 'completed', 'completed'],
// }

// const matches: Match[] = Array.from({ length: 30 }, (_, i) => {
//   const tournamentIndex = i % tournaments.length
//   const fixtureIndex = Math.floor(i / tournaments.length)
//   const tournament = tournaments[tournamentIndex]
//   const eventTeams = teams.filter((team) => team.tournamentId === tournament.id)
//   const teamA = eventTeams[fixtureIndex % eventTeams.length]
//   const teamB = eventTeams[(fixtureIndex + 1) % eventTeams.length]
//   const status = matchStatusByTournament[tournamentIndex][fixtureIndex]
//   const scoreA = status === 'completed' ? `${62 + (i * 7) % 47}` : status === 'live' && tournament.sport === 'Cricket' ? '78/5' : status === 'live' ? '21' : undefined
//   const scoreB = status === 'completed' ? `${58 + (i * 5) % 39}` : status === 'live' && tournament.sport === 'Cricket' ? '72/8' : status === 'live' ? '18' : undefined
//   const winnerId = status === 'completed' ? (Number(scoreA) >= Number(scoreB) ? teamA.id : teamB.id) : undefined
//   return {
//     id: `match-${String(i + 1).padStart(2, '0')}`,
//     tournamentId: tournament.id,
//     round: fixtureIndex === 0 ? 'Quarter Final' : fixtureIndex === 1 ? (tournamentIndex === 0 ? 'Semi Final' : 'Group Stage') : 'Final',
//     teamAId: teamA.id,
//     teamBId: teamB.id,
//     date: fixtureDates[tournamentIndex][fixtureIndex],
//     time: fixtureIndex === 0 ? '2:00 PM' : fixtureIndex === 1 ? '4:30 PM' : '10:30 AM',
//     venue: tournamentIndex === 5 ? ['ET-607', 'ET-507', 'ET-604'][fixtureIndex] : tournamentIndex === 6 ? ['MT-304', 'MT-105', 'MT-204'][fixtureIndex] : tournament.venue,
//     status,
//     scoreA,
//     scoreB,
//     winnerId,
//     overs: status === 'live' && tournament.sport === 'Cricket' ? '8.2 overs' : undefined,
//     notice: status === 'live' ? 'Live score updated on CampusPlay' : undefined,
//   }
// })

// // Keep the highlighted personal fixture specific and easy to find in the student demo.
// matches[15] = { ...matches[15], tournamentId: 'tournament-02', teamAId: 'team-04', teamBId: 'team-05', date: '2026-11-14', time: '10:30 AM', venue: 'Badminton Court', round: 'Round of 16', status: 'upcoming', scoreA: undefined, scoreB: undefined, winnerId: undefined }
// // Keep the live cricket final aligned with the public landing scorecard.
// matches[20] = { ...matches[20], tournamentId: 'tournament-01', teamAId: 'team-01', teamBId: 'team-02' }
// // Preserve a three-court demo draw for Table Tennis after the featured badminton fixture override.
// matches.push({ id: 'match-31', tournamentId: 'tournament-06', round: 'Group Stage', teamAId: 'team-07', teamBId: 'team-12', date: '2026-11-20', time: '4:30 PM', venue: 'ET-507', status: 'upcoming' })

// for (const team of teams) {
//   const results = matches.filter((match) => match.status === 'completed' && (match.teamAId === team.id || match.teamBId === team.id))
//   team.played = results.length
//   team.wins = results.filter((match) => match.winnerId === team.id).length
//   team.losses = results.length - team.wins
//   team.points = team.wins * 3
// }

// function seedTeamAudience(teamIds: string[]): string[] {
//   return Array.from(new Set(teamIds.flatMap((id) => {
//     const team = teams.find((item) => item.id === id)
//     return team ? [team.captainId, ...team.playerIds] : []
//   })))
// }

// export function createSeedData(): AppData {
//   return {
//     version: 1,
//     seedRevision: 3,
//     users: [...students, organizer],
//     tournaments,
//     teams,
//     matches,
//     registrations: [
//       { id: 'reg-01', tournamentId: 'tournament-01', teamId: 'team-01', studentId: 'student-01', type: 'team', status: 'pending', createdAt: '2026-11-11', playerNames: ['Jasnoor Kaur', 'Aarav Patel', 'Isha Sharma', 'Rahul Mehta', 'Aman Verma', 'Diya Nair', 'Kabir Rao', 'Sana Khan', 'Arjun Reddy', 'Mira Joshi', 'Vivaan Gupta'] },
//       { id: 'reg-02', tournamentId: 'tournament-01', teamId: 'team-02', studentId: 'student-04', type: 'team', status: 'approved', createdAt: '2026-11-10', playerNames: ['Rahul Mehta', 'Aman Verma', 'Diya Nair', 'Kabir Rao', 'Sana Khan', 'Arjun Reddy', 'Mira Joshi', 'Vivaan Gupta', 'Anaya Iyer', 'Aditya Shah', 'Zoya Ali'] },
//       { id: 'reg-03', tournamentId: 'tournament-02', teamId: 'team-04', studentId: 'student-01', type: 'team', status: 'confirmed', createdAt: '2026-11-08', playerNames: ['Jasnoor Kaur', 'Aarav Patel'] },
//       { id: 'reg-04', tournamentId: 'tournament-03', teamId: 'team-10', studentId: 'student-09', type: 'team', status: 'pending', createdAt: '2026-11-12', playerNames: ['Arjun Reddy', 'Mira Joshi', 'Vivaan Gupta', 'Anaya Iyer', 'Aditya Shah', 'Zoya Ali', 'Rohan Das', 'Kiara Bose', 'Dev Malhotra', 'Tara Menon', 'Neil Thomas'] },
//       { id: 'reg-05', tournamentId: 'tournament-04', teamId: 'team-14', studentId: 'student-13', type: 'team', status: 'approved', createdAt: '2026-11-07', playerNames: ['Aditya Shah', 'Zoya Ali', 'Rohan Das', 'Kiara Bose', 'Dev Malhotra'] },
//       { id: 'reg-06', tournamentId: 'tournament-06', teamId: 'team-07', studentId: 'student-06', type: 'team', status: 'confirmed', createdAt: '2026-11-06', playerNames: ['Diya Nair', 'Kabir Rao'] },
//       { id: 'reg-07', tournamentId: 'tournament-09', studentId: 'student-01', type: 'individual', status: 'confirmed', createdAt: '2026-11-09', playerNames: ['Jasnoor Kaur'] },
//       { id: 'reg-08', tournamentId: 'tournament-09', studentId: 'student-19', type: 'individual', status: 'confirmed', createdAt: '2026-11-12', playerNames: ['Neil Thomas'] },
//     ],
//     notifications: [
//       { id: 'notice-01', title: 'Your badminton match is tomorrow', body: '10:30 AM · Badminton Court', kind: 'match', time: '12 min ago', readByUserIds: [], targetUserIds: seedTeamAudience(['team-04', 'team-05']) },
//       { id: 'notice-02', title: 'Your team was approved!', body: 'BCA-1A · Badminton Open 2026 · approved', kind: 'registration', time: '1 hour ago', readByUserIds: [], targetUserIds: seedTeamAudience(['team-04']) },
//       { id: 'notice-03', title: 'Registration needs a quick look', body: 'BTech-2A · Inter-Class Cricket', kind: 'registration', time: '1 hour ago', readByUserIds: [], targetUserIds: ['organizer-demo'] },
//       { id: 'notice-04', title: 'Football venue updated', body: 'Now playing at Soccer Ground · 2:00 PM', kind: 'venue', time: 'Nov 12', readByUserIds: [], targetUserIds: seedTeamAudience(['team-06', 'team-10']) },
//       { id: 'notice-05', title: 'Cricket semifinal reminder', body: 'BTech-2A vs BTech-2B · Koshish Ground', kind: 'reminder', time: 'Nov 11', readByUserIds: [], targetUserIds: seedTeamAudience(['team-01', 'team-02']) },
//     ],
//     session: null,
//     theme: 'light',
//   }
// }
