import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Sport } from '../types'

const sportEmoji: Record<Sport, string> = {
  Cricket: '🏏', Football: '⚽', Basketball: '🏀', Volleyball: '🏐', Badminton: '🏸',
  'Table Tennis': '🏓', Chess: '♟', Carrom: '🎯', Athletics: '🏃',
}

export function SportIcon({ sport, size = 'md' }: { sport: Sport; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-9 w-9 text-base rounded-xl', md: 'h-12 w-12 text-xl rounded-2xl', lg: 'h-16 w-16 text-3xl rounded-[20px]' }
  return <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center bg-surface-2 ${sizes[size]}`}>{sportEmoji[sport]}</span>
}

const statusText: Record<string, string> = {
  registration_open: 'Registration open', upcoming: 'Upcoming', live: 'Live now', completed: 'Completed', postponed: 'Postponed',
  pending: 'Pending', approved: 'Approved', rejected: 'Rejected', confirmed: 'Confirmed',
}
export function StatusPill({ status, dot = false }: { status: string; dot?: boolean }) {
  const tone = status === 'live' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : ['registration_open', 'approved', 'confirmed', 'completed'].includes(status) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : status === 'rejected' || status === 'postponed' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300' : 'bg-surface-2 text-ink'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize tracking-wide ${tone}`}>{dot && <span className={`h-1.5 w-1.5 rounded-full ${status === 'live' ? 'bg-rose-500' : 'bg-current'}`} />}{statusText[status] ?? status}</span>
}

export function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}<h1 className="page-title">{title}</h1>{subtitle && <p className="muted mt-2 max-w-2xl text-sm leading-relaxed">{subtitle}</p>}</div>{action}</div>
}

export function StatCard({ label, value, detail, icon }: { label: string; value: string | number; detail?: string; icon: ReactNode; }) {
  return <div className={`surface rounded-[20px] p-5 `}><div className="flex items-start justify-between gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-2xl`}>{icon}</span><span className="eyebrow mt-2 text-right">{label}</span></div><div className="mt-4 flex items-end justify-between"><strong className="text-3xl font-extrabold tracking-tight">{value}</strong>{detail && <span className="muted mb-1 text-xs">{detail}</span>}</div></div>
}

export function Modal({ open, title, children, onClose, wide = false }: { open: boolean; title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  if (!open) return null
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101b15]/55 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-label={title} className={`surface fade-up max-h-[90vh] w-full overflow-y-auto rounded-[26px] p-6 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}><div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-xl font-bold tracking-tight">{title}</h2><button className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2" aria-label="Close dialog" onClick={onClose}><X size={17} /></button></div>{children}</section></div>
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="surface rounded-3xl px-6 py-12 text-center"><span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-2xl">🏟️</span><h3 className="text-lg font-bold">{title}</h3><p className="muted mx-auto mt-2 max-w-sm text-sm leading-relaxed">{body}</p>{action && <div className="mt-5">{action}</div>}</div>
}

export function Avatar({ name, color, size = 'md' }: { name: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-16 w-16 text-xl' }
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-ink ${dims[size]}`} style={{ background: color ?? '#d5f28d' }}>{name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
}
