import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "../app/AppContext";
import {
  Avatar,
  EmptyState,
  PageHeading,
  SportIcon,
  StatCard,
  StatusPill,
} from "../components/UI";
import { FixtureRow } from "../components/FixtureRow";
import { Modal } from "../components/UI";
import {
  countRegistrationParticipants,
  countUniqueParticipants,
  findFixtureConflict,
  getRegistrationAudienceIds,
  getTeamAudienceIds,
} from "../services/domain";
import { tournamentService } from "../services/tournamentService";
import { registrationService } from "../services/registrationService";
import { matchService } from "../services/matchService";
import type { Match, Registration, Sport, Tournament } from "../types";

const sportOptions: Sport[] = [
  "Cricket",
  "Football",
  "Basketball",
  "Volleyball",
  "Badminton",
  "Table Tennis",
  "Chess",
  "Carrom",
  "Athletics",
];
const dateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
const toMinutes = (time: string) => {
  const match =
    time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i) ?? time.match(/(\d{2}):(\d{2})/);
  if (!match) return -1;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
};
const displayTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
};
const labelClass = "mb-1.5 block text-[11px] font-bold";

export function OrganizerDashboard() {
  const { data } = useApp();
  const active = data.tournaments.filter(
    (item) => item.status !== "completed",
  ).length;
  const upcoming = data.matches.filter(
    (item) => item.status === "upcoming",
  ).length;
  const completed = data.matches.filter(
    (item) => item.status === "completed",
  ).length;
  const participants = countUniqueParticipants(data);
  const pending = data.registrations.filter(
    (item) => item.status === "pending",
  );
  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[26px] bg-[#1c342b] p-6 text-white sm:p-8">
        <div className="absolute -right-24 -top-44 h-[370px] w-[370px] rounded-full border border-white/10" />
        <div className="absolute -right-3 -top-32 h-[270px] w-[270px] rounded-full border border-white/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-lime">
              Sports committee · Control room
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.06em] sm:text-[40px]">
              Organizer dashboard
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/60">
              A clear view of every tournament, team, venue and score.
            </p>
          </div>
          <Link to="/organizer/create" className="btn-primary">
            <Plus size={16} /> Create tournament
          </Link>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active tournaments"
          value={active}
          detail="on the calendar"
          icon={<Trophy size={18} />}
        />
        <StatCard
          label="Total participants"
          value={participants}
          detail="across all events"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Upcoming matches"
          value={upcoming}
          detail="fixtures to play"
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          label="Completed matches"
          value={completed}
          detail="final scores published"
          icon={<Check size={18} />}
          
        />
      </section>
      <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="eyebrow">Need a hand?</p>
              <h2 className="mt-1 text-lg font-extrabold">Quick actions</h2>
            </div>
            <Link
              to="/organizer/analytics"
              className="muted text-[10px] font-bold"
            >
              View analytics →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                to: "/organizer/create",
                icon: Plus,
                title: "Create a tournament",
                text: "Set up an event from scratch",
              },
              {
                to: "/organizer/registrations",
                icon: Users,
                title: "Manage registrations",
                text: `${pending.length} teams awaiting review`,
              },
              {
                to: "/organizer/fixtures",
                icon: CalendarDays,
                title: "Manage fixtures",
                text: "Schedule without court clashes",
              },
              {
                to: "/organizer/results",
                icon: Trophy,
                title: "Enter results",
                text: "Publish final scores for players",
              },
            ].map(({ to, icon: Icon, title, text }) => (
              <Link
                key={to}
                to={to}
                className="surface card-hover flex items-center gap-4 rounded-[20px] p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-2">
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-extrabold">{title}</span>
                  <span className="muted mt-1 block text-[10px]">{text}</span>
                </span>
                <ArrowRight size={14} className="muted" />
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="mb-3">
            <p className="eyebrow">Needs your attention</p>
            <h2 className="mt-1 text-lg font-extrabold">Team approvals</h2>
          </div>
          <div className="surface overflow-hidden rounded-[20px]">
            {pending.slice(0, 4).map((registration) => {
              const team = data.teams.find(
                (item) => item.id === registration.teamId,
              );
              const tournament = data.tournaments.find(
                (item) => item.id === registration.tournamentId,
              );
              return (
                <div
                  key={registration.id}
                  className="flex items-center gap-3 border-b border-[var(--line)] p-3 last:border-0"
                >
                  <Avatar
                    name={team?.name ?? "New team"}
                    color={team?.color}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">
                      {team?.name ?? "Roster submitted"}
                    </p>
                    <p className="muted mt-1 truncate text-[10px]">
                      {tournament?.name}
                    </p>
                  </div>
                  <StatusPill status="pending" />
                </div>
              );
            })}
            {!pending.length && (
              <p className="muted p-5 text-xs">All caught up. Nice work.</p>
            )}
            <Link
              to="/organizer/registrations"
              className="flex items-center justify-center border-t border-[var(--line)] py-3 text-[10px] font-bold"
            >
              Review all registrations <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        </section>
      </div>
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="eyebrow">On the campus calendar</p>
            <h2 className="mt-1 text-lg font-extrabold">Your tournaments</h2>
          </div>
          <Link to="/app/tournaments" className="muted text-[10px] font-bold">
            Student view →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.tournaments.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              to={`/organizer/manage/${item.id}`}
              className="surface card-hover flex items-center gap-3 rounded-[18px] p-4"
            >
              <SportIcon sport={item.sport} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold">{item.name}</p>
                <p className="muted mt-1 text-[10px]">
                  {dateLabel(item.startDate)} · {item.venue}
                </p>
              </div>
              <StatusPill status={item.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

interface TournamentForm {
  name: string;
  sport: Sport;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  venue: string;
  format: Tournament["format"];
  maxTeams: number;
  playersPerTeam: number;
  registrationType: Tournament["registrationType"];
  rules: string;
}
const blankTournament: TournamentForm = {
  name: "",
  sport: "Cricket",
  description: "",
  startDate: "2026-11-20",
  endDate: "2026-11-21",
  registrationDeadline: "2026-11-18",
  venue: "Main Ground",
  format: "Knockout",
  maxTeams: 16,
  playersPerTeam: 11,
  registrationType: "Team",
  rules: "College ID required\nRespect the referee’s decision",
};

export function CreateTournament() {
  const { refreshData, showToast } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<TournamentForm>(blankTournament);
  const set = <K extends keyof TournamentForm>(
    key: K,
    value: TournamentForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const created = await tournamentService.createTournament({
        ...form,
        description:
          form.description ||
          `Join the ${form.name} and represent your class in this season’s campus ${form.sport.toLowerCase()} series.`,
        status: "registration_open",
        registrationDeadline: form.registrationDeadline,
        organizer: "Sports Committee",
        rules: form.rules
          .split("\n")
          .map((rule) => rule.trim())
          .filter(Boolean),
        imageTone: ["tone-lime", "tone-blue", "tone-orange", "tone-purple"][
          Math.floor(Math.random() * 4)
        ],
      });
      await refreshData();
      showToast("Tournament created — students can see it now");
      navigate(`/organizer/manage/${created.id}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create tournament");
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="New event"
        title="Create a tournament"
        subtitle="Set the stage. We’ll put the event on the campus calendar."
        action={
          <Link to="/organizer" className="btn-secondary text-xs">
            Cancel
          </Link>
        }
      />
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_310px]">
        <div className="space-y-4">
          <section className="surface rounded-[22px] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-sm font-black">
                01
              </span>
              <div>
                <h2 className="text-sm font-extrabold">Basic information</h2>
                <p className="muted mt-1 text-[10px]">What are we playing?</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={labelClass}>Tournament name</span>
                <input
                  required
                  className="input-field"
                  placeholder="e.g. Inter-Class Cricket Championship"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>Sport</span>
                <select
                  className="input-field"
                  value={form.sport}
                  onChange={(event) =>
                    set("sport", event.target.value as Sport)
                  }
                >
                  {sportOptions.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>Format</span>
                <select
                  className="input-field"
                  value={form.format}
                  onChange={(event) =>
                    set("format", event.target.value as Tournament["format"])
                  }
                >
                  {[
                    "Knockout",
                    "League",
                    "Round Robin",
                    "League + Knockout",
                  ].map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea
                  className="input-field min-h-20 resize-y"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                  placeholder="What's the story behind this event?"
                />
              </label>
            </div>
          </section>
          <section className="surface rounded-[22px] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-sm font-black">
                02
              </span>
              <div>
                <h2 className="text-sm font-extrabold">Schedule & venue</h2>
                <p className="muted mt-1 text-[10px]">
                  Save the date. We’ll watch for clashes.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Start date</span>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={form.startDate}
                  onChange={(event) => set("startDate", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>End date</span>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={form.endDate}
                  onChange={(event) => set("endDate", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>Registration deadline</span>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={form.registrationDeadline}
                  onChange={(event) =>
                    set("registrationDeadline", event.target.value)
                  }
                />
              </label>
              <label>
                <span className={labelClass}>Venue / ground / court</span>
                <input
                  required
                  className="input-field"
                  value={form.venue}
                  onChange={(event) => set("venue", event.target.value)}
                  placeholder="e.g. Main Ground"
                />
              </label>
            </div>
          </section>
          <section className="surface rounded-[22px] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-sm font-black">
                03
              </span>
              <div>
                <h2 className="text-sm font-extrabold">Registration & rules</h2>
                <p className="muted mt-1 text-[10px]">
                  Build the teams and set expectations.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={labelClass}>Maximum teams / players</span>
                <input
                  type="number"
                  min="2"
                  required
                  className="input-field"
                  value={form.maxTeams}
                  onChange={(event) =>
                    set("maxTeams", Number(event.target.value))
                  }
                />
              </label>
              <label>
                <span className={labelClass}>Players per team</span>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-field"
                  value={form.playersPerTeam}
                  onChange={(event) =>
                    set("playersPerTeam", Number(event.target.value))
                  }
                />
              </label>
              <fieldset className="sm:col-span-2">
                <legend className={labelClass}>Registration type</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(["Team", "Individual", "Both"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => set("registrationType", type)}
                      className={`rounded-xl border p-3 text-[11px] font-bold ${form.registrationType === type ? "border-[#9bc34e] bg-lime/25" : "border-[var(--line)]"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="sm:col-span-2">
                <span className={labelClass}>
                  Tournament rules{" "}
                  <span className="muted font-normal">· one per line</span>
                </span>
                <textarea
                  className="input-field min-h-24 resize-y"
                  value={form.rules}
                  onChange={(event) => set("rules", event.target.value)}
                />
              </label>
            </div>
          </section>
        </div>
        <aside className="space-y-4">
          <div className="surface sticky top-24 rounded-[22px] p-5">
            <p className="eyebrow">Ready to launch?</p>
            <h3 className="mt-2 text-lg font-extrabold">
              A good game starts with a good plan.
            </h3>
            <p className="muted mt-2 text-xs leading-relaxed">
              Your event will appear instantly in tournament discovery.
              Registration and fixtures are managed in your organizer workspace.
            </p>
            <div className="mt-5 space-y-3 border-y border-[var(--line)] py-4 text-xs">
              <p className="flex items-center gap-2">
                <CalendarDays size={14} className="muted" />{" "}
                {form.startDate || "Start date"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="muted" /> {form.venue || "Venue"}
              </p>
              <p className="flex items-center gap-2">
                <Users size={14} className="muted" /> {form.registrationType}{" "}
                registration
              </p>
            </div>
            <button className="btn-primary mt-5 w-full !rounded-xl">
              Create tournament <ArrowRight size={14} />
            </button>
            <p className="muted mt-3 text-center text-[9px]">
              This demo saves to localStorage.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}

export function ManageTournament() {
  const { id = "" } = useParams();
  const { data, updateData, refreshData, showToast } = useApp();
  const navigate = useNavigate();
  const tournament = data.tournaments.find((item) => item.id === id);
  const [tab, setTab] = useState("Overview");
  const [form, setForm] = useState<TournamentForm>(() => ({
    ...blankTournament,
    ...(tournament
      ? {
          name: tournament.name,
          sport: tournament.sport,
          description: tournament.description,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          registrationDeadline: tournament.registrationDeadline,
          venue: tournament.venue,
          format: tournament.format,
          maxTeams: tournament.maxTeams,
          playersPerTeam: tournament.playersPerTeam,
          registrationType: tournament.registrationType,
          rules: tournament.rules.join("\n"),
        }
      : {}),
  }));
  const set = <K extends keyof TournamentForm>(
    key: K,
    value: TournamentForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  if (!tournament)
    return (
      <EmptyState
        title="Tournament not found"
        body="This event might have been removed."
        action={
          <Link to="/organizer" className="btn-secondary">
            Back to dashboard
          </Link>
        }
      />
    );
  const teamIds = new Set(
    data.teams
      .filter((team) => team.tournamentId === id)
      .map((team) => team.id),
  );
  const registrations = data.registrations.filter(
    (item) => item.tournamentId === id,
  );
  const teams = data.teams.filter((item) => item.tournamentId === id);
  const matches = data.matches.filter((item) => item.tournamentId === id);
  const remove = async () => {
    if (
      !window.confirm(
        `Delete “${tournament.name}” and its associated registrations, teams and fixtures?`,
      )
    )
      return;
    try {
      await tournamentService.deleteTournament(id);
      await refreshData();
      showToast("Tournament and related records removed");
      navigate("/organizer");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete tournament");
    }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await tournamentService.updateTournament(id, {
        ...form,
        maxTeams: Number(form.maxTeams),
        playersPerTeam: Number(form.playersPerTeam),
        rules: form.rules
          .split("\n")
          .map((rule) => rule.trim())
          .filter(Boolean),
      });
      await refreshData();
      showToast("Tournament details saved");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update tournament");
    }
  };
  const tabs = [
    "Overview",
    "Registrations",
    "Teams",
    "Fixtures",
    "Results",
    "Leaderboard",
  ];
  return (
    <>
      <PageHeading
        eyebrow="Organizer control center"
        title="Manage tournament"
        subtitle={`${tournament.sport} · ${tournament.format} · ${tournament.venue}`}
        action={
          <button
            onClick={remove}
            className="btn-secondary text-xs text-rose-700"
          >
            <Trash2 size={14} /> Delete event
          </button>
        }
      />
      <div
        className={`sport-art ${tournament.imageTone} rounded-[22px] p-5 sm:p-7`}
      >
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <StatusPill status={tournament.status} />
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              {tournament.name}
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed opacity-70">
              {tournament.description}
            </p>
          </div>
          <Link
            to={`/app/tournaments/${id}`}
            className="btn-secondary !rounded-xl text-xs"
          >
            Student preview <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Registrations"
          value={registrations.length}
          detail="rosters submitted"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Fixtures"
          value={matches.length}
          detail={`${matches.filter((match) => match.status === "completed").length} completed`}
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          label="First match"
          value={dateLabel(tournament.startDate)}
          detail={tournament.venue}
          icon={<Trophy size={18} />}
        />
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto border-b border-[var(--line)] scrollbar-hide">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`shrink-0 border-b-2 px-4 py-3 text-xs font-bold ${tab === item ? "border-[#1c342b] text-ink dark:border-lime" : "border-transparent muted"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <section className="mt-5">
        {tab === "Overview" && (
          <form
            onSubmit={save}
            className="surface space-y-4 rounded-[22px] p-5"
          >
            <div>
              <p className="eyebrow">Edit overview</p>
              <h3 className="mt-1 text-sm font-extrabold">Event information</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={labelClass}>Tournament name</span>
                <input
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>Sport</span>
                <select
                  className="input-field"
                  value={form.sport}
                  onChange={(event) =>
                    set("sport", event.target.value as Sport)
                  }
                >
                  {sportOptions.map((sport) => (
                    <option key={sport}>{sport}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>Format</span>
                <select
                  className="input-field"
                  value={form.format}
                  onChange={(event) =>
                    set("format", event.target.value as Tournament["format"])
                  }
                >
                  {[
                    "Knockout",
                    "League",
                    "Round Robin",
                    "League + Knockout",
                  ].map((format) => (
                    <option key={format}>{format}</option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Description</span>
                <textarea
                  className="input-field min-h-20"
                  value={form.description}
                  onChange={(event) => set("description", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>Start date</span>
                <input
                  required
                  type="date"
                  className="input-field"
                  value={form.startDate}
                  onChange={(event) => set("startDate", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>End date</span>
                <input
                  required
                  type="date"
                  className="input-field"
                  value={form.endDate}
                  onChange={(event) => set("endDate", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>Registration deadline</span>
                <input
                  required
                  type="date"
                  className="input-field"
                  value={form.registrationDeadline}
                  onChange={(event) =>
                    set("registrationDeadline", event.target.value)
                  }
                />
              </label>
              <label>
                <span className={labelClass}>Venue / court</span>
                <input
                  required
                  className="input-field"
                  value={form.venue}
                  onChange={(event) => set("venue", event.target.value)}
                />
              </label>
              <label>
                <span className={labelClass}>Maximum teams</span>
                <input
                  type="number"
                  min="2"
                  required
                  className="input-field"
                  value={form.maxTeams}
                  onChange={(event) =>
                    set("maxTeams", Number(event.target.value))
                  }
                />
              </label>
              <label>
                <span className={labelClass}>Players per team</span>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-field"
                  value={form.playersPerTeam}
                  onChange={(event) =>
                    set("playersPerTeam", Number(event.target.value))
                  }
                />
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Registration type</span>
                <select
                  className="input-field"
                  value={form.registrationType}
                  onChange={(event) =>
                    set(
                      "registrationType",
                      event.target.value as Tournament["registrationType"],
                    )
                  }
                >
                  {["Team", "Individual", "Both"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Rules · one per line</span>
                <textarea
                  className="input-field min-h-24"
                  value={form.rules}
                  onChange={(event) => set("rules", event.target.value)}
                />
              </label>
            </div>
            <button className="btn-primary !rounded-xl">
              Save tournament changes
            </button>
          </form>
        )}
        {tab === "Registrations" && (
          <div className="space-y-3">
            {registrations.length ? (
              registrations.map((registration) => (
                <article
                  key={registration.id}
                  className="surface flex flex-wrap items-center gap-3 rounded-[18px] p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold">
                      {data.teams.find(
                        (team) => team.id === registration.teamId,
                      )?.name ??
                        data.users.find(
                          (user) => user.id === registration.studentId,
                        )?.name ??
                        "Roster"}
                    </p>
                    <p className="muted mt-1 text-[10px]">
                      {registration.playerNames.length} players ·{" "}
                      {
                        data.users.find(
                          (user) => user.id === registration.studentId,
                        )?.name
                      }
                    </p>
                  </div>
                  <StatusPill status={registration.status} />
                  <Link
                    to="/organizer/registrations"
                    className="btn-secondary !rounded-xl !py-2 text-[10px]"
                  >
                    Review
                  </Link>
                </article>
              ))
            ) : (
              <EmptyState
                title="No registrations yet"
                body="New student signups will appear here."
              />
            )}
          </div>
        )}
        {tab === "Teams" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {teams.length ? (
              teams.map((team) => (
                <article key={team.id} className="surface rounded-[18px] p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={team.name} color={team.color} />
                    <div>
                      <p className="text-xs font-extrabold">{team.name}</p>
                      <p className="muted mt-1 text-[10px]">
                        Captain:{" "}
                        {data.users.find((user) => user.id === team.captainId)
                          ?.name ?? "Roster lead"}
                      </p>
                    </div>
                  </div>
                  <p className="muted mt-3 text-[10px]">
                    {team.playerIds
                      .map(
                        (playerId) =>
                          data.users.find((user) => user.id === playerId)
                            ?.name ?? playerId,
                      )
                      .join(" · ")}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState
                title="No teams yet"
                body="Approved teams will be listed here."
              />
            )}
          </div>
        )}
        {tab === "Fixtures" && (
          <div className="space-y-3">
            {matches.length ? (
              matches.map((match) => (
                <FixtureRow key={match.id} match={match} />
              ))
            ) : (
              <EmptyState
                title="No fixtures yet"
                body="Create the tournament draw from fixture management."
                action={
                  <Link to="/organizer/fixtures" className="btn-primary">
                    Manage fixtures
                  </Link>
                }
              />
            )}
          </div>
        )}
        {tab === "Results" && (
          <div className="space-y-3">
            {matches
              .filter((match) => match.status === "completed")
              .map((match) => (
                <article
                  key={match.id}
                  className="surface flex items-center justify-between gap-3 rounded-[18px] p-4"
                >
                  <div>
                    <p className="text-xs font-extrabold">
                      {
                        data.teams.find((team) => team.id === match.teamAId)
                          ?.name
                      }{" "}
                      {match.scoreA}–{match.scoreB}{" "}
                      {
                        data.teams.find((team) => team.id === match.teamBId)
                          ?.name
                      }
                    </p>
                    <p className="muted mt-1 text-[10px]">
                      Winner:{" "}
                      {data.teams.find((team) => team.id === match.winnerId)
                        ?.name ?? "—"}
                    </p>
                  </div>
                  <StatusPill status={match.status} />
                </article>
              ))}
            {!matches.some((match) => match.status === "completed") && (
              <EmptyState
                title="No results published"
                body="Published scorecards will appear here."
                action={
                  <Link to="/organizer/results" className="btn-primary">
                    Publish a result
                  </Link>
                }
              />
            )}
          </div>
        )}
        {tab === "Leaderboard" && (
          <div className="surface divide-y divide-[var(--line)] overflow-hidden rounded-[20px]">
            {[...teams]
              .sort((a, b) => b.points - a.points || b.wins - a.wins)
              .map((team, index) => (
                <div key={team.id} className="flex items-center gap-3 p-4">
                  <span className="w-8 text-xs font-black">{index + 1}</span>
                  <Avatar name={team.name} color={team.color} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">
                    {team.name}
                  </span>
                  <span className="muted text-[10px]">{team.wins} wins</span>
                  <strong className="text-xs">{team.points} pts</strong>
                </div>
              ))}
            {!teamIds.size && (
              <EmptyState
                title="Standings are coming"
                body="Team standings appear when registrations are approved."
              />
            )}
          </div>
        )}
      </section>
    </>
  );
}

export function ManageRegistrations() {
  const { data, refreshData, showToast } = useApp();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = useMemo(
    () =>
      data.registrations
        .filter(
          (registration) =>
            (filter === "All" ||
              registration.status === filter.toLowerCase()) &&
            `${data.teams.find((team) => team.id === registration.teamId)?.name ?? ""} ${data.users.find((user) => user.id === registration.studentId)?.name ?? ""} ${data.tournaments.find((item) => item.id === registration.tournamentId)?.name ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort(
          (a, b) =>
            (a.status === "pending" ? -1 : 1) -
            (b.status === "pending" ? -1 : 1),
        ),
    [data, filter, query],
  );
  const selected = data.registrations.find(
    (registration) => registration.id === selectedId,
  );
  const selectedTeam = selected
    ? data.teams.find((team) => team.id === selected.teamId)
    : undefined;
  const setStatus = async (
    registration: Registration,
    status: "approved" | "rejected",
  ) => {
    try {
      await registrationService.updateRegistrationStatus(registration.id, status);
      await refreshData();
      showToast(
        status === "approved"
          ? `${selectedTeam?.name ?? "Team"} approved`
          : `${selectedTeam?.name ?? "Registration"} declined`,
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update registration status");
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="Team operations"
        title="Registration management"
        subtitle="Review rosters, check player counts, and get the teams on the board."
        action={
          <span className="rounded-full bg-lime px-3 py-2 text-[10px] font-extrabold">
            {
              data.registrations.filter((item) => item.status === "pending")
                .length
            }{" "}
            pending review
          </span>
        }
      />
      <div className="surface mb-4 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <label className="flex min-w-[200px] flex-1 items-center gap-2 px-2">
          <Search size={14} className="muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-xs outline-none"
            placeholder="Search team or tournament"
          />
        </label>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="input-field !w-auto !rounded-xl !py-2 text-xs"
        >
          {["All", "Pending", "Approved", "Rejected", "Confirmed"].map(
            (item) => (
              <option key={item}>{item}</option>
            ),
          )}
        </select>
      </div>
      <div className="surface overflow-hidden rounded-[22px]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-surface-2 text-[9px] uppercase tracking-widest muted">
              <tr>
                {[
                  "Team / participant",
                  "Tournament",
                  "Captain",
                  "Players",
                  "Status",
                  "Actions",
                ].map((item) => (
                  <th key={item} className="px-4 py-3 font-bold">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((registration) => {
                const team = data.teams.find(
                  (item) => item.id === registration.teamId,
                );
                const user = data.users.find(
                  (item) => item.id === registration.studentId,
                );
                const tournament = data.tournaments.find(
                  (item) => item.id === registration.tournamentId,
                );
                return (
                  <tr
                    key={registration.id}
                    className="border-t border-[var(--line)]"
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Avatar
                          name={team?.name ?? user?.name ?? "Player"}
                          color={team?.color ?? user?.avatarColor}
                          size="sm"
                        />
                        <span>
                          <strong className="block">
                            {team?.name ?? "Individual player"}
                          </strong>
                          <span className="muted mt-0.5 block text-[10px]">
                            {team?.department ?? user?.department}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">{tournament?.name}</td>
                    <td className="px-4 py-3">{user?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {registration.playerNames.length ||
                        team?.playerIds.length ||
                        1}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={registration.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(registration.id)}
                          className="rounded-lg bg-surface-2 px-2.5 py-2 text-[10px] font-bold"
                        >
                          View roster
                        </button>
                        {registration.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setStatus(registration, "approved")
                              }
                              className="rounded-lg bg-emerald-100 px-2.5 py-2 text-[10px] font-bold text-emerald-800"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setStatus(registration, "rejected")
                              }
                              className="rounded-lg bg-surface-2 px-2.5 py-2 text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!list.length && (
          <p className="muted p-7 text-center text-xs">
            No registrations found for this filter.
          </p>
        )}
      </div>
      <Modal
        open={Boolean(selected)}
        title={`Roster · ${selectedTeam?.name ?? "Player"}`}
        onClose={() => setSelectedId(null)}
        wide
      >
        {selected && (
          <div className="space-y-3">
            <p className="muted text-xs">
              {
                data.tournaments.find(
                  (item) => item.id === selected.tournamentId,
                )?.name
              }{" "}
              ·{" "}
              {selected.playerNames.length ||
                selectedTeam?.playerIds.length ||
                1}{" "}
              participant(s)
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(selected.playerNames.length
                ? selected.playerNames
                : (selectedTeam?.playerIds.map(
                    (playerId) =>
                      data.users.find((user) => user.id === playerId)?.name ??
                      playerId,
                  ) ?? [
                    data.users.find((user) => user.id === selected.studentId)
                      ?.name ?? "Player",
                  ])
              ).map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  className="surface-flat rounded-xl p-3 text-xs font-semibold"
                >
                  {name}
                  {selectedTeam?.playerIds[index] ===
                    selectedTeam?.captainId && (
                    <span className="muted ml-2 text-[9px]">Captain</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export function ManageFixtures() {
  const { data, refreshData, showToast } = useApp();
  const initialTournamentId = data.tournaments[0]?.id ?? "";
  const initialTournamentTeams = data.teams.filter(
    (team) => team.tournamentId === initialTournamentId,
  );
  const [tournamentId, setTournamentId] = useState(initialTournamentId);
  const [round, setRound] = useState("Quarter Final");
  const [teamAId, setTeamAId] = useState(initialTournamentTeams[0]?.id ?? "");
  const [teamBId, setTeamBId] = useState(initialTournamentTeams[1]?.id ?? "");
  const [date, setDate] = useState("2026-11-25");
  const [time, setTime] = useState("14:00");
  const [venue, setVenue] = useState("Main Ground");
  const [conflict, setConflict] = useState("");
  const [filter, setFilter] = useState("All");
  const teamsForTournament = data.teams.filter(
    (team) => team.tournamentId === tournamentId,
  );
  const visibleTeams = teamsForTournament;
  const matches = data.matches
    .filter(
      (match) => filter === "All" || match.status === filter.toLowerCase(),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const createMatch = async (event: FormEvent) => {
    event.preventDefault();
    if (
      teamsForTournament.length < 2 ||
      !teamsForTournament.some((team) => team.id === teamAId) ||
      !teamsForTournament.some((team) => team.id === teamBId)
    ) {
      setConflict("Choose two teams from this tournament before scheduling.");
      return;
    }
    if (teamAId === teamBId) {
      setConflict("Choose two different teams before scheduling.");
      return;
    }
    const overlap = findFixtureConflict(data.matches, { date, time, venue });
    if (overlap) {
      const teamA =
        data.teams.find((team) => team.id === overlap.teamAId)?.name ??
        "Another team";
      const teamB =
        data.teams.find((team) => team.id === overlap.teamBId)?.name ??
        "Another team";
      setConflict(
        `This slot overlaps ${teamA} vs ${teamB} at ${overlap.time} on ${overlap.venue}. Pick another time or venue.`,
      );
      return;
    }
    try {
      await matchService.createMatch({
        tournamentId,
        round,
        teamAId,
        teamBId,
        date,
        time: displayTime(time),
        venue,
        status: "upcoming",
      });
      await refreshData();
      setConflict("");
      showToast("Fixture created — it is now visible to students");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create fixture");
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="Schedule control"
        title="Fixture management"
        subtitle="Build the draw, reserve a court, and keep every player in the loop."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <form onSubmit={createMatch} className="surface rounded-[22px] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime">
              <Plus size={17} />
            </span>
            <div>
              <p className="eyebrow">New fixture</p>
              <h2 className="mt-1 text-sm font-extrabold">Schedule a match</h2>
            </div>
          </div>
          {conflict && (
            <div
              role="alert"
              className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900"
            >
              <CircleAlert size={15} className="mt-0.5 shrink-0" /> {conflict}
            </div>
          )}
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className={labelClass}>Tournament</span>
              <select
                required
                value={tournamentId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  const tournamentTeams = data.teams.filter(
                    (team) => team.tournamentId === nextId,
                  );
                  const availableTeams = tournamentTeams;
                  setTournamentId(nextId);
                  setTeamAId(availableTeams[0]?.id ?? "");
                  setTeamBId(availableTeams[1]?.id ?? "");
                  setVenue(
                    data.tournaments.find((item) => item.id === nextId)
                      ?.venue ?? "",
                  );
                }}
                className="input-field"
              >
                {data.tournaments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Round</span>
              <select
                value={round}
                onChange={(event) => setRound(event.target.value)}
                className="input-field"
              >
                {[
                  "Quarter Final",
                  "Semi Final",
                  "Final",
                  "Group Stage",
                  "League fixture",
                  "Round of 16",
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={labelClass}>Team A</span>
                <select
                  required
                  value={teamAId}
                  onChange={(event) => setTeamAId(event.target.value)}
                  className="input-field"
                >
                  <option value="">Select a team</option>
                  {visibleTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelClass}>Team B</span>
                <select
                  required
                  value={teamBId}
                  onChange={(event) => setTeamBId(event.target.value)}
                  className="input-field"
                >
                  <option value="">Select a team</option>
                  {visibleTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {visibleTeams.length < 2 && (
              <p className="rounded-xl bg-surface-2 p-3 text-[10px] leading-relaxed">
                Add or approve at least two teams in this tournament before
                creating a fixture.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={labelClass}>Date</span>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="input-field"
                />
              </label>
              <label>
                <span className={labelClass}>Time</span>
                <input
                  required
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="input-field"
                />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Venue / court</span>
              <input
                required
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
                className="input-field mb-3"
                placeholder="Main Ground"
              />
            </label>
            {/* <div className="rounded-xl bg-surface-2 p-3 text-[10px] leading-relaxed">
              <span className="font-bold">Smart schedule check</span>
              <p className="muted mt-1">
                We’ll block overlapping fixtures at the same venue (90-minute
                match window) before saving.
              </p>
            </div> */}
            <button
              disabled={visibleTeams.length < 2 || !teamAId || !teamBId}
              className="flex items-center justify-center gap-3 border border-white/10 hover:text-white text-white/70 py-3 w-full !rounded-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create match <ArrowRight size={14} />
            </button>
          </div>
        </form>
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Every court, every team</p>
              <h2 className="mt-1 text-lg font-extrabold">
                Fixtures on the board
              </h2>
            </div>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="input-field !w-auto !rounded-xl !py-2 text-xs"
            >
              {["All", "Upcoming", "Live", "Completed", "Postponed"].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
          </div>
          <div className="space-y-3">
            {matches.slice(0, 8).map((match) => (
              <FixtureRow key={match.id} match={match} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function ManageResults() {
  const { data, refreshData, showToast } = useApp();
  const eligible = data.matches.filter(
    (match) => match.status === "upcoming" || match.status === "live",
  );
  const [matchId, setMatchId] = useState(eligible[0]?.id ?? "");
  const [scoreA, setScoreA] = useState("78");
  const [scoreB, setScoreB] = useState("72");
  const current = eligible.find((match) => match.id === matchId);
  const publish = async (event: FormEvent) => {
    event.preventDefault();
    if (!current) return;
    const actualWinner =
      Number(scoreA) >= Number(scoreB) ? current.teamAId : current.teamBId;
    const nextMatch = eligible.find((match) => match.id !== matchId);
    try {
      await matchService.submitResult(matchId, {
        scoreA,
        scoreB,
        winnerId: actualWinner,
        notice: "Result published on CampusPlay",
      });
      await refreshData();
      setMatchId(nextMatch?.id ?? "");
      showToast("Result published to the student dashboard");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to publish result");
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="The final whistle"
        title="Results management"
        subtitle="Enter a score once. Make it visible across CampusPlay."
      />
      <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <form onSubmit={publish} className="surface rounded-[22px] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime">
              <Trophy size={17} />
            </span>
            <div>
              <p className="eyebrow">Publish scorecard</p>
              <h2 className="mt-1 text-sm font-extrabold">Enter a result</h2>
            </div>
          </div>
          <label className="mt-5 block">
            <span className={labelClass}>Match</span>
            <select
              required
              value={matchId}
              onChange={(event) => {
                setMatchId(event.target.value);
              }}
              className="input-field"
            >
              {eligible.map((match) => (
                <option key={match.id} value={match.id}>
                  {data.teams.find((team) => team.id === match.teamAId)?.name}{" "}
                  vs{" "}
                  {data.teams.find((team) => team.id === match.teamBId)?.name} ·{" "}
                  {dateLabel(match.date)}
                </option>
              ))}
            </select>
          </label>
          {current ? (
            <>
              <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <label className="block">
                  <span className="mb-2 block truncate text-[11px] font-bold">
                    {
                      data.teams.find((team) => team.id === current.teamAId)
                        ?.name
                    }
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={scoreA}
                    onChange={(event) => setScoreA(event.target.value)}
                    className="input-field text-center text-2xl font-black"
                  />
                </label>
                <span className="muted mt-6 text-xs font-bold">VS</span>
                <label className="block">
                  <span className="mb-2 block truncate text-[11px] font-bold">
                    {
                      data.teams.find((team) => team.id === current.teamBId)
                        ?.name
                    }
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={scoreB}
                    onChange={(event) => setScoreB(event.target.value)}
                    className="input-field text-center text-2xl font-black"
                  />
                </label>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="eyebrow">Winner from score</p>
                <p className="mt-1 text-xs font-extrabold">
                  {Number(scoreA) >= Number(scoreB)
                    ? data.teams.find((team) => team.id === current.teamAId)
                        ?.name
                    : data.teams.find((team) => team.id === current.teamBId)
                        ?.name}
                  {Number(scoreA) === Number(scoreB)
                    ? " · tie-break to Team A"
                    : ""}
                </p>
              </div>
              <button className="flex items-center justify-center gap-3 border border-white/10 hover:text-white text-white/70 py-3 mt-5 w-full !rounded-xl">
                <Check size={15} /> Publish result
              </button>
            </>
          ) : (
            <p className="muted mt-5 text-xs">
              No upcoming matches are available to score.
            </p>
          )}
        </form>
        <section>
          <div className="mb-3">
            <p className="eyebrow">The latest scorecards</p>
            <h2 className="mt-1 text-lg font-extrabold">Recent results</h2>
          </div>
          <div className="space-y-3">
            {data.matches
              .filter((match) => match.status === "completed")
              .slice(0, 6)
              .map((match) => (
                <div
                  key={match.id}
                  className="surface flex items-center gap-3 rounded-[18px] p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold">
                      {
                        data.teams.find((team) => team.id === match.teamAId)
                          ?.name
                      }{" "}
                      <span className="muted">vs</span>{" "}
                      {
                        data.teams.find((team) => team.id === match.teamBId)
                          ?.name
                      }
                    </p>
                    <p className="muted mt-1 text-[10px]">
                      {
                        data.tournaments.find(
                          (item) => item.id === match.tournamentId,
                        )?.sport
                      }{" "}
                      · {dateLabel(match.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">
                      {match.scoreA}–{match.scoreB}
                    </p>
                    <p className="mt-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                      {
                        data.teams.find((team) => team.id === match.winnerId)
                          ?.name
                      }{" "}
                      won
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function Analytics() {
  const { data } = useApp();
  const sportStats = sportOptions.map((sport) => ({
    sport: sport === "Table Tennis" ? "Table tennis" : sport,
    participants: countRegistrationParticipants(
      data.registrations.filter(
        (registration) =>
          data.tournaments.find((item) => item.id === registration.tournamentId)
            ?.sport === sport,
      ),
    ),
  }));
  const tournamentStats = data.tournaments
    .map((tournament) => ({
      tournament: tournament.name,
      participants: countRegistrationParticipants(
        data.registrations.filter(
          (registration) => registration.tournamentId === tournament.id,
        ),
      ),
    }))
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 8);
  const completed = data.matches.filter(
    (match) => match.status === "completed",
  ).length;
  const upcoming = data.matches.filter(
    (match) => match.status === "upcoming",
  ).length;
  const matchData = [
    { label: "Completed", value: completed },
    { label: "Upcoming", value: upcoming },
    {
      label: "Live",
      value: data.matches.filter((match) => match.status === "live").length,
    },
  ];
  const colors = ["#c8f169", "#a8d3ca", "#e9c78e", "#c8b2e5", "#edb3a5"];
  return (
    <>
      <PageHeading
        eyebrow="The season, by the numbers"
        title="Tournament analytics"
        subtitle="A quick read on participation, fixtures and campus momentum."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Participants"
          value={countUniqueParticipants(data)}
          detail="unique roster names"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Teams"
          value={data.teams.length}
          detail="in the season dataset"
          icon={<ShieldCheck size={18} />}
        />
        <StatCard
          label="Matches"
          value={data.matches.length}
          detail="on the schedule"
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          label="Completed"
          value={completed}
          detail="final scores"
          icon={<Check size={18} />}
        />
        <StatCard
          label="Upcoming"
          value={upcoming}
          detail="ready to play"
          icon={<Clock3 size={18} />}
          
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="surface rounded-[22px] p-5">
          <div>
            <p className="eyebrow">Participation by sport</p>
            <h2 className="mt-1 text-sm font-extrabold">
              Players on each sport roster
            </h2>
          </div>
          <div className="mt-4 h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sportStats}
                margin={{ top: 10, right: 8, bottom: 5, left: -18 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--line)"
                />
                <XAxis
                  dataKey="sport"
                  tick={{ fill: "#89938c", fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: "#89938c", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    fontSize: 11,
                    color: "var(--ink)",
                  }}
                />
                <Bar
                  dataKey="participants"
                  fill="#c8f169"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="surface rounded-[22px] p-5">
          <div>
            <p className="eyebrow">Matches completed</p>
            <h2 className="mt-1 text-sm font-extrabold">A season in motion</h2>
          </div>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_1fr]">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matchData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={5}
                  >
                    {matchData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={["#c8f169", "#a9d8ce", "#ee9788"][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      fontSize: 11,
                      color: "var(--ink)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {matchData.map((item, i) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: ["#c8f169", "#a9d8ce", "#ee9788"][i] }}
                  />
                  <span className="muted flex-1 text-xs">{item.label}</span>
                  <strong className="text-sm">{item.value}</strong>
                </div>
              ))}
              <p className="muted border-t border-[var(--line)] pt-3 text-[10px] leading-relaxed">
                Counts reflect stored fixtures and published results.
              </p>
            </div>
          </div>
        </section>
      </div>
      <section className="surface mt-5 rounded-[22px] p-5">
        <div>
          <p className="eyebrow">Participation by tournament</p>
          <h2 className="mt-1 text-sm font-extrabold">
            Where players have signed up
          </h2>
        </div>
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={tournamentStats}
              margin={{ top: 10, right: 8, bottom: 45, left: -18 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--line)"
              />
              <XAxis
                dataKey="tournament"
                tick={{ fill: "#89938c", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={65}
              />
              <YAxis
                tick={{ fill: "#89938c", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  fontSize: 11,
                  color: "var(--ink)",
                }}
              />
              <Bar
                dataKey="participants"
                fill="#a8d3ca"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="surface mt-5 rounded-[22px] p-5">
        <div>
          <p className="eyebrow">The competition</p>
          <h2 className="mt-1 text-sm font-extrabold">Wins by team</h2>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[...data.teams]
            .sort((a, b) => b.wins - a.wins)
            .slice(0, 8)
            .map((team, index) => (
              <div
                key={team.id}
                className="flex items-center gap-3 rounded-xl bg-surface-2 p-3"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black"
                  style={{ background: team.color }}
                >
                  {team.initials}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-bold">
                  {team.name}
                </span>
                <span className="text-xs font-black">{team.wins} W</span>
                {index === 0 && <span className="text-sm">🥇</span>}
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
