import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useApp } from './AppContext'
import { AppShell } from '../components/Shell'
import { Landing } from '../pages/Landing'
import { Login, Register } from '../pages/Auth'
import { StudentDashboard, Tournaments, TournamentDetails, MyRegistrations, MyMatches, Results, Leaderboard, Profile } from '../pages/Student'
import { MatchDetails } from '../pages/MatchDetails'
import { OrganizerDashboard, CreateTournament, ManageTournament, ManageRegistrations, ManageFixtures, ManageResults, Analytics } from '../pages/Organizer'

function Authenticated() {
  const { user, isLoading } = useApp()
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9bc34e] border-t-transparent" />
      </div>
    )
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function OrganizerOnly() {
  const { user, role, isLoading } = useApp()
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9bc34e] border-t-transparent" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (role !== 'organizer') return <Navigate to="/app" replace />
  return <Outlet />
}

function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow">Off the field</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight">That page is out of bounds.</h1>
      <p className="muted mt-3 max-w-sm text-sm">Head back to the home screen and find your next fixture.</p>
      <a href="/" className="btn-primary mt-6">Go home</a>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Authenticated />}>
          <Route element={<AppShell />}>
            {/* Student & Shared Routes */}
            <Route path="/app" element={<StudentDashboard />} />
            <Route path="/app/tournaments" element={<Tournaments />} />
            <Route path="/app/tournaments/:id" element={<TournamentDetails />} />
            <Route path="/app/registrations" element={<MyRegistrations />} />
            <Route path="/app/matches" element={<MyMatches />} />
            <Route path="/app/matches/:id" element={<MatchDetails />} />
            <Route path="/app/results" element={<Results />} />
            <Route path="/app/leaderboard" element={<Leaderboard />} />
            <Route path="/app/profile" element={<Profile />} />

            {/* Organizer Only Routes */}
            <Route element={<OrganizerOnly />}>
              <Route path="/organizer" element={<OrganizerDashboard />} />
              <Route path="/organizer/create" element={<CreateTournament />} />
              <Route path="/organizer/manage/:id" element={<ManageTournament />} />
              <Route path="/organizer/registrations" element={<ManageRegistrations />} />
              <Route path="/organizer/fixtures" element={<ManageFixtures />} />
              <Route path="/organizer/results" element={<ManageResults />} />
              <Route path="/organizer/analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
