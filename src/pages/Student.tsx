import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  MapPin,
  Medal,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../app/AppContext";
import {
  Avatar,
  EmptyState,
  Modal,
  PageHeading,
  SportIcon,
  StatCard,
  StatusPill,
} from "../components/UI";
import type {
  Match,
  Registration,
  Sport,
  Team,
  Tournament,
  User,
} from "../types";
import {
  getRegistrationBlockReason,
  getStudentTeamIds,
} from "../services/domain";
import { registrationService } from "../services/registrationService";

const sports: Array<Sport | "All sports"> = [
  "All sports",
  "Cricket",
  "Football",
  "Basketball",
  "Badminton",
  "Volleyball",
  "Table Tennis",
  "Chess",
  "Carrom",
  "Athletics",
];
const states = [
  "All statuses",
  "registration_open",
  "upcoming",
  "live",
  "completed",
] as const;
const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) => new Date(`${date}T00:00:00`).toLocaleDateString("en-US", options);
const timeSort = (value: string) => {
  const [clock, period] = value.split(" ");
  const [hour, minute] = clock.split(":").map(Number);
  return ((hour % 12) + (period === "PM" ? 12 : 0)) * 60 + minute;
};

function TournamentCard({
  tournament,
  compact = false,
}: {
  tournament: Tournament;
  compact?: boolean;
}) {
  const { data } = useApp();
  const teams = data.teams.filter(
    (team) => team.tournamentId === tournament.id,
  ).length;
  return (
    <Link
      to={`/app/tournaments/${tournament.id}`}
      className="surface card-hover group flex flex-col overflow-hidden rounded-[22px]"
    >
      <div
        className={`sport-art ${tournament.imageTone} ${compact ? "min-h-[116px]" : "min-h-[148px]"} p-4`}
      >
        <div className="relative z-10 flex items-start justify-between">
          <SportIcon sport={tournament.sport} size="md" />
          <StatusPill status={tournament.status} />
        </div>
        <div className="relative z-10 mt-5">
          <p className="text-[9px] font-extrabold uppercase tracking-[.17em] opacity-60">
            {tournament.sport} · {tournament.format}
          </p>
          <h3
            className={`mt-1 font-extrabold leading-tight tracking-[-.03em] ${compact ? "text-sm" : "text-lg"}`}
          >
            {tournament.name}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="muted line-clamp-2 text-xs leading-relaxed">
          {tournament.description}
        </p>
        <div className="muted mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px]">
          <span className="inline-flex items-center gap-1">
            <Users size={12} /> {teams} teams
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={12} /> {dateLabel(tournament.startDate)}
          </span>
        </div>
        <div className="muted mt-2 flex items-center gap-1 text-[10px]">
          <MapPin size={12} />{" "}
          <span className="truncate">{tournament.venue}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-3 text-[10px] font-bold">
          <span>View tournament</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 transition group-hover:bg-lime">
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MatchCard({
  match,
  showSport = true,
}: {
  match: Match;
  showSport?: boolean;
}) {
  const { data } = useApp();
  const teamA = data.teams.find((team) => team.id === match.teamAId);
  const teamB = data.teams.find((team) => team.id === match.teamBId);
  const tournament = data.tournaments.find(
    (item) => item.id === match.tournamentId,
  );
  return (
    <Link
      to={`/app/matches/${match.id}`}
      className="surface card-hover block rounded-[20px] p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">
          {showSport ? tournament?.sport : match.round} · {match.round}
        </span>
        <StatusPill status={match.status} dot={match.status === "live"} />
      </div>
      <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="min-w-0">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl font-extrabold"
            style={{ background: teamA?.color }}
          >
            {teamA?.initials}
          </span>
          <p className="mt-2 truncate text-xs font-extrabold">{teamA?.name}</p>
          <p className="mt-1 text-xl font-black tracking-tight">
            {match.scoreA ?? "—"}
          </p>
        </div>
        <span className="muted text-[9px] font-bold">VS</span>
        <div className="min-w-0 text-right">
          <span
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl font-extrabold"
            style={{ background: teamB?.color }}
          >
            {teamB?.initials}
          </span>
          <p className="mt-2 truncate text-xs font-extrabold">{teamB?.name}</p>
          <p className="mt-1 text-xl font-black tracking-tight">
            {match.scoreB ?? "—"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-3 text-[10px]">
        <span className="muted inline-flex items-center gap-1">
          <CalendarDays size={12} /> {dateLabel(match.date)} · {match.time}
        </span>
        <span className="muted inline-flex items-center gap-1">
          <MapPin size={12} /> {match.venue.split("·")[0]}
        </span>
      </div>
      {match.status === "completed" && match.winnerId && (
        <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[10px] font-bold">
          🏆 {data.teams.find((team) => team.id === match.winnerId)?.name} took
          the win
        </p>
      )}
      <span className="muted mt-3 flex justify-end text-[10px] font-bold">
        Match details <ArrowRight size={12} className="ml-1" />
      </span>
    </Link>
  );
}

function RegisterModal({
  tournament,
  onClose,
}: {
  tournament: Tournament;
  onClose: () => void;
}) {
  const { data, user, refreshData, showToast } = useApp();
  const [teamName, setTeamName] = useState(
    user?.department.includes("Computer")
      ? "CSE Night Owls"
      : `${user?.department ?? "Campus"} All Stars`,
  );
  const [captainName, setCaptainName] = useState(user?.name ?? "");
  const [playersText, setPlayersText] = useState(user?.name ?? "");
  const [mode, setMode] = useState<"team" | "individual">("team");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const isIndividual =
    tournament.registrationType === "Individual" ||
    (tournament.registrationType === "Both" && mode === "individual");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const currentTournament =
      data.tournaments.find((item) => item.id === tournament.id) ?? tournament;
    const registrationBlockReason = getRegistrationBlockReason(
      data,
      currentTournament,
    );
    if (registrationBlockReason) {
      setError(registrationBlockReason);
      return;
    }
    const playerNames = playersText
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);
    if (!captainName.trim() || (!isIndividual && !teamName.trim())) return;
    if (!isIndividual) {
      if (
        !playerNames.some(
          (name) => name.toLowerCase() === captainName.trim().toLowerCase(),
        )
      ) {
        setError("Include the captain in the player roster.");
        return;
      }
      if (
        new Set(playerNames.map((name) => name.toLowerCase())).size !==
        playerNames.length
      ) {
        setError("Each player can only appear once in the roster.");
        return;
      }
      if (playerNames.length !== tournament.playersPerTeam) {
        setError(
          `This event requires exactly ${tournament.playersPerTeam} players, including the captain.`,
        );
        return;
      }
    }
    try {
      await registrationService.createRegistration({
        tournamentId: tournament.id,
        type: isIndividual ? "individual" : "team",
        teamName: isIndividual ? undefined : teamName.trim(),
        playerNames: isIndividual ? [captainName.trim()] : playerNames,
        captainName: captainName.trim(),
      });
      await refreshData();
      setError("");
      setSuccess(true);
      showToast(
        isIndividual
          ? "You’re registered for the event"
          : "Registration sent to the sports committee",
      );
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };
  const listedPlayers = playersText
    .split("\n")
    .filter((line) => line.trim()).length;
  return (
    <Modal
      open
      title={
        success
          ? "You’re in the game!"
          : isIndividual
            ? "Register as a player"
            : "Register your team"
      }
      onClose={onClose}
      wide
    >
      <p className="muted mb-5 text-xs">
        {success
          ? `${isIndividual ? captainName : teamName} is now on the list for ${tournament.name}.`
          : `${tournament.name} · ${isIndividual ? "Individual entry" : `${tournament.playersPerTeam} players per team`}`}
      </p>
      {success ? (
        <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200">
              <Check size={18} />
            </span>
            <div>
              <p className="text-sm font-bold">Registration successful</p>
              <p className="mt-1 text-xs">
                {isIndividual
                  ? "Your spot is confirmed."
                  : "Your team is pending organizer approval."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-primary mt-5 !rounded-xl">
            View tournament
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {tournament.registrationType === "Both" && (
            <fieldset>
              <legend className="mb-2 text-xs font-bold">
                How would you like to play?
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(["team", "individual"] as const).map((choice) => (
                  <button
                    type="button"
                    key={choice}
                    onClick={() => {
                      setMode(choice);
                      setError("");
                    }}
                    className={`rounded-xl border p-3 text-xs font-bold capitalize ${mode === choice ? "border-[#9bc34e] bg-lime/25" : "border-[var(--line)]"}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {!isIndividual && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">Team name</span>
              <input
                className="input-field"
                required
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. CSE Night Owls"
              />
            </label>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">
                {isIndividual ? "Player name" : "Captain"}
              </span>
              <input
                className="input-field"
                required
                value={captainName}
                onChange={(event) => setCaptainName(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">
                Representing
              </span>
              <input
                className="input-field"
                value={user?.department ?? ""}
                readOnly
              />
            </label>
          </div>
          {!isIndividual && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold">
                Player roster{" "}
                <span className="muted font-normal">
                  · include the captain, one name per line
                </span>
              </span>
              <textarea
                required
                className="input-field min-h-32 resize-y"
                value={playersText}
                onChange={(event) => {
                  setPlayersText(event.target.value);
                  setError("");
                }}
                placeholder={`${tournament.playersPerTeam} names, including captain`}
              />
              <span className="muted mt-1 block text-[10px]">
                {listedPlayers} of {tournament.playersPerTeam} required players
                listed
              </span>
            </label>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button className="btn-primary">
              Submit registration <ArrowRight size={14} />
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function StudentDashboard() {
  const { data, user } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const myRegistrations = data.registrations.filter(
    (registration) => registration.studentId === user?.id,
  );
  const myTeams = getStudentTeamIds(data, user?.id ?? "");
  const upcoming = data.matches
    .filter(
      (match) =>
        match.status === "upcoming" &&
        match.date >= today &&
        (myTeams.has(match.teamAId) || myTeams.has(match.teamBId)),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || timeSort(a.time) - timeSort(b.time),
    );
  const featured = upcoming[0];
  const wins = [...myTeams].reduce(
    (total, teamId) =>
      total + (data.teams.find((team) => team.id === teamId)?.wins ?? 0),
    0,
  );
  const points = [...myTeams].reduce(
    (total, teamId) =>
      total + (data.teams.find((team) => team.id === teamId)?.points ?? 0),
    0,
  );
  const nextTournament = data.tournaments
    .filter((tournament) => tournament.status !== "completed")
    .slice(0, 3);
  const userName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[26px] bg-lime p-6 sm:p-8">
        <div className="absolute -right-16 -top-28 h-72 w-72 rounded-full border border-[#263a20]/10" />
        <div className="absolute right-8 -top-16 h-52 w-52 rounded-full border border-[#263a20]/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow !text-[#33452b]">Friday · 13 November 2026</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-.06em] text-[#1d2b20] sm:text-[42px]">
              Good morning, {userName}
            </h1>
            <p className="mt-2 text-sm text-[#364833]/75">
              Ready for your next match?
            </p>
          </div>
          <Link
            to="/app/tournaments"
            className="inline-flex items-center gap-2 rounded-full bg-[#1c342b] px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5"
          >
            Find your next game <ArrowRight size={14} />
          </Link>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered events"
          value={myRegistrations.length}
          detail="this season"
          icon={<WalletCards size={18} />}
        />
        <StatCard
          label="Upcoming matches"
          value={upcoming.length}
          detail="on your calendar"
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          label="Wins"
          value={wins}
          detail="across your teams"
          icon={<Award size={18} />}
        />
        <StatCard
          label="Points"
          value={points}
          detail="from team standings"
          icon={<Trophy size={18} />}
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Your next fixture</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                Coming up
              </h2>
            </div>
            <Link
              to="/app/matches"
              className="muted text-xs font-bold hover:text-ink"
            >
              All matches <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          </div>
          {featured ? (
            <div className="surface overflow-hidden rounded-[24px]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] bg-surface-2/60 px-5 py-3">
                <div className="flex items-center gap-2">
                  <SportIcon
                    sport={
                      data.tournaments.find(
                        (item) => item.id === featured.tournamentId,
                      )?.sport ?? "Badminton"
                    }
                    size="sm"
                  />
                  <div>
                    <p className="text-xs font-bold">
                      {
                        data.tournaments.find(
                          (item) => item.id === featured.tournamentId,
                        )?.sport
                      }{" "}
                      · {featured.round}
                    </p>
                    <p className="muted mt-0.5 text-[10px]">
                      {
                        data.tournaments.find(
                          (item) => item.id === featured.tournamentId,
                        )?.name
                      }
                    </p>
                  </div>
                </div>
                <StatusPill status={featured.status} dot />
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-6 sm:px-8">
                <div>
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black"
                    style={{
                      background: data.teams.find(
                        (item) => item.id === featured.teamAId,
                      )?.color,
                    }}
                  >
                    {
                      data.teams.find((item) => item.id === featured.teamAId)
                        ?.initials
                    }
                  </span>
                  <h3 className="mt-3 text-sm font-extrabold sm:text-base">
                    {
                      data.teams.find((item) => item.id === featured.teamAId)
                        ?.name
                    }
                  </h3>
                  <p className="muted mt-1 text-[10px]">
                    {
                      data.teams.find((item) => item.id === featured.teamAId)
                        ?.department
                    }
                  </p>
                </div>
                <span className="muted rounded-full bg-surface-2 px-3 py-2 text-[10px] font-black">
                  VS
                </span>
                <div className="text-right">
                  <span
                    className="ml-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black"
                    style={{
                      background: data.teams.find(
                        (item) => item.id === featured.teamBId,
                      )?.color,
                    }}
                  >
                    {
                      data.teams.find((item) => item.id === featured.teamBId)
                        ?.initials
                    }
                  </span>
                  <h3 className="mt-3 text-sm font-extrabold sm:text-base">
                    {
                      data.teams.find((item) => item.id === featured.teamBId)
                        ?.name
                    }
                  </h3>
                  <p className="muted mt-1 text-[10px]">
                    {
                      data.teams.find((item) => item.id === featured.teamBId)
                        ?.department
                    }
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-4 sm:px-8">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <span className="muted inline-flex items-center gap-1.5 text-[10px]">
                    <CalendarDays size={13} />{" "}
                    {dateLabel(featured.date, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="muted inline-flex items-center gap-1.5 text-[10px]">
                    <Clock3 size={13} /> {featured.time}
                  </span>
                  <span className="muted inline-flex items-center gap-1.5 text-[10px]">
                    <MapPin size={13} /> {featured.venue}
                  </span>
                </div>
                <Link
                  to={`/app/matches/${featured.id}`}
                  className="text-[10px] font-bold"
                >
                  View match <ChevronRight size={12} className="inline" />
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No fixtures yet"
              body="Your next campus game will show up here."
            />
          )}
        </div>
        <div>
          <div className="mb-4">
            <p className="eyebrow">Play next</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">
              Active tournaments
            </h2>
          </div>
          <div className="space-y-3">
            {nextTournament.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/app/tournaments/${tournament.id}`}
                className="surface card-hover flex items-center gap-3 rounded-[18px] p-3"
              >
                <SportIcon sport={tournament.sport} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-xs font-extrabold">
                      {tournament.name}
                    </h3>
                  </div>
                  <p className="muted mt-1 truncate text-[10px]">
                    {dateLabel(tournament.startDate)} · {tournament.venue}
                  </p>
                </div>
                <ChevronRight size={15} className="muted" />
              </Link>
            ))}
          </div>
          <Link
            to="/app/tournaments"
            className="btn-secondary mt-3 w-full !rounded-xl text-xs"
          >
            Explore all tournaments
          </Link>
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Keep your eyes on the board</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight">
              Recent results
            </h2>
          </div>
          <Link to="/app/results" className="muted text-xs font-bold">
            See results <ArrowRight size={13} className="ml-1 inline" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {data.matches
            .filter((match) => match.status === "completed")
            .slice(0, 2)
            .map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
        </div>
      </section>
    </div>
  );
}

export function Tournaments() {
  const { data } = useApp();
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState<string>("All sports");
  const [status, setStatus] = useState<string>("All statuses");
  const tournaments = useMemo(
    () =>
      data.tournaments.filter(
        (item) =>
          (sport === "All sports" || item.sport === sport) &&
          (status === "All statuses" || item.status === status) &&
          `${item.name} ${item.sport} ${item.venue}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [data.tournaments, sport, status, search],
  );
  return (
    <>
      <PageHeading
        eyebrow="Find your game"
        title="Discover tournaments"
        subtitle="The next big campus moment is one search away."
        action={
          <span className="rounded-full bg-lime px-3 py-2 text-[10px] font-extrabold text-ink">
            {data.tournaments.length} events this season
          </span>
        }
      />
      <div className="surface mb-6 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <label className="flex min-w-[210px] flex-1 items-center gap-2 px-2">
          <Search size={15} className="muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tournaments or venues…"
            className="w-full bg-transparent text-xs outline-none"
          />
        </label>
        <label className="flex items-center gap-2">
          <Filter size={13} className="muted" />
          <select
            aria-label="Filter by sport"
            value={sport}
            onChange={(event) => setSport(event.target.value)}
            className="input-field !w-auto !rounded-xl !py-2 text-[11px]"
          >
            {sports.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="input-field !w-auto !rounded-xl !py-2 text-[11px]"
        >
          {states.map((item) => (
            <option key={item} value={item}>
              {item === "All statuses" ? item : item.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {sports.map((item) => (
          <button
            key={item}
            onClick={() => setSport(item)}
            className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold transition ${sport === item ? "bg-[#1c342b] text-white" : "surface-flat muted hover:text-ink"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tournaments.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((item) => (
            <TournamentCard key={item.id} tournament={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tournaments match that filter"
          body="Try another sport or status, or clear your search."
          action={
            <button
              onClick={() => {
                setSport("All sports");
                setStatus("All statuses");
                setSearch("");
              }}
              className="btn-secondary"
            >
              Clear filters
            </button>
          }
        />
      )}
    </>
  );
}

export function TournamentDetails() {
  const { id = "" } = useParams();
  const { data, showToast } = useApp();
  const tournament = data.tournaments.find((item) => item.id === id);
  const [tab, setTab] = useState("Overview");
  const [register, setRegister] = useState(false);
  const [fixtureFilter, setFixtureFilter] = useState("All");
  if (!tournament)
    return (
      <EmptyState
        title="Tournament not found"
        body="It may have been removed from the schedule."
        action={
          <Link className="btn-secondary" to="/app/tournaments">
            Browse tournaments
          </Link>
        }
      />
    );
  const teams = data.teams.filter(
    (team) => team.tournamentId === tournament.id,
  );
  const fixtures = data.matches.filter(
    (match) => match.tournamentId === tournament.id,
  );
  const visibleFixtures = fixtures.filter(
    (match) =>
      fixtureFilter === "All" || match.status === fixtureFilter.toLowerCase(),
  );
  const myRegistration = data.registrations.find(
    (registration) =>
      registration.tournamentId === tournament.id &&
      registration.studentId === data.session?.userId,
  );
  const registrationBlockReason = getRegistrationBlockReason(data, tournament);
  const registerLabel = !registrationBlockReason
    ? "Register now"
    : registrationBlockReason.includes("completed")
      ? "Event completed"
      : registrationBlockReason.includes("deadline")
        ? "Registration closed"
        : registrationBlockReason.includes("entry limit")
          ? "Entry limit reached"
          : "Registration not open";
  const tabs = ["Overview", "Teams", "Fixtures", "Results", "Leaderboard"];
  return (
    <>
      <div
        className={`sport-art ${tournament.imageTone} overflow-hidden rounded-[26px] p-5 sm:p-8`}
      >
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <SportIcon sport={tournament.sport} />
              <StatusPill status={tournament.status} />
            </div>
            <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.18em] opacity-60">
              {tournament.sport} · {tournament.format}
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-[-.05em] sm:text-4xl">
              {tournament.name}
            </h1>
            <p className="mt-3 max-w-xl text-xs leading-relaxed opacity-75">
              {tournament.description}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast("Tournament link copied");
            }}
            className="rounded-full border border-current/20 bg-white/20 p-2.5"
            aria-label="Share tournament"
          >
            <Share2 size={16} />
          </button>
        </div>
        <div className="relative z-10 mt-7 grid gap-3 sm:grid-cols-4">
          {[
            [
              CalendarDays,
              "Dates",
              `${dateLabel(tournament.startDate)} — ${dateLabel(tournament.endDate)}`,
            ],
            [MapPin, "Venue", tournament.venue],
            [Users, "Teams", `${teams.length} / ${tournament.maxTeams}`],
            [ShieldCheck, "Organizer", tournament.organizer],
          ].map(([Icon, label, value]) => {
            const Glyph = Icon as typeof CalendarDays;
            return (
              <div
                key={String(label)}
                className="rounded-2xl border border-current/10 bg-white/30 p-3"
              >
                <Glyph size={15} />
                <p className="mt-2 text-[9px] font-bold uppercase tracking-widest opacity-60">
                  {String(label)}
                </p>
                <p className="mt-1 text-xs font-extrabold">{String(value)}</p>
              </div>
            );
          })}
        </div>
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
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {tab === "Overview" && (
            <div className="space-y-5">
              <section className="surface rounded-[22px] p-5">
                <p className="eyebrow">About the tournament</p>
                <p className="mt-3 text-sm leading-relaxed">
                  {tournament.description} Every match is a chance to put your
                  class on the campus map.
                </p>
                <h3 className="mt-5 text-sm font-extrabold">Rules of play</h3>
                <ul className="mt-3 space-y-2">
                  {tournament.rules.map((rule) => (
                    <li
                      key={rule}
                      className="muted flex items-start gap-2 text-xs"
                    >
                      <Check size={14} className="mt-0.5 text-emerald-600" />{" "}
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="surface rounded-[22px] p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold">Key dates</h3>
                  <CalendarDays size={16} className="muted" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-surface-2 p-3">
                    <p className="eyebrow">Registration closes</p>
                    <p className="mt-2 text-sm font-extrabold">
                      {dateLabel(tournament.registrationDeadline, {
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <p className="eyebrow">First whistle</p>
                    <p className="mt-2 text-sm font-extrabold">
                      {dateLabel(tournament.startDate, {
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-3">
                    <p className="eyebrow">Final day</p>
                    <p className="mt-2 text-sm font-extrabold">
                      {dateLabel(tournament.endDate, {
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
          {tab === "Teams" && (
            <div className="surface overflow-hidden rounded-[22px]">
              <div className="border-b border-[var(--line)] p-4">
                <h3 className="text-sm font-extrabold">
                  Registered teams{" "}
                  <span className="muted font-normal">· {teams.length}</span>
                </h3>
              </div>
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3 last:border-0"
                >
                  <Avatar name={team.name} color={team.color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{team.name}</p>
                    <p className="muted mt-0.5 text-[10px]">
                      {team.department}
                    </p>
                  </div>
                  <span className="muted text-[10px]">
                    {team.playerIds.length} players
                  </span>
                </div>
              ))}
            </div>
          )}
          {tab === "Fixtures" && (
            <>
              <div className="mb-3 flex justify-end">
                <select
                  aria-label="Filter tournament fixtures"
                  value={fixtureFilter}
                  onChange={(event) => setFixtureFilter(event.target.value)}
                  className="input-field !w-auto !rounded-xl !py-2 text-xs"
                >
                  {["All", "Upcoming", "Live", "Completed"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {visibleFixtures.length ? (
                  visibleFixtures.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                ) : (
                  <EmptyState
                    title={
                      fixtureFilter === "All"
                        ? "Fixtures are coming"
                        : `No ${fixtureFilter.toLowerCase()} fixtures`
                    }
                    body="The organizer will publish the schedule soon."
                  />
                )}
              </div>
            </>
          )}
          {tab === "Results" && (
            <div className="grid gap-3 md:grid-cols-2">
              {fixtures
                .filter((match) => match.status === "completed")
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              {!fixtures.some((match) => match.status === "completed") && (
                <EmptyState
                  title="No results posted yet"
                  body="Check in after the first whistle."
                />
              )}
            </div>
          )}
          {tab === "Leaderboard" &&
            (teams.length ? (
              <LeaderboardTable teams={teams} />
            ) : (
              <EmptyState
                title="Standings are coming"
                body="Team standings appear when registrations are added."
              />
            ))}
        </div>
        <aside className="space-y-3">
          <div className="surface rounded-[22px] p-5">
            <p className="eyebrow">Join the lineup</p>
            <p className="mt-2 text-xl font-extrabold">Ready to play?</p>
            <p className="muted mt-2 text-xs leading-relaxed">
              {tournament.registrationType === "Individual"
                ? "Register your name and we’ll add you to the roster."
                : `Bring ${tournament.playersPerTeam} players and rep your class.`}
            </p>
            {myRegistration ? (
              <div className="mt-4 rounded-xl bg-surface-2 p-3">
                <p className="text-xs font-bold">You’re registered</p>
                <div className="mt-2">
                  <StatusPill status={myRegistration.status} />
                </div>
              </div>
            ) : data.session?.role === "organizer" ? (
              <div className="mt-4 rounded-xl bg-surface-2 p-3 text-center">
                <p className="text-xs font-semibold muted">
                  Organizers cannot register teams.
                </p>
                <Link
                  to={`/organizer/manage/${tournament.id}`}
                  className="btn-secondary mt-3 inline-flex w-full justify-center !rounded-xl text-xs"
                >
                  Manage this tournament
                </Link>
              </div>
            ) : (
              <>
                <button
                  disabled={Boolean(registrationBlockReason)}
                  onClick={() => setRegister(true)}
                  className="btn-primary mt-4 w-full !rounded-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {registerLabel} <ArrowRight size={14} />
                </button>
                {registrationBlockReason && (
                  <p className="muted mt-2 text-center text-[10px]">
                    {registrationBlockReason}
                  </p>
                )}
              </>
            )}
            <p className="muted mt-3 text-center text-[9px]">
              Registration closes {dateLabel(tournament.registrationDeadline)}
            </p>
          </div>
          <div className="surface rounded-[22px] p-5">
            <p className="eyebrow">Event coordinator</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name="Sports Committee" color="#d5f28d" />
              <div>
                <p className="text-xs font-bold">{tournament.organizer}</p>
                <p className="muted mt-1 text-[10px]">Here to help you play</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      {register && (
        <RegisterModal
          tournament={tournament}
          onClose={() => setRegister(false)}
        />
      )}
    </>
  );
}

function LeaderboardTable({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort(
    (a, b) => b.points - a.points || b.wins - a.wins,
  );
  return (
    <div className="surface overflow-hidden rounded-[22px]">
      <div className="border-b border-[var(--line)] p-4">
        <h3 className="text-sm font-extrabold">Season standings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="bg-surface-2 text-[9px] uppercase tracking-widest muted">
            <tr>
              {["Rank", "Team", "Played", "Won", "Lost", "Points"].map(
                (item) => (
                  <th key={item} className="px-4 py-3 font-bold">
                    {item}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, i) => (
              <tr key={team.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3 font-extrabold">
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : `0${i + 1}`}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-bold">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-extrabold"
                      style={{ background: team.color }}
                    >
                      {team.initials}
                    </span>
                    {team.name}
                  </span>
                </td>
                <td className="px-4 py-3">{team.played}</td>
                <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300">
                  {team.wins}
                </td>
                <td className="px-4 py-3">{team.losses}</td>
                <td className="px-4 py-3 font-black">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MyRegistrations() {
  const { data, user } = useApp();
  const registrations = data.registrations.filter(
    (registration) => registration.studentId === user?.id,
  );
  return (
    <>
      <PageHeading
        eyebrow="Your season"
        title="My registrations"
        subtitle="Every tournament you’ve signed up for, all in one place."
      />
      <div className="space-y-3">
        {registrations.map((registration) => {
          const tournament = data.tournaments.find(
            (item) => item.id === registration.tournamentId,
          );
          const team = data.teams.find(
            (item) => item.id === registration.teamId,
          );
          if (!tournament) return null;
          return (
            <div
              key={registration.id}
              className="surface flex flex-wrap items-center gap-4 rounded-[20px] p-4 sm:p-5"
            >
              <SportIcon sport={tournament.sport} />
              <div className="min-w-[150px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold">{tournament.name}</h3>
                  <StatusPill status={registration.status} />
                </div>
                <p className="muted mt-1 text-xs">
                  {registration.type === "team"
                    ? `Team: ${team?.name ?? "Roster submitted"}`
                    : "Individual participant"}{" "}
                  · {dateLabel(tournament.startDate)}
                </p>
              </div>
              <Link
                to={`/app/tournaments/${tournament.id}`}
                className="btn-secondary !rounded-xl !px-3 !py-2 text-[10px]"
              >
                View event <ChevronRight size={13} />
              </Link>
            </div>
          );
        })}
        {!registrations.length && (
          <EmptyState
            title="You haven’t signed up yet"
            body="Find an event and put your name on the team sheet."
            action={
              <Link to="/app/tournaments" className="btn-primary">
                Discover tournaments
              </Link>
            }
          />
        )}
      </div>
    </>
  );
}

export function MyMatches() {
  const { data, user } = useApp();
  const [filter, setFilter] = useState("All");
  const teamIds = getStudentTeamIds(data, user?.id ?? "");
  const relevant = data.matches
    .filter(
      (match) =>
        (filter === "All" || match.status === filter.toLowerCase()) &&
        (teamIds.has(match.teamAId) || teamIds.has(match.teamBId)),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || timeSort(a.time) - timeSort(b.time),
    );
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  today.setDate(today.getDate() + 1);
  const tomorrowKey = today.toISOString().slice(0, 10);
  const grouped = relevant.reduce<Record<string, Match[]>>((groups, match) => {
    const key =
      match.date === todayKey
        ? "Today"
        : match.date === tomorrowKey
          ? "Tomorrow"
          : dateLabel(match.date, {
              weekday: "long",
              month: "long",
              day: "numeric",
            });
    (groups[key] ??= []).push(match);
    return groups;
  }, {});
  return (
    <>
      <PageHeading
        eyebrow="Your calendar"
        title="My matches"
        subtitle="The fixtures that matter to your team, organized by day."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter my matches"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="input-field !w-auto !rounded-xl !py-2 text-xs"
            >
              {["All", "Upcoming", "Live", "Completed"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <Link to="/app/tournaments" className="btn-secondary text-xs">
              Find another game
            </Link>
          </div>
        }
      />
      {Object.keys(grouped).length ? (
        <div className="space-y-7">
          {Object.entries(grouped).map(([day, matches]) => (
            <section key={day}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-extrabold">{day}</h2>
                <span className="h-px flex-1 bg-[var(--line)]" />
                <span className="muted text-[10px]">
                  {matches.length} fixture{matches.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            filter === "All"
              ? "No matches on your calendar"
              : `No ${filter.toLowerCase()} matches`
          }
          body="When your team gets a fixture, you’ll find it here."
        />
      )}
    </>
  );
}

export function Results() {
  const { data } = useApp();
  const [sport, setSport] = useState("All sports");
  const results = data.matches.filter(
    (match) =>
      match.status === "completed" &&
      (sport === "All sports" ||
        data.tournaments.find((item) => item.id === match.tournamentId)
          ?.sport === sport),
  );
  return (
    <>
      <PageHeading
        eyebrow="Final whistle"
        title="Results & scorecards"
        subtitle="Catch up on the matches that made campus history."
        action={<Trophy className="text-[#90a93e]" />}
      />
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {sports.map((item) => (
          <button
            key={item}
            onClick={() => setSport(item)}
            className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-bold ${sport === item ? "bg-[#1c342b] text-white" : "surface-flat muted"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {results.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No scorecards for that sport"
          body="Choose a different sport to see more results."
        />
      )}
    </>
  );
}

export function Leaderboard() {
  const { data } = useApp();
  const topTeams = [...data.teams].sort(
    (a, b) => b.points - a.points || b.wins - a.wins,
  );
  return (
    <>
      <PageHeading
        eyebrow="Season standings"
        title="Leaderboard"
        subtitle="A little friendly competition looks good on everyone."
        action={
          <span className="rounded-full bg-surface-2 px-3 py-2 text-[10px] font-bold">
            Season 2026
          </span>
        }
      />
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {topTeams.slice(0, 3).map((team, i) => (
          <div
            key={team.id}
            className={`surface relative overflow-hidden rounded-[22px] p-5`}
          >
            <span className="absolute right-4 top-3 text-3xl">
              {["🥇", "🥈", "🥉"][i]}
            </span>
            <p className="eyebrow">
              {["1st place", "2nd place", "3rd place"][i]}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Avatar
                name={team.name}
                color={team.color}
                size="md"
              />
              <div>
                <h2 className="text-base font-extrabold">{team.name}</h2>
                <p className="muted mt-1 text-[10px]">{team.department}</p>
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <p className="text-3xl font-black">
                {team.points}
                <span className="muted ml-1 text-xs font-bold">pts</span>
              </p>
              <p className="muted text-[10px]">
                {team.wins} wins · {team.played} played
              </p>
            </div>
          </div>
        ))}
      </div>
      <LeaderboardTable teams={topTeams} />
    </>
  );
}

export function Profile() {
  const { data, user, signOut, resetDemoData, updateData, showToast } =
    useApp();
  const myRegistrations = data.registrations.filter(
    (item) => item.studentId === user?.id,
  );
  const studentTeamIds = getStudentTeamIds(data, user?.id ?? "");
  const teams = data.teams.filter((team) => studentTeamIds.has(team.id));
  const careerWins = teams.reduce((total, team) => total + team.wins, 0);
  const seasonPoints = teams.reduce((total, team) => total + team.points, 0);
  const playerSports = Array.from(
    new Set(
      [
        ...myRegistrations.map(
          (registration) =>
            data.tournaments.find(
              (tournament) => tournament.id === registration.tournamentId,
            )?.sport,
        ),
        ...teams.map(
          (team) =>
            data.tournaments.find(
              (tournament) => tournament.id === team.tournamentId,
            )?.sport,
        ),
      ].filter((sport): sport is Sport => Boolean(sport)),
    ),
  );
  return (
    <>
      <PageHeading
        eyebrow="Your player card"
        title="Profile"
        subtitle="The stats, sports and teams that make you a CampusPlay player."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Reset this browser’s CampusPlay data to the original demo sample?",
                  )
                ) {
                  resetDemoData();
                  window.location.href = "/";
                }
              }}
              className="btn-secondary text-xs"
            >
              Reset demo data
            </button>
            <button
              onClick={() => {
                signOut();
                window.location.href = "/";
              }}
              className="btn-secondary text-xs"
            >
              Sign out
            </button>
          </div>
        }
      />
      <section className="surface overflow-hidden rounded-[26px]">
        <div className="flex min-h-[156px] flex-wrap items-end justify-between gap-4 bg-lime px-5 pb-5 pt-6 sm:px-7 sm:pb-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={user?.name ?? "Campus player"}
              color="#fff"
              size="lg"
            />
            <div>
              <h2 className="text-xl font-extrabold text-[#1d2b20]">
                {user?.name}
              </h2>
              <p className="mt-1 text-xs text-[#33452b]">
                {user?.department} · {user?.year} · Section {user?.section}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-white/60 px-3 py-2 text-[10px] font-bold text-[#1d2b20]">
            ID · {user?.collegeId}
          </span>
        </div>
        <div className="px-5 pb-6 pt-5 sm:px-7">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="eyebrow">Tournaments</p>
              <p className="mt-2 text-2xl font-black">
                {myRegistrations.length}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="eyebrow">Career wins</p>
              <p className="mt-2 text-2xl font-black">{careerWins}</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="eyebrow">Season points</p>
              <p className="mt-2 text-2xl font-black">{seasonPoints}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Your sports</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {playerSports.length ? (
                  playerSports.map((sport) => (
                    <span
                      key={sport}
                      className="rounded-full border border-[var(--line)] px-3 py-2 text-[10px] font-semibold"
                    >
                      {sport}
                    </span>
                  ))
                ) : (
                  <span className="muted text-xs">
                    Join a tournament to build your sports profile.
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                updateData((current) => ({
                  ...current,
                  theme: current.theme === "light" ? "dark" : "light",
                }));
                showToast("Display preference saved");
              }}
              className="btn-secondary text-xs"
            >
              <Sparkles size={14} /> Personalize
            </button>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-extrabold">Your teams</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="surface flex items-center gap-3 rounded-[18px] p-4"
            >
              <Avatar name={team.name} color={team.color} />
              <div>
                <p className="text-xs font-extrabold">{team.name}</p>
                <p className="muted mt-1 text-[10px]">
                  {team.wins} wins · {team.points} points
                </p>
              </div>
              <Medal size={18} className="muted ml-auto" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
