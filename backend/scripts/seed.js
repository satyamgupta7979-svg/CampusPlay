import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import Registration from '../models/Registration.js';
import Match from '../models/Match.js';
import Notification from '../models/Notification.js';

dotenv.config();

const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Business'];
const colors = ['#d5f28d', '#b8dfe0', '#f6d39b', '#d8c6ef', '#f0b8a7', '#b8caed'];

const tournamentSpecs = [
  ['Inter-Class Cricket Championship', 'Cricket', '2026-11-02', '2026-12-05', 'Koshish Ground', 'live', 16, 11],
  ['Badminton Open 2026', 'Badminton', '2026-11-03', '2026-11-28', 'Badminton Court', 'live', 24, 2],
  ['Campus Football League', 'Football', '2026-11-22', '2026-12-12', 'Soccer Ground', 'registration_open', 12, 11],
  ['Hoops on Campus', 'Basketball', '2026-11-29', '2026-12-04', 'Basketball Court', 'upcoming', 8, 5],
  ['Block Volleyball Cup', 'Volleyball', '2026-12-02', '2026-12-08', 'Volleyball Court', 'upcoming', 10, 6],
  ['Table Tennis Rally', 'Table Tennis', '2026-11-13', '2026-11-30', 'ET-607', 'live', 16, 2],
  ['Checkmate Challenge', 'Chess', '2026-11-18', '2026-11-21', 'MT-304', 'upcoming', 32, 1],
  ['Carrom Doubles Night', 'Carrom', '2026-11-11', '2026-11-12', 'Carrom Hall', 'completed', 16, 2],
  ['Campus Athletics Meet', 'Athletics', '2026-11-25', '2026-11-28', 'Track & Field', 'registration_open', 80, 1],
  ['Freshers Futsal Series', 'Football', '2026-11-06', '2026-11-10', 'Soccer Ground', 'completed', 8, 5],
];

const names = [
  'Jasnoor Kaur', 'Aarav Patel', 'Isha Sharma', 'Rahul Mehta', 'Aman Verma', 'Diya Nair', 'Kabir Rao', 'Sana Khan', 'Arjun Reddy', 'Mira Joshi',
  'Vivaan Gupta', 'Anaya Iyer', 'Aditya Shah', 'Zoya Ali', 'Rohan Das', 'Kiara Bose', 'Dev Malhotra', 'Tara Menon', 'Neil Thomas', 'Pia Kapoor',
  'Ishaan Roy', 'Aditi Kulkarni', 'Reyansh Jain', 'Myra Sethi', 'Kunal Bhat', 'Sia Chawla', 'Yash Pandey', 'Nisha Rao', 'Samar Gill', 'Riya Sen',
  'Omkar Pawar', 'Aanya Desai', 'Veer Sood', 'Navya Krishnan', 'Dhruv Saxena', 'Meera Pillai', 'Atharv Joshi', 'Pari Shah', 'Ayaan Sheikh', 'Saanvi Rao',
  'Karan Gill', 'Anvi Kapoor', 'Siddharth Bose', 'Ira Menon', 'Ritvik Nair', 'Avni Mehta', 'Pranav Shah', 'Tia Banerjee', 'Lakshya Jain', 'Suhana Das',
];

const teamSpecs = [
  ['BTech-2A', 'BTech', 0, 0], ['BTech-2B', 'BTech', 3, 0],
  ['BCA-1A', 'BCA', 4, 3], ['BCA-1B', 'BCA', 0, 1], ['BCA-2A', 'BCA', 1, 1],
  ['BTech-1A', 'BTech', 2, 2], ['BPharma-2A', 'BPharma', 5, 5], ['BPharma-2B', 'BPharma', 6, 4],
  ['BCOM-1A', 'BCOM', 7, 7], ['BTech-3A', 'BTech', 8, 2], ['BHMC-1A', 'BHMC', 9, 6],
  ['BTTM-2A', 'BTTM', 10, 5], ['BPharma-1A', 'BPharma', 11, 4], ['BCOM-2A', 'BCOM', 12, 3],
  ['BHMC-2A', 'BHMC', 13, 7], ['BTTM-1A', 'BTTM', 14, 8], ['BTech-3B', 'BTech', 15, 9],
  ['BPharma-3A', 'BPharma', 16, 6], ['BCOM-3A', 'BCOM', 17, 8], ['BHMC-3A', 'BHMC', 18, 9],
];

const fixtureDates = [
  ['2026-11-02', '2026-11-12', '2026-11-13'],
  ['2026-11-03', '2026-11-12', '2026-11-21'],
  ['2026-11-22', '2026-11-27', '2026-12-02'],
  ['2026-11-29', '2026-11-30', '2026-12-01'],
  ['2026-12-02', '2026-12-03', '2026-12-04'],
  ['2026-11-13', '2026-11-20', '2026-11-25'],
  ['2026-11-18', '2026-11-19', '2026-11-20'],
  ['2026-11-11', '2026-11-11', '2026-11-12'],
  ['2026-11-25', '2026-11-26', '2026-11-27'],
  ['2026-11-06', '2026-11-08', '2026-11-10'],
];

const matchStatusByTournament = {
  0: ['completed', 'completed', 'live'],
  1: ['completed', 'completed', 'upcoming'],
  2: ['upcoming', 'upcoming', 'upcoming'],
  3: ['upcoming', 'upcoming', 'upcoming'],
  4: ['upcoming', 'upcoming', 'upcoming'],
  5: ['live', 'upcoming', 'upcoming'],
  6: ['upcoming', 'upcoming', 'upcoming'],
  7: ['completed', 'completed', 'completed'],
  8: ['upcoming', 'upcoming', 'upcoming'],
  9: ['completed', 'completed', 'completed'],
};

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusplay';
    console.log(`[Seed Script]: Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed Script]: Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Tournament.deleteMany({}),
      Team.deleteMany({}),
      Registration.deleteMany({}),
      Match.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed Script]: Creating users...');
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 1. Organizer
    const organizer = await User.create({
      name: 'Rhea Kapoor',
      email: 'sports@campus.edu',
      password: defaultPassword,
      collegeId: 'CP-SPORTS',
      department: 'Sports Committee',
      year: 'Coordinator',
      section: '—',
      role: 'organizer',
      avatarColor: '#d5f28d',
    });

    // 2. Students
    const studentDocs = [];
    for (let i = 0; i < names.length; i++) {
      studentDocs.push({
        name: names[i],
        email: `${names[i].toLowerCase().replace(/ /g, '.')}@campus.edu`,
        password: hashedPassword,
        collegeId: `CP${String(240100 + i).slice(2)}`,
        department: departments[i % departments.length],
        year: `${(i % 4) + 1}${['st', 'nd', 'rd', 'th'][i % 4]} Year`,
        section: ['A', 'B', 'C'][i % 3],
        role: 'student',
        avatarColor: colors[i % colors.length],
      });
    }
    const createdStudents = await User.insertMany(studentDocs);
    console.log(`[Seed Script]: Created 1 organizer and ${createdStudents.length} students`);

    // 3. Tournaments
    console.log('[Seed Script]: Creating tournaments...');
    const tournamentDocs = tournamentSpecs.map(([name, sport, startDate, endDate, venue, status, maxTeams, playersPerTeam], i) => ({
      name,
      sport,
      description: `${sport} brings the campus together. Register your class or block, bring your best game, and make this season one to remember.`,
      status,
      startDate,
      endDate,
      registrationDeadline: i === 0 ? '2026-11-18' : '2026-11-20',
      venue,
      organizer: i % 2 ? 'Campus Sports Committee' : 'Student Athletics Council',
      organizerId: organizer._id,
      format: i % 3 === 0 ? 'Knockout' : i % 3 === 1 ? 'Round Robin' : 'League',
      maxTeams,
      playersPerTeam,
      registrationType: i === 8 ? 'Individual' : 'Team',
      rules: sport === 'Cricket'
        ? ['11 players per team', '10 overs per innings', 'Knockout format', 'College ID required']
        : ['Represent your class, department or block', 'Arrive 15 minutes before your fixture', 'College ID required', 'Respect the referee’s decision'],
      imageTone: ['tone-lime', 'tone-blue', 'tone-orange', 'tone-purple', 'tone-teal'][i % 5],
    }));
    const createdTournaments = await Tournament.insertMany(tournamentDocs);
    console.log(`[Seed Script]: Created ${createdTournaments.length} tournaments`);

    // 4. Teams
    console.log('[Seed Script]: Creating teams...');
    const teamDocs = teamSpecs.map(([name, department, captainIdx, tournamentIdx], i) => {
      const targetTournament = createdTournaments[tournamentIdx];
      const captain = createdStudents[captainIdx];
      const playerIds = Array.from(
        { length: targetTournament.playersPerTeam },
        (_, n) => createdStudents[(captainIdx + n) % createdStudents.length]._id
      );

      return {
        name,
        tournamentId: targetTournament._id,
        department,
        captainId: captain._id,
        playerIds,
        played: 0,
        wins: 0,
        losses: 0,
        points: 0,
        initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        color: colors[i % colors.length],
      };
    });
    const createdTeams = await Team.insertMany(teamDocs);
    console.log(`[Seed Script]: Created ${createdTeams.length} teams`);

    // 5. Matches / Fixtures
    console.log('[Seed Script]: Creating matches and fixtures...');
    const matchDocs = [];
    for (let i = 0; i < 30; i++) {
      const tournamentIdx = i % createdTournaments.length;
      const fixtureIdx = Math.floor(i / createdTournaments.length);
      const tournament = createdTournaments[tournamentIdx];
      const eventTeams = createdTeams.filter((t) => t.tournamentId.toString() === tournament._id.toString());
      if (eventTeams.length < 2) continue;

      const teamA = eventTeams[fixtureIdx % eventTeams.length];
      const teamB = eventTeams[(fixtureIdx + 1) % eventTeams.length];
      const status = matchStatusByTournament[tournamentIdx][fixtureIdx];

      const scoreA = status === 'completed'
        ? `${62 + (i * 7) % 47}`
        : status === 'live' && tournament.sport === 'Cricket'
          ? '78/5'
          : status === 'live'
            ? '21'
            : '';
      const scoreB = status === 'completed'
        ? `${58 + (i * 5) % 39}`
        : status === 'live' && tournament.sport === 'Cricket'
          ? '72/8'
          : status === 'live'
            ? '18'
            : '';
      const winnerId = status === 'completed'
        ? (Number(scoreA) >= Number(scoreB) ? teamA._id : teamB._id)
        : undefined;

      matchDocs.push({
        tournamentId: tournament._id,
        round: fixtureIdx === 0 ? 'Quarter Final' : fixtureIdx === 1 ? (tournamentIdx === 0 ? 'Semi Final' : 'Group Stage') : 'Final',
        teamAId: teamA._id,
        teamBId: teamB._id,
        date: fixtureDates[tournamentIdx][fixtureIdx],
        time: fixtureIdx === 0 ? '2:00 PM' : fixtureIdx === 1 ? '4:30 PM' : '10:30 AM',
        venue: tournamentIdx === 5 ? ['ET-607', 'ET-507', 'ET-604'][fixtureIdx] : tournamentIdx === 6 ? ['MT-304', 'MT-105', 'MT-204'][fixtureIdx] : tournament.venue,
        status,
        scoreA,
        scoreB,
        winnerId,
        overs: status === 'live' && tournament.sport === 'Cricket' ? '8.2 overs' : '',
        notice: status === 'live' ? 'Live score updated on CampusPlay' : '',
      });
    }

    // Align specific key demo fixtures
    if (matchDocs[15] && createdTeams[3] && createdTeams[4]) {
      matchDocs[15] = {
        ...matchDocs[15],
        tournamentId: createdTournaments[1]._id,
        teamAId: createdTeams[3]._id,
        teamBId: createdTeams[4]._id,
        date: '2026-11-14',
        time: '10:30 AM',
        venue: 'Badminton Court',
        round: 'Round of 16',
        status: 'upcoming',
        scoreA: '',
        scoreB: '',
        winnerId: undefined,
      };
    }
    if (matchDocs[20] && createdTeams[0] && createdTeams[1]) {
      matchDocs[20] = {
        ...matchDocs[20],
        tournamentId: createdTournaments[0]._id,
        teamAId: createdTeams[0]._id,
        teamBId: createdTeams[1]._id,
      };
    }

    // Extra Table Tennis demo fixture
    if (createdTournaments[5] && createdTeams[6] && createdTeams[11]) {
      matchDocs.push({
        tournamentId: createdTournaments[5]._id,
        round: 'Group Stage',
        teamAId: createdTeams[6]._id,
        teamBId: createdTeams[11]._id,
        date: '2026-11-20',
        time: '4:30 PM',
        venue: 'ET-507',
        status: 'upcoming',
        scoreA: '',
        scoreB: '',
      });
    }

    const createdMatches = await Match.insertMany(matchDocs);
    console.log(`[Seed Script]: Created ${createdMatches.length} matches`);

    // Calculate team records based on completed matches
    for (const team of createdTeams) {
      const results = createdMatches.filter(
        (m) => m.status === 'completed' && (m.teamAId.toString() === team._id.toString() || m.teamBId.toString() === team._id.toString())
      );
      team.played = results.length;
      team.wins = results.filter((m) => m.winnerId?.toString() === team._id.toString()).length;
      team.losses = team.played - team.wins;
      team.points = team.wins * 3;
      await team.save();
    }
    console.log('[Seed Script]: Recalculated team records and standings');

    // 6. Registrations
    console.log('[Seed Script]: Creating sample registrations...');
    const registrationDocs = [
      {
        tournamentId: createdTournaments[0]._id,
        teamId: createdTeams[0]._id,
        studentId: createdStudents[0]._id,
        type: 'team',
        status: 'pending',
        createdAt: '2026-11-11',
        playerNames: names.slice(0, 11),
      },
      {
        tournamentId: createdTournaments[0]._id,
        teamId: createdTeams[1]._id,
        studentId: createdStudents[3]._id,
        type: 'team',
        status: 'approved',
        createdAt: '2026-11-10',
        playerNames: names.slice(3, 14),
      },
      {
        tournamentId: createdTournaments[1]._id,
        teamId: createdTeams[3]._id,
        studentId: createdStudents[0]._id,
        type: 'team',
        status: 'confirmed',
        createdAt: '2026-11-08',
        playerNames: [names[0], names[1]],
      },
      {
        tournamentId: createdTournaments[2]._id,
        teamId: createdTeams[9]._id,
        studentId: createdStudents[8]._id,
        type: 'team',
        status: 'pending',
        createdAt: '2026-11-12',
        playerNames: names.slice(8, 19),
      },
      {
        tournamentId: createdTournaments[3]._id,
        teamId: createdTeams[13]._id,
        studentId: createdStudents[12]._id,
        type: 'team',
        status: 'approved',
        createdAt: '2026-11-07',
        playerNames: names.slice(12, 17),
      },
      {
        tournamentId: createdTournaments[5]._id,
        teamId: createdTeams[6]._id,
        studentId: createdStudents[5]._id,
        type: 'team',
        status: 'confirmed',
        createdAt: '2026-11-06',
        playerNames: [names[5], names[6]],
      },
      {
        tournamentId: createdTournaments[8]._id,
        studentId: createdStudents[0]._id,
        type: 'individual',
        status: 'confirmed',
        createdAt: '2026-11-09',
        playerNames: [names[0]],
      },
      {
        tournamentId: createdTournaments[8]._id,
        studentId: createdStudents[18]._id,
        type: 'individual',
        status: 'confirmed',
        createdAt: '2026-11-12',
        playerNames: [names[18]],
      },
    ];
    const createdRegistrations = await Registration.insertMany(registrationDocs);
    console.log(`[Seed Script]: Created ${createdRegistrations.length} registrations`);

    // 7. Notifications
    console.log('[Seed Script]: Creating notifications...');
    const notificationDocs = [
      {
        title: 'Your badminton match is tomorrow',
        body: '10:30 AM · Badminton Court',
        kind: 'match',
        time: '12 min ago',
        readByUserIds: [],
        targetUserIds: [createdStudents[0]._id, createdStudents[1]._id],
      },
      {
        title: 'Your team was approved!',
        body: 'BCA-1A · Badminton Open 2026 · approved',
        kind: 'registration',
        time: '1 hour ago',
        readByUserIds: [],
        targetUserIds: [createdStudents[0]._id, createdStudents[1]._id],
      },
      {
        title: 'Registration needs a quick look',
        body: 'BTech-2A · Inter-Class Cricket',
        kind: 'registration',
        time: '1 hour ago',
        readByUserIds: [],
        targetUserIds: [organizer._id],
      },
      {
        title: 'Football venue updated',
        body: 'Now playing at Soccer Ground · 2:00 PM',
        kind: 'venue',
        time: 'Nov 12',
        readByUserIds: [],
        targetUserIds: [createdStudents[5]._id, createdStudents[8]._id],
      },
      {
        title: 'Cricket semifinal reminder',
        body: 'BTech-2A vs BTech-2B · Koshish Ground',
        kind: 'reminder',
        time: 'Nov 11',
        readByUserIds: [],
        targetUserIds: [createdStudents[0]._id, createdStudents[3]._id],
      },
    ];
    await Notification.insertMany(notificationDocs);
    console.log(`[Seed Script]: Created ${notificationDocs.length} notifications`);

    console.log('\n=============================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('DEMO ACCOUNTS:');
    console.log('1. Student Account:');
    console.log('   Email:    jasnoor.kaur@campus.edu');
    console.log('   Password: password123');
    console.log('   Role:     student');
    console.log('\n2. Organizer Account:');
    console.log('   Email:    sports@campus.edu');
    console.log('   Password: password123');
    console.log('   Role:     organizer');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Script Error]: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seed();
