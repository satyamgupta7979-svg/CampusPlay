# CampusPlay — Complete Full-Stack Sports & Tournament Platform

**CampusPlay** is a comprehensive, production-ready college sports and tournament management platform designed for universities, colleges, and athletic associations. It empowers students to form teams, sign up for inter-class tournaments, track real-time match fixtures, view live scores, and follow season leaderboards, while giving sports organizers an all-in-one administrative suite to manage tournaments, approve team rosters, schedule conflict-free fixtures, publish scores, and inspect analytics.

---

## 🏆 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Folder Structure](#architecture--folder-structure)
4. [Key Features](#key-features)
   - [Student Experience](#student-experience)
   - [Organizer Experience](#organizer-experience)
   - [Security & Validation](#security--validation)
5. [Prerequisites & MongoDB Setup](#prerequisites--mongodb-setup)
6. [Environment Variables](#environment-variables)
7. [Installation & Setup](#installation--setup)
8. [Database Seeding](#database-seeding)
9. [Running the Application](#running-the-application)
10. [REST API Documentation](#rest-api-documentation)
11. [Postman / Hoppscotch Collection](#postman--hoppscotch-collection)
12. [Demo Credentials](#demo-credentials)
13. [Production Deployment](#production-deployment)

---

## 1. Project Overview

CampusPlay bridges campus athletic departments and students. Built with an Express.js + MongoDB backend and a React 18 + TypeScript frontend, it eliminates fragmented spreadsheets, chat notices, and manual paper rosters.

- **Base Backend API URL**: `http://localhost:5000/api`
- **Frontend URL**: `http://localhost:5173/`

---

## 2. Technology Stack

### Backend Stack
- **Runtime**: Node.js (v18+) with modern ES Modules (`"type": "module"`)
- **Web Framework**: Express.js (v4.21+)
- **Database**: MongoDB with Mongoose ODM (v8+)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs for salted password hashing
- **Security**: Helmet HTTP headers, CORS origin whitelist, Express Rate Limiting
- **Logging**: Morgan HTTP logger
- **Validation**: Express-Validator with centralized schema validation

### Frontend Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Data Visualization**: Recharts
- **Icons**: Lucide React

---

## 3. Architecture & Folder Structure

```
CAMPUPLAY/
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── analyticsController.js       # Real MongoDB aggregation metrics
│   │   ├── authController.js            # Register, login, me, reset password
│   │   ├── matchController.js           # Fixture scheduling, live scores
│   │   ├── notificationController.js    # Notification read/unread tracking
│   │   ├── registrationController.js    # Team & individual registrations
│   │   ├── resultController.js          # Match result submission & standings
│   │   ├── teamController.js            # Teams & roster management
│   │   ├── tournamentController.js      # Tournament CRUD & filtering
│   │   └── userController.js            # User profiles & passwords
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT bearer token verification
│   │   ├── errorMiddleware.js           # Centralized API error handler
│   │   ├── roleMiddleware.js            # Role-based access control (RBAC)
│   │   └── validateMiddleware.js        # Express-validator error checker
│   ├── models/
│   │   ├── Match.js                     # Match fixtures & live scores
│   │   ├── Notification.js              # Campus sports announcements
│   │   ├── Registration.js              # Tournament entry requests
│   │   ├── Team.js                      # Teams, captains & player rosters
│   │   ├── Tournament.js                # Tournament events & rules
│   │   └── User.js                      # Student & organizer accounts
│   ├── routes/
│   │   ├── analyticsRoutes.js           # /api/analytics
│   │   ├── authRoutes.js                # /api/auth
│   │   ├── matchRoutes.js               # /api/matches
│   │   ├── notificationRoutes.js        # /api/notifications
│   │   ├── registrationRoutes.js        # /api/registrations
│   │   ├── resultRoutes.js              # /api/results
│   │   ├── teamRoutes.js                # /api/teams
│   │   ├── tournamentRoutes.js          # /api/tournaments
│   │   └── userRoutes.js                # /api/users
│   ├── scripts/
│   │   └── seed.js                      # Realistic database seeder
│   ├── utils/
│   │   ├── ApiError.js                  # Standardized error class
│   │   ├── asyncHandler.js              # Promise rejection catcher
│   │   └── generateToken.js             # JWT signer
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── registrationValidator.js
│   │   └── tournamentValidator.js
│   ├── .env                             # Backend configuration
│   ├── .env.example
│   ├── .gitignore
│   ├── CampusPlay.postman_collection.json
│   ├── package.json
│   └── server.js                        # Express server entry point
│
├── src/
│   ├── app/
│   │   ├── App.tsx                      # App root with role-guarded routes
│   │   └── AppContext.tsx               # Context with real API data sync
│   ├── components/
│   │   ├── FixtureRow.tsx
│   │   ├── Shell.tsx                    # Header, Navigation, Topbar
│   │   └── UI.tsx                       # Buttons, Cards, Modals, Pills
│   ├── pages/
│   │   ├── Auth.tsx                     # Login & Registration pages
│   │   ├── Landing.tsx                  # Public home page & live cards
│   │   ├── MatchDetails.tsx             # Scorecard and venue match details
│   │   ├── Organizer.tsx                # Organizer suite (7 admin panels)
│   │   └── Student.tsx                  # Student dashboard (8 player panels)
│   ├── services/
│   │   ├── analyticsService.ts          # Organizer statistics client
│   │   ├── api.ts                       # Central fetch client with JWT token
│   │   ├── authService.ts               # Auth & profile API client
│   │   ├── matchService.ts              # Fixtures & results API client
│   │   ├── notificationService.ts       # Notifications API client
│   │   ├── registrationService.ts       # Registrations API client
│   │   ├── teamService.ts               # Teams API client
│   │   └── tournamentService.ts         # Tournaments API client
│   └── types/
│       └── index.ts                     # TypeScript data interfaces
│
├── CampusPlay.postman_collection.json   # Ready-to-import Postman collection
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 4. Key Features

### Student Experience
- **Interactive Sports Catalog**: Browse upcoming and active tournaments across Cricket, Football, Basketball, Volleyball, Badminton, Table Tennis, Chess, Carrom, and Athletics.
- **Roster Building & Team Registration**: Register individual entries or form teams with exact required team size, assign captains, and list teammates.
- **Live Match Tracking**: View live scores, overs, status tags (`live`, `upcoming`, `completed`, `postponed`), and match venue details.
- **My Matches & Registrations**: Dedicated dashboards tracking personal fixtures, approval status (`pending`, `approved`, `confirmed`, `rejected`), and team opponents.
- **Season Leaderboards & Results**: Filter tournament points tables sorted by wins, points, and losses.
- **Notification Inbox**: Instant notifications for fixture scheduling, venue changes, roster approvals, and match outcomes.

### Organizer Experience
- **Tournament Control Center**: Create and edit tournaments, configure formats (Knockout, League, Round Robin), set player limits, venues, deadlines, and rules.
- **Roster & Registration Approval**: Review submitted team rosters, inspect player counts, verify eligibility, and approve or reject submissions with automatic student notifications.
- **Intelligent Fixture Scheduler**: Automated fixture generation with built-in conflict prevention preventing double-booking of venues within 90 minutes.
- **Match Management & Live Scoring**: Update scores, overs, postponement notices, and live match announcements.
- **Official Result Submission**: Enter final scores and declare winners; the system automatically updates team standings, win counts, losses, and tournament points ($3\text{ points per win}$).
- **Real-Time MongoDB Analytics**: Dynamically aggregated dashboards showing sport-wise participation, department standings, match completion ratios, and top-performing teams.

### Security & Validation
- **Secure Authentication**: Passwords hashed with bcrypt (10 rounds).
- **JWT Authorization**: Bearer token authentication verified on every protected request.
- **Role-Based Access Control (RBAC)**: Organizer routes are strictly forbidden (HTTP 403) to student tokens.
- **Server-Side Conflict Checks**: Overlapping match bookings at the same venue within 90 minutes are blocked.
- **Input Sanitization**: Express-validator schemas normalize emails, validate MongoIDs, and enforce required fields.
- **Rate Limiting**: Protects against brute-force login attacks.

---

## 5. Prerequisites & MongoDB Setup

1. **Node.js**: v18.0.0 or higher (`node -v`)
2. **npm**: v9.0.0 or higher (`npm -v`)
3. **MongoDB**:
   - Local MongoDB Server (Community Edition v6, v7, or v9) running on `mongodb://127.0.0.1:27017`
   - Alternatively, a cloud MongoDB Atlas URI (`mongodb+srv://...`)

To start MongoDB locally (Windows):
```powershell
net start MongoDB
```

---

## 6. Environment Variables

### Backend Configuration (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campusplay
JWT_SECRET=campusplay_secret_key_jwt_super_secure_2026
JWT_EXPIRES_IN=30d
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend Configuration (`.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 7. Installation & Setup

### 1. Install Frontend Dependencies
From the repository root:
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

---

## 8. Database Seeding

The backend includes a comprehensive database seed script that populates realistic data matching all campus tournaments, teams, fixtures, and student accounts:

```bash
cd backend
npm run seed
```

This populates:
- 1 Organizer account (`sports@campus.edu`)
- 50 Student accounts across Computer Science, Mechanical, Electrical, Civil, and Business
- 10 Tournaments across 9 sports
- 20 Teams with full player rosters
- 31 Match fixtures (live, upcoming, and completed)
- 8 Tournament registrations
- Campus sports notifications

---

## 9. Running the Application

### Option A: Run Backend and Frontend in Separate Terminals

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# Application opens at http://localhost:5173
```

### Option B: Production Build
```bash
npm run build
npm run preview
```

---

## 10. REST API Documentation

### Base URL: `http://localhost:5000/api`

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new student or organizer |
| `POST` | `/auth/login` | Public | Authenticate user & get JWT token |
| `POST` | `/auth/logout` | Private | Invalidate session |
| `GET` | `/auth/me` | Private | Get currently authenticated user |
| `POST` | `/auth/forgot-password` | Public | Generate password reset token |
| `POST` | `/auth/reset-password` | Public | Reset password with token |

### 👤 Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users/profile` | Private | Get user profile |
| `PUT` | `/users/profile` | Private | Update name, department, year, section |
| `PUT` | `/users/change-password` | Private | Change password (requires current password) |
| `GET` | `/users` | Private | List students & organizers |

### 🏆 Tournaments (`/api/tournaments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/tournaments` | Public | Get all tournaments (filters: `sport`, `status`, `search`) |
| `GET` | `/tournaments/:id` | Public | Get single tournament details |
| `POST` | `/tournaments` | Organizer | Create a new tournament |
| `PUT` | `/tournaments/:id` | Organizer | Update tournament details |
| `DELETE` | `/tournaments/:id` | Organizer | Delete tournament & related records |
| `GET` | `/tournaments/:id/teams` | Public | Get all teams in tournament |
| `GET` | `/tournaments/:id/fixtures` | Public | Get tournament fixtures |
| `GET` | `/tournaments/:id/participants` | Public | Get unique participants count & list |

### 👥 Teams (`/api/teams`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/teams` | Public | List teams (filter: `tournamentId`, `department`) |
| `GET` | `/teams/:id` | Public | Get team details |
| `POST` | `/teams` | Private | Create team |
| `PUT` | `/teams/:id` | Captain/Org | Update team information |
| `DELETE` | `/teams/:id` | Captain/Org | Delete team |
| `POST` | `/teams/:id/players` | Captain/Org | Add player to team roster |
| `DELETE` | `/teams/:id/players/:playerId` | Captain/Org | Remove player from team |
| `PATCH` | `/teams/:id/captain` | Captain/Org | Reassign captain |

### 📝 Registrations (`/api/registrations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/registrations` | Student | Register team or individual for tournament |
| `GET` | `/registrations/my` | Student | Get current user's registrations |
| `GET` | `/registrations` | Organizer | View all registrations |
| `PATCH` | `/registrations/:id/status` | Organizer | Update status (`approved`, `rejected`, `confirmed`) |
| `DELETE` | `/registrations/:id` | Student/Org | Cancel pending registration |

### ⚔️ Matches & Fixtures (`/api/matches`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/matches` | Public | List matches (filters: `tournamentId`, `status`, `date`) |
| `GET` | `/matches/:id` | Public | Get match fixture by ID |
| `POST` | `/matches` | Organizer | Schedule a match (with venue conflict check) |
| `PUT` | `/matches/:id` | Organizer | Update match schedule, venue or notice |
| `PATCH` | `/matches/:id/score` | Organizer | Update live match score & overs |
| `DELETE` | `/matches/:id` | Organizer | Delete match fixture |

### 📊 Results & Leaderboard (`/api/results`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/results/:matchId` | Organizer | Submit final score, declare winner, update standings |
| `GET` | `/results` | Public | Get all completed matches |
| `GET` | `/results/leaderboard/:tournamentId` | Public | Get tournament points table / standings |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/notifications` | Private | Get user notifications |
| `PATCH` | `/notifications/:id/read` | Private | Mark single notification as read |
| `PATCH` | `/notifications/read-all` | Private | Mark all notifications as read |
| `GET` | `/notifications/unread-count` | Private | Get count of unread notifications |

### 📈 Organizer Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/dashboard` | Organizer | Aggregated summary metrics |
| `GET` | `/analytics/participation` | Organizer | Sport-wise and department-wise counts |
| `GET` | `/analytics/performance` | Organizer | Top winning teams & match breakdown |

---

## 11. Postman / Hoppscotch Collection

A complete, pre-configured collection is provided in `CampusPlay.postman_collection.json`.

**To import into Postman or Hoppscotch:**
1. Open Postman or Hoppscotch.
2. Click **Import** -> Select `CampusPlay.postman_collection.json`.
3. The collection includes automatic JWT token extraction scripts on the login requests, setting `{{token}}` automatically for all protected endpoints!

---

## 12. Demo Credentials

Development and demo accounts created by `npm run seed`:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student (Captain)** | `jasnoor.kaur@campus.edu` | `password123` | Computer Science, Captain of BTech-2A |
| **Student (Player)** | `aarav.patel@campus.edu` | `password123` | Mechanical Department |
| **Organizer** | `sports@campus.edu` | `password123` | Sports Committee Coordinator |

---

## 13. Production Deployment

### 1. Build the Frontend
```bash
npm run build
```
The compiled static assets are output to `dist/`.

### 2. Production Environment Variables
On your cloud host (e.g. Render, Railway, AWS, DigitalOcean):
- Set `NODE_ENV=production`
- Set `MONGO_URI` to your production MongoDB Atlas cluster URI.
- Set `JWT_SECRET` to a strong 64-character random string.
- Set `CLIENT_ORIGIN` to your production domain (e.g., `https://campusplay.edu`).

### 3. Serving Backend in Production
```bash
cd backend
npm start
```
Use a process manager like **PM2** to keep the backend resilient:
```bash
npm install -g pm2
pm2 start server.js --name "campusplay-api"
```

---

## 📄 License
ISC License. Built for collegiate athletic platforms.
