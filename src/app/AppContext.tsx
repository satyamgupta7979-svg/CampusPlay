import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppData, Role, User, Tournament, Team, Match, Registration, Notice } from '../types'
import { api } from '../services/api'
import { authService, type LoginCredentials, type RegisterData, type MfaChallengeResponse } from '../services/authService'
import { tournamentService } from '../services/tournamentService'
import { teamService } from '../services/teamService'
import { matchService } from '../services/matchService'
import { registrationService } from '../services/registrationService'
import { notificationService } from '../services/notificationService'

interface AppContextValue {
  data: AppData
  user: User | undefined
  role: Role
  isLoading: boolean
  updateData: (updater: (current: AppData) => AppData) => void
  /** Step 1: validates credentials, returns MFA challenge (no JWT yet) */
  initiateLogin: (credentials: LoginCredentials) => Promise<MfaChallengeResponse>
  /** Step 2: verifies OTP, sets user + token */
  completeMfaLogin: (challengeId: string, otp: string) => Promise<User>
  /** Quick-fill demo credentials and go through full MFA flow */
  signInDemo: (role: Role) => Promise<MfaChallengeResponse>
  signUp: (registerData: RegisterData) => Promise<User>
  signOut: () => Promise<void>
  resetDemoData: () => Promise<void>
  addUser: (user: User) => void
  refreshData: () => Promise<void>
  toggleTheme: () => void
  toast: string
  showToast: (message: string) => void
  clearToast: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const INITIAL_DATA: AppData = {
  version: 1,
  seedRevision: 3,
  users: [],
  tournaments: [],
  teams: [],
  matches: [],
  registrations: [],
  notifications: [],
  session: null,
  theme: (typeof window !== 'undefined' && (localStorage.getItem('campusplay_theme') as 'light' | 'dark')) || 'light',
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(INITIAL_DATA)
  const [user, setUser] = useState<User | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [toast, setToast] = useState<string>('')

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }, [])

  const clearToast = useCallback(() => setToast(''), [])

  const updateData = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => updater(current))
  }, [])

  const refreshData = useCallback(async () => {
    try {
      const [tournamentsRes, teamsRes, matchesRes] = await Promise.allSettled([
        tournamentService.getTournaments(),
        teamService.getTeams(),
        matchService.getMatches(),
      ])

      const tournaments: Tournament[] = tournamentsRes.status === 'fulfilled' ? tournamentsRes.value : []
      const teams: Team[] = teamsRes.status === 'fulfilled' ? teamsRes.value : []
      const matches: Match[] = matchesRes.status === 'fulfilled' ? matchesRes.value : []

      let registrations: Registration[] = []
      let notifications: Notice[] = []
      let users: User[] = []

      if (api.getToken()) {
        const [regRes, notifRes, usersRes] = await Promise.allSettled([
          registrationService.getAllRegistrations(),
          notificationService.getNotifications(),
          authService.getUsers(),
        ])
        if (regRes.status === 'fulfilled') registrations = regRes.value
        if (notifRes.status === 'fulfilled') notifications = notifRes.value
        if (usersRes.status === 'fulfilled') users = usersRes.value
      }

      setData((current) => ({
        ...current,
        tournaments,
        teams,
        matches,
        registrations,
        notifications,
        users: users.length > 0 ? users : current.users,
      }))
    } catch (err: unknown) {
      console.error('Failed to refresh data from server:', err)
    }
  }, [])

  // Initial authentication check & data load
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      setIsLoading(true)
      const token = api.getToken()

      if (token) {
        try {
          const currentUser = await authService.getMe()
          if (isMounted && currentUser) {
            setUser(currentUser)
            setData((prev) => ({
              ...prev,
              session: { userId: currentUser.id, role: currentUser.role },
            }))
          }
        } catch {
          if (isMounted) {
            api.setToken(null)
            setUser(undefined)
          }
        }
      }

      await refreshData()
      if (isMounted) setIsLoading(false)
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [refreshData])

  /**
   * Step 1: Initiate login — validates credentials, triggers OTP email.
   * Returns the MFA challenge. Does NOT set user or token.
   */
  const initiateLogin = useCallback(async (credentials: LoginCredentials): Promise<MfaChallengeResponse> => {
    const res = await authService.initiateLogin(credentials)
    return res
  }, [])

  /**
   * Step 2: Complete MFA — verify OTP, receive JWT, set authenticated state.
   */
  const completeMfaLogin = useCallback(async (challengeId: string, otp: string): Promise<User> => {
    try {
      const res = await authService.verifyOtp({ challengeId, otp })
      setUser(res.user)
      setData((prev) => ({
        ...prev,
        session: { userId: res.user.id, role: res.user.role },
      }))
      await refreshData()
      showToast(`Welcome back, ${res.user.name}!`)
      return res.user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed'
      throw new Error(msg)
    }
  }, [refreshData, showToast])

  /**
   * Demo login: quick-fill credentials and initiate login (goes through MFA).
   * Returns the challenge so the Login page can show the OTP screen.
   */
  const signInDemo = useCallback(async (roleToUse: Role): Promise<MfaChallengeResponse> => {
    const demoCredentials =
      roleToUse === 'organizer'
        ? { email: 'sports@campus.edu', password: 'password123' }
        : { email: 'jasnoor.kaur@campus.edu', password: 'password123' }

    return initiateLogin(demoCredentials)
  }, [initiateLogin])

  const signUp = useCallback(async (registerData: RegisterData): Promise<User> => {
    try {
      const res = await authService.register(registerData)
      setUser(res.user)
      setData((prev) => ({
        ...prev,
        session: { userId: res.user.id, role: res.user.role },
      }))
      await refreshData()
      showToast('Profile created successfully!')
      return res.user
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      showToast(msg)
      throw err
    }
  }, [refreshData, showToast])

  const signOut = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(undefined)
      setData((prev) => ({
        ...prev,
        session: null,
      }))
      showToast('Signed out')
    }
  }, [showToast])

  const resetDemoData = useCallback(async () => {
    await refreshData()
    showToast('Data refreshed from server')
  }, [refreshData, showToast])

  const addUser = useCallback((newUser: User) => {
    setData((current) => ({
      ...current,
      users: [newUser, ...current.users],
      session: { userId: newUser.id, role: newUser.role },
    }))
    setUser(newUser)
  }, [])

  const toggleTheme = useCallback(() => {
    setData((current) => {
      const nextTheme = current.theme === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem('campusplay_theme', nextTheme)
      } catch {
        // Ignore localStorage error
      }
      return { ...current, theme: nextTheme }
    })
  }, [])

  const role = user?.role || data.session?.role || 'student'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', data.theme === 'dark')
    document.documentElement.dataset.theme = data.theme
  }, [data.theme])

  const value = useMemo(
    () => ({
      data,
      user,
      role,
      isLoading,
      updateData,
      initiateLogin,
      completeMfaLogin,
      signInDemo,
      signUp,
      signOut,
      resetDemoData,
      addUser,
      refreshData,
      toggleTheme,
      toast,
      showToast,
      clearToast,
    }),
    [
      data,
      user,
      role,
      isLoading,
      updateData,
      initiateLogin,
      completeMfaLogin,
      signInDemo,
      signUp,
      signOut,
      resetDemoData,
      addUser,
      refreshData,
      toggleTheme,
      toast,
      showToast,
      clearToast,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
