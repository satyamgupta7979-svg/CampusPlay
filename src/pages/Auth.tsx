import { useState, useEffect, useRef, useCallback, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, Mail, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Brand } from '../components/Shell'
import { useApp } from '../app/AppContext'
import { authService } from '../services/authService'
import type { Role } from '../types'

function AuthFrame({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/login image.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 pt-5 sm:px-10">
        <Brand />
        <Link to="/" className="text-white/70 flex items-center gap-2 text-lg font-semibold transition hover:text-white">
          <ArrowLeft size={14} /> Back home
        </Link>
      </header>
      <main className="relative mx-auto max-w-6xl items-start gap-8 px-5 sm:px-10 py-14 md:py-5">
        <div className="mx-auto w-full max-w-[500px]">
          <p className="eyebrow">{title === 'Welcome back!' ? 'Good to see you again' : 'Join the campus lineup'}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-.06em]">{title}</h1>
          <p className="text-black mt-2 text-sm">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  )
}

// ─── OTP Verification Screen ──────────────────────────────────────────────────

interface OtpScreenProps {
  challengeId: string
  maskedEmail: string
  expiresInMinutes: number
  onSuccess: (user: { role: Role }) => void
  onBack: () => void
}

function OtpScreen({ challengeId, maskedEmail, expiresInMinutes, onSuccess, onBack }: OtpScreenProps) {
  const { completeMfaLogin } = useApp()

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [expirySeconds, setExpirySeconds] = useState(expiresInMinutes * 60)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiryRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown for OTP expiry
  useEffect(() => {
    expiryRef.current = setInterval(() => {
      setExpirySeconds((s) => {
        if (s <= 1) {
          clearInterval(expiryRef.current!)
          setError('Your verification code has expired. Please go back and log in again.')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(expiryRef.current!)
  }, [])

  // Cooldown countdown for resend
  const startCooldown = useCallback((seconds: number) => {
    setResendCooldown(seconds)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    // Initial resend cooldown starts immediately after the OTP is sent
    startCooldown(60)
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [startCooldown])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit code sent to your email.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const user = await completeMfaLogin(challengeId, otp)
      onSuccess(user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return
    setResending(true)
    setError('')
    try {
      const res = await authService.resendOtp({ challengeId })
      setOtp('')
      setExpirySeconds(res.expiresInMinutes * 60)
      startCooldown(res.resendCooldownSeconds)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
    if (error && value.length <= 6) setError('')
  }

  return (
    <AuthFrame title="Check your email" subtitle={`We sent a 6-digit code to ${maskedEmail}`}>
      {/* Email icon badge */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d5f28d]/30 border border-[#9bc34e]/40">
          <Mail size={28} className="text-[#3d6b0a]" />
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-black">Verification Code</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            placeholder="123456"
            autoComplete="one-time-code"
            autoFocus
            disabled={expirySeconds === 0 || submitting}
            className="input-field text-center text-2xl font-bold tracking-[0.4em] placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
          />
        </label>

        {/* Expiry countdown */}
        <p className="text-center text-xs text-black/60">
          {expirySeconds > 0 ? (
            <>Code expires in <span className="font-bold text-black">{formatTime(expirySeconds)}</span></>
          ) : (
            <span className="text-rose-600 font-semibold">Code expired</span>
          )}
        </p>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-100 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || otp.length !== 6 || expirySeconds === 0}
          className="flex justify-center gap-3 items-center font-semibold bg-white/70 hover:bg-surface-2 transition hover:-translate-y-[1px] w-full !rounded-xl !py-3 disabled:opacity-60"
        >
          {submitting ? 'Verifying...' : 'Verify & Sign In'} <ShieldCheck size={16} />
        </button>
      </form>

      {/* Resend */}
      <div className="mt-5 text-center">
        <p className="text-xs text-black/60 mb-2">Didn't receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending || expirySeconds === 0}
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/70 underline underline-offset-4 decoration-[#9bc34e] decoration-2 disabled:opacity-50 disabled:no-underline"
        >
          <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
          {resending
            ? 'Sending...'
            : resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : 'Resend code'}
        </button>
      </div>

      {/* Back to login */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-black/60 hover:text-black transition"
        >
          <ArrowLeft size={12} /> Back to login
        </button>
      </div>
    </AuthFrame>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function Login() {
  const { initiateLogin, signInDemo } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // MFA state
  const [mfaChallenge, setMfaChallenge] = useState<{
    challengeId: string
    maskedEmail: string
    expiresInMinutes: number
  } | null>(null)

  const next = new URLSearchParams(location.search).get('next')

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.includes('@') || password.length < 4) {
      setError('Enter a valid campus email and a password of at least 4 characters.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await initiateLogin({ email, password })
      setMfaChallenge({
        challengeId: res.challengeId,
        maskedEmail: res.maskedEmail,
        expiresInMinutes: res.expiresInMinutes,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMfaSuccess = (user: { role: Role }) => {
    navigate(user.role === 'organizer' ? '/organizer' : next || '/app')
  }

  const continueAsDemo = async (selectedRole: Role) => {
    setError('')
    setSubmitting(true)
    try {
      const res = await signInDemo(selectedRole)
      setMfaChallenge({
        challengeId: res.challengeId,
        maskedEmail: res.maskedEmail,
        expiresInMinutes: res.expiresInMinutes,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Show OTP screen if MFA challenge exists
  if (mfaChallenge) {
    return (
      <OtpScreen
        challengeId={mfaChallenge.challengeId}
        maskedEmail={mfaChallenge.maskedEmail}
        expiresInMinutes={mfaChallenge.expiresInMinutes}
        onSuccess={handleMfaSuccess}
        onBack={() => {
          setMfaChallenge(null)
          setPassword('')
          setError('')
        }}
      />
    )
  }

  return (
    <AuthFrame title="Welcome back!" subtitle="Choose your account type to continue.">
      <fieldset>
        <p className="mb-2 text-xs font-bold text-black">Sign in as</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            role="radio"
            aria-checked={role === 'student'}
            onClick={() => {
              setRole('student')
              setError('')
              if (!email || email.includes('sports@campus.edu')) setEmail('jasnoor.kaur@campus.edu')
            }}
            className={`flex min-h-[84px] items-center gap-3 rounded-2xl border p-3 text-left transition ${
              role === 'student' ? 'border-[#9bc34e] bg-lime/50' : 'border-[var(--line)] bg-white/70 hover:bg-surface-2'
            }`}
          >
            <UserRound size={18} aria-hidden="true" />
            <span>
              <span className="block text-sm font-bold text-black">Student</span>
              <span className="font-semibold mt-1 block text-[10px] leading-snug">Join teams and find matches</span>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={role === 'organizer'}
            onClick={() => {
              setRole('organizer')
              setError('')
              if (!email || email.includes('jasnoor')) setEmail('sports@campus.edu')
            }}
            className={`flex min-h-[84px] items-center gap-3 rounded-2xl border p-3 text-left transition ${
              role === 'organizer' ? 'border-[#9bc34e] bg-lime/50' : 'border-[var(--line)] bg-white/70 hover:bg-surface-2'
            }`}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            <span>
              <span className="block text-sm font-bold text-black">Organiser</span>
              <span className="font-semibold mt-1 block text-[10px] leading-snug">Manage events and fixtures</span>
            </span>
          </button>
        </div>
      </fieldset>

      <form onSubmit={handleLogin} className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-black">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={role === 'student' ? 'jasnoor.kaur@campus.edu' : 'sports@campus.edu'}
            className="input-field"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-bold text-black">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="input-field mb-3"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-xl bg-rose-100 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex justify-center gap-3 items-center font-semibold bg-white/70 hover:bg-surface-2 transition hover:-translate-y-[1px] w-full !rounded-xl !py-3 disabled:opacity-60"
        >
          {submitting ? 'Sending code...' : `Continue as ${role === 'student' ? 'Student' : 'Organiser'}`}{' '}
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="muted text-[14px] font-semibold text-black uppercase tracking-widest mt-1">
          or quick-fill demo credentials
        </span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          type="button"
          disabled={submitting}
          onClick={() => continueAsDemo('student')}
          className="surface-flat flex items-center justify-center gap-2 rounded-xl p-3 text-md font-bold text-black bg-white/70 transition hover:bg-surface-2 disabled:opacity-60"
        >
          <UserRound size={15} /> Student demo
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => continueAsDemo('organizer')}
          className="surface-flat flex items-center justify-center gap-2 rounded-xl p-3 text-md font-bold text-black bg-white/70 transition hover:bg-surface-2 disabled:opacity-60"
        >
          <ShieldCheck size={15} /> Organiser demo
        </button>
      </div>
    </AuthFrame>
  )
}

// ─── Register (unchanged) ─────────────────────────────────────────────────────

export function Register() {
  const { signUp } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    collegeId: '',
    department: '',
    year: '1st Year',
    section: 'A',
    role: 'student' as Role,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (form.password.length < 4) {
      setError('Choose a password with at least 4 characters.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const user = await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        collegeId: form.collegeId,
        department: form.department,
        year: form.year,
        section: form.section,
        role: form.role,
        avatarColor: '#d5f28d',
      })
      navigate(user.role === 'organizer' ? '/organizer' : '/app')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Join the lineup." subtitle="A few details and you're ready to play.">
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-[14px] font-bold text-black">Full name</span>
          <input
            required
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder="Your name"
            className="input-field !py-2.5 text-sm"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[14px] font-bold text-black">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => set('email', event.target.value)}
            placeholder="you@campus.edu"
            className="input-field !py-2.5 text-sm"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[14px] font-bold text-black">Password</span>
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) => set('password', event.target.value)}
            placeholder="At least 4 characters"
            className="input-field !py-2.5 text-sm"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[14px] font-bold text-black">College ID</span>
          <input
            required
            value={form.collegeId}
            onChange={(event) => set('collegeId', event.target.value)}
            placeholder="CP240186"
            className="input-field !py-2.5 text-sm"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-[14px] font-bold text-black">Department</span>
          <select
            required
            value={form.department}
            onChange={(event) => set('department', event.target.value)}
            className="input-field !py-2.5 text-sm"
          >
            <option value="">Choose department</option>
            {['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Business'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[14px] font-bold text-black">Year</span>
          <select
            value={form.year}
            onChange={(event) => set('year', event.target.value)}
            className="input-field !py-2.5 text-sm"
          >
            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-[14px] font-bold text-black">Section</span>
          <select
            value={form.section}
            onChange={(event) => set('section', event.target.value)}
            className="input-field !py-2.5 text-sm"
          >
            {['A', 'B', 'C'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-[14px] font-bold text-black">I'm joining as</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['student', 'organizer'] as const).map((r) => (
              <button
                type="button"
                onClick={() => set('role', r)}
                key={r}
                className={`flex items-center justify-between rounded-xl border p-3 text-[14px] font-bold text-black ${
                  form.role === r ? 'border-[#9bc34e] bg-lime/25' : 'border-[var(--line)]'
                }`}
              >
                {r === 'student' ? 'Student / player' : 'Sports organiser'}
                {form.role === r && <Check size={14} />}
              </button>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="rounded-xl bg-rose-100 px-3 py-2 text-xs text-rose-700 sm:col-span-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex justify-center gap-3 items-center font-semibold bg-white/70 hover:bg-white transition-transform hover:-translate-y-[1px] mt-3 w-full !rounded-xl !py-3 sm:col-span-2 disabled:opacity-60"
        >
          {submitting ? 'Creating profile...' : 'Create your profile'} <ArrowRight size={16} />
        </button>
      </form>
      <p className="muted mt-5 text-center text-xs">
        Already on the team?{' '}
        <Link to="/login" className="font-bold text-white/70 underline decoration-lime decoration-2 underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthFrame>
  )
}
