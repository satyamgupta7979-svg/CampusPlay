import { useState, type FormEvent } from 'react'
import { CalendarDays, Check, Clock3, MapPin, Pencil, X } from 'lucide-react'
import { useApp } from '../app/AppContext'
import type { Match } from '../types'
import { StatusPill } from './UI'
import { findFixtureConflict, getTeamAudienceIds, timeToMinutes } from '../services/domain'

function inputTime(value: string) {
  const mins = timeToMinutes(value)
  if (mins < 0) return '14:00'
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}
function displayTime(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
}
const dateLabel = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export function FixtureRow({ match }: { match: Match }) {
  const { data, updateData, showToast } = useApp()
  const [editing, setEditing] = useState(false)
  const [date, setDate] = useState(match.date)
  const [time, setTime] = useState(inputTime(match.time))
  const [venue, setVenue] = useState(match.venue)
  const [conflict, setConflict] = useState('')
  const teamA = data.teams.find((team) => team.id === match.teamAId)
  const teamB = data.teams.find((team) => team.id === match.teamBId)
  const tournament = data.tournaments.find((item) => item.id === match.tournamentId)
  const saveSchedule = (event: FormEvent) => {
    event.preventDefault()
    const overlap = findFixtureConflict(data.matches, { date, time: displayTime(time), venue, excludeMatchId: match.id })
    if (overlap) {
      const home = data.teams.find((team) => team.id === overlap.teamAId)?.name ?? 'Another match'
      const away = data.teams.find((team) => team.id === overlap.teamBId)?.name ?? ''
      setConflict(`${home}${away ? ` vs ${away}` : ''} already has this court or ground during that time.`)
      return
    }
    const targetUserIds = getTeamAudienceIds(data, [match.teamAId, match.teamBId])
    const changedVenue = venue.trim() !== match.venue
    const changedSlot = date !== match.date || displayTime(time) !== match.time
    updateData((current) => ({
      ...current,
      matches: current.matches.map((item) => item.id === match.id ? { ...item, date, time: displayTime(time), venue: venue.trim() } : item),
      notifications: [{ id: `notice-${Date.now()}`, title: changedVenue ? 'Fixture venue updated' : 'Fixture schedule updated', body: `${teamA?.name ?? 'Team A'} vs ${teamB?.name ?? 'Team B'} · ${dateLabel(date)} · ${displayTime(time)} · ${venue.trim()}`, kind: changedVenue ? 'venue' : 'match', time: 'Just now', targetUserIds }, ...current.notifications],
    }))
    setConflict('')
    setEditing(false)
    showToast(changedVenue && changedSlot ? 'Schedule and venue updated; players notified' : changedVenue ? 'Venue updated; registered players notified' : 'Schedule updated; registered players notified')
  }
  return <article className="surface rounded-[18px] p-4"><div className="flex items-center justify-between gap-2"><span className="eyebrow">{tournament?.sport} · {match.round}</span><StatusPill status={match.status} /></div><div className="my-3 flex items-start justify-between gap-3"><p className="text-xs font-extrabold">{teamA?.name} <span className="muted px-1">vs</span> {teamB?.name}</p><span className="muted shrink-0 text-[10px]">{dateLabel(match.date)} · {match.time}</span></div><div className="flex items-center justify-between gap-2"><p className="muted flex items-center gap-1 text-[10px]"><MapPin size={12} /> {match.venue}</p>{match.status !== 'completed' && <button type="button" onClick={() => { setEditing((value) => !value); setDate(match.date); setTime(inputTime(match.time)); setVenue(match.venue); setConflict('') }} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold hover:bg-surface-2">{editing ? <X size={12} /> : <Pencil size={12} />}{editing ? 'Close' : 'Change schedule'}</button>}</div>{editing && <form onSubmit={saveSchedule} className="mt-3 space-y-2 border-t border-[var(--line)] pt-3"><div className="grid grid-cols-2 gap-2"><label><span className="mb-1 block text-[9px] font-bold">Date</span><span className="relative block"><CalendarDays size={12} className="muted absolute left-2.5 top-3" /><input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="input-field !pl-8 !py-2 text-[10px]" /></span></label><label><span className="mb-1 block text-[9px] font-bold">Time</span><span className="relative block"><Clock3 size={12} className="muted absolute left-2.5 top-3" /><input required type="time" value={time} onChange={(event) => setTime(event.target.value)} className="input-field !pl-8 !py-2 text-[10px]" /></span></label></div><label className="block"><span className="mb-1 block text-[9px] font-bold">Venue</span><span className="relative block"><MapPin size={12} className="muted absolute left-2.5 top-3" /><input required value={venue} onChange={(event) => setVenue(event.target.value)} className="input-field !pl-8 !py-2 text-[10px]" /></span></label>{conflict && <p role="alert" className="rounded-lg bg-amber-50 px-2.5 py-2 text-[10px] text-amber-900">{conflict}</p>}<button className="btn-primary w-full !rounded-xl !py-2 text-[10px]"><Check size={13} /> Save & notify players</button></form>}</article>
}
