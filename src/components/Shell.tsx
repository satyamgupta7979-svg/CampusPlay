import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  ArrowRightLeft,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  Command,
  Compass,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  Trophy,
  TrophyIcon,
  Users,
  X,
} from "lucide-react";
import { useApp } from "../app/AppContext";
import { Avatar, SportIcon } from "./UI";
import type { Tournament, Team, Match, Notice } from "../types";
import { getStudentTeamIds } from "../services/domain";
import { notificationService } from "../services/notificationService";

const studentLinks = [
  { label: "Overview", to: "/app", icon: LayoutDashboard, exact: true },
  { label: "Discover", to: "/app/tournaments", icon: Compass },
  { label: "My registrations", to: "/app/registrations", icon: Users },
  { label: "My matches", to: "/app/matches", icon: CalendarDays },
  { label: "Results", to: "/app/results", icon: Activity },
  { label: "Leaderboard", to: "/app/leaderboard", icon: Trophy },
];
const organizerLinks = [
  { label: "Overview", to: "/organizer", icon: LayoutDashboard, exact: true },
  { label: "Tournaments", to: "/app/tournaments", icon: Compass },
  { label: "Registrations", to: "/organizer/registrations", icon: Users },
  { label: "Fixtures", to: "/organizer/fixtures", icon: CalendarDays },
  { label: "Results", to: "/organizer/results", icon: Trophy },
  { label: "Analytics", to: "/organizer/analytics", icon: Activity },
];

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 ${inverse ? "text-white" : ""}`}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#a1cd4e] text-[13px] font-black tracking-[-.12em] text-[#1c342b]">
        <TrophyIcon size={20}/>
      </span>
      <span className="text-[24px] font-extrabold tracking-[-.055em]">
        Campus<span className="font-medium">Play</span>
      </span>
    </Link>
  );
}

function Sidebar() {
  const { data, role, user, signOut } = useApp();
  const pendingApprovals = data.registrations.filter(
    (registration) => registration.status === "pending",
  ).length;
  const links = role === "organizer" ? organizerLinks : studentLinks;
  const active = role === "organizer" ? "/organizer" : "/app";
  const navigate = useNavigate();
  return (
    <aside className="app-sidebar sticky top-0 flex h-screen flex-col px-4 py-5">
      <div className="px-2">
        <Brand />
      </div>
      <div className="mt-9 rounded-2xl bg-surface-2 p-3">
        <div className="flex items-center gap-2.5">
          <Avatar
            name={user?.name ?? "Guest"}
            color={user?.avatarColor}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">
              {user?.name ?? "Campus guest"}
            </p>
            <p className="muted mt-0.5 text-[10px]">
              {role === "organizer"
                ? "Sports coordinator"
                : `${user?.department ?? "Campus"} · ${user?.year ?? "Student"}`}
            </p>
          </div>
          <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>
      <p className="eyebrow mb-2 mt-8 px-3">Workspace</p>
      <nav aria-label="Main navigation" className="space-y-1">
        {links.map(({ label, to, icon: Icon, exact }) => (
          <NavLink
            key={label}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${isActive ? "bg-surface-2 text-ink" : "muted hover:bg-surface-2 hover:text-ink"}`
            }
          >
            <Icon size={17} strokeWidth={1.9} />
            <span>{label}</span>
            {label === "Registrations" && role === "organizer" && (
              <span className="ml-auto rounded-full bg-lime px-2 py-0.5 text-[10px] font-extrabold text-ink">
                {pendingApprovals}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      {role === "organizer" && (
        <Link
          to="/organizer/create"
          className="btn-primary mt-5 w-full !rounded-xl !py-3 text-sm"
        >
          <Plus size={16} /> Create tournament
        </Link>
      )}
      <div className="mt-auto rounded-[20px] bg-[#1c342b] p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime text-[#1c342b]">
            <Crown size={15} />
          </span>
          <span className="text-xs font-bold">CampusAI</span>
          <span className="ml-auto rounded-full bg-white/15 px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
            Beta
          </span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/70">
          Your campus sports sidekick, ready when you are.
        </p>
        <button
          onClick={() => window.dispatchEvent(new Event("open-campus-ai"))}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-lime"
        >
          Ask a question <ArrowRightLeft size={13} />
        </button>
      </div>
      <button
        onClick={() => {
          signOut();
          navigate("/");
        }}
        className="muted mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold hover:bg-surface-2 hover:text-ink"
      >
        <LogOut size={16} /> Sign out
      </button>
    </aside>
  );
}

function SearchBox({ mobile = false }: { mobile?: boolean }) {
  const { data } = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const term = query.toLowerCase();
    return [
      ...data.tournaments
        .filter(
          (item) =>
            item.name.toLowerCase().includes(term) ||
            item.sport.toLowerCase().includes(term) ||
            item.venue.toLowerCase().includes(term),
        )
        .slice(0, 4)
        .map((item: Tournament) => ({
          label: item.name,
          sub: `${item.sport} · tournament`,
          to: `/app/tournaments/${item.id}`,
          icon: "🏆",
        })),
      ...data.teams
        .filter((item) => item.name.toLowerCase().includes(term))
        .slice(0, 2)
        .map((item: Team) => ({
          label: item.name,
          sub: `${item.department} · team`,
          to: "/app/leaderboard",
          icon: "👥",
        })),
      ...data.matches
        .filter((item) =>
          `${data.teams.find((team) => team.id === item.teamAId)?.name} ${data.teams.find((team) => team.id === item.teamBId)?.name} ${item.venue}`
            .toLowerCase()
            .includes(term),
        )
        .slice(0, 2)
        .map((item: Match) => ({
          label: `${data.teams.find((team) => team.id === item.teamAId)?.name} vs ${data.teams.find((team) => team.id === item.teamBId)?.name}`,
          sub: `${item.date} · match`,
          to: "/app/matches",
          icon: "📅",
        })),
      ...data.users
        .filter((item) => item.name.toLowerCase().includes(term))
        .slice(0, 2)
        .map((item) => ({
          label: item.name,
          sub: `${item.department} · player`,
          to: "/app/profile",
          icon: "🙂",
        })),
    ].slice(0, 6);
  }, [data, query]);
  return (
    <div
      className={`relative w-full ${mobile ? "max-w-none" : "hidden max-w-[430px] md:block"}`}
    >
      <div className="surface-flat flex h-10 items-center gap-2 rounded-full px-3">
        <Search size={15} className="muted" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Search tournaments, teams, matches…"
          className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          aria-label="Global search"
        />
        <span className="muted flex items-center gap-1 rounded-md border border-[var(--line)] px-1.5 py-0.5 text-[9px]">
          <Command size={10} /> K
        </span>
      </div>
      {open && query.length > 0 && (
        <div className="surface absolute left-0 right-0 top-12 z-[80] overflow-hidden rounded-2xl p-2">
          {results.length ? (
            results.map((item, index) => (
              <Link
                key={`${item.label}-${index}`}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                to={item.to}
                className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-surface-2"
              >
                <span>{item.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold">
                    {item.label}
                  </span>
                  <span className="muted mt-0.5 block text-[10px]">
                    {item.sub}
                  </span>
                </span>
              </Link>
            ))
          ) : (
            <p className="muted px-3 py-4 text-xs">
              No matches yet. Try a sport, team or venue.
            </p>
          )}
        </div>
      )}
      {open && (
        <button
          aria-label="Close search suggestions"
          className="fixed inset-0 z-[70] cursor-default"
          onClick={() => setOpen(false)}
        />
      )}
      {location.pathname === "/login" && null}
    </div>
  );
}

function Topbar() {
  const { user, role, toggleTheme, data, refreshData, showToast } = useApp();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const currentUserId = user?.id ?? "";
  const isReadForCurrentUser = (notice: Notice) =>
    Boolean(currentUserId && notice.readByUserIds?.includes(currentUserId));
  const visibleNotices = data.notifications.filter(
    (notice) =>
      !notice.targetUserIds || notice.targetUserIds.includes(currentUserId),
  );
  const unread = visibleNotices.filter(
    (notice) => !isReadForCurrentUser(notice),
  ).length;
  const navigate = useNavigate();
  const markAll = async () => {
    try {
      await notificationService.markAllAsRead();
      await refreshData();
      showToast("All notifications marked as read");
    } catch {
      // Ignore
    }
  };
  const switchRole = async () => {
    const next = role === "student" ? "organizer" : "student";
    // MFA is required — redirect to login page instead of bypassing auth
    navigate("/login");
    showToast(`Please log in as ${next} to switch roles`);
    setProfileOpen(false);
  };
  return (
    <header className="app-topbar sticky top-0 z-40 flex items-center gap-4 px-4 sm:px-7">
      <button
        onClick={() => setMobileSearch((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 md:hidden"
        aria-label="Toggle search"
      >
        <Search size={17} />
      </button>
      <SearchBox />
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle light or dark theme"
          title="Switch theme"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2"
        >
          {data.theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ed6958] px-1 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                aria-label="Close notifications"
                onClick={() => setNotificationsOpen(false)}
              />
              <div className="surface absolute right-0 top-12 z-50 w-[min(350px,calc(100vw-28px))] rounded-[22px] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold">Notifications</h3>
                    <p className="muted mt-1 text-[10px]">
                      The latest from your campus
                    </p>
                  </div>
                  <button
                    onClick={markAll}
                    className="text-[10px] font-bold text-emerald-700 dark:text-lime"
                  >
                    Mark all read
                  </button>
                </div>
                {visibleNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`flex gap-3 border-t border-[var(--line)] py-3 ${isReadForCurrentUser(notice) ? "opacity-60" : ""}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                      {notice.kind === "match"
                        ? "🏸"
                        : notice.kind === "registration"
                          ? "👥"
                          : notice.kind === "venue"
                            ? "📍"
                            : "🏏"}
                    </span>
                    <div>
                      <p className="text-xs font-bold">{notice.title}</p>
                      <p className="muted mt-1 text-[10px] leading-relaxed">
                        {notice.body}
                      </p>
                      <p className="muted mt-1 text-[9px]">{notice.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-2"
          >
            <Avatar
              name={user?.name ?? "Guest"}
              color={user?.avatarColor}
              size="sm"
            />
            <span className="hidden text-left sm:block">
              <span className="block max-w-24 truncate text-[11px] font-bold">
                {user?.name}
              </span>
              <span className="muted block text-[9px] capitalize">
                {role} account
              </span>
            </span>
            <ChevronDown size={13} className="muted hidden sm:block" />
          </button>
          {profileOpen && (
            <div className="surface absolute right-0 top-12 z-50 w-52 rounded-2xl p-2">
              <Link
                to="/app/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold hover:bg-surface-2"
              >
                <CircleUserRound size={16} /> My profile
              </Link>
              <button
                onClick={switchRole}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-surface-2"
              >
                <ArrowRightLeft size={16} /> Switch demo role
              </button>
              <button
                onClick={() => {
                  markAll();
                  showToast("Notifications marked read");
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-surface-2"
              >
                <ShieldCheck size={16} /> Mark notices read
              </button>
            </div>
          )}
        </div>
      </div>
      {mobileSearch && (
        <div className="absolute left-0 right-0 top-full border-b border-[var(--line)] bg-paper px-4 py-3 md:hidden">
          <SearchBox mobile />
        </div>
      )}
    </header>
  );
}

function MobileNav() {
  const { role } = useApp();
  const links =
    role === "organizer"
      ? [
          { to: "/organizer", label: "Home", icon: LayoutDashboard },
          { to: "/organizer/registrations", label: "Teams", icon: Users },
          { to: "/organizer/fixtures", label: "Fixtures", icon: CalendarDays },
          { to: "/organizer/results", label: "Results", icon: Trophy },
        ]
      : [
          { to: "/app", label: "Home", icon: LayoutDashboard },
          { to: "/app/tournaments", label: "Explore", icon: Compass },
          { to: "/app/matches", label: "Matches", icon: CalendarDays },
          { to: "/app/results", label: "Results", icon: Trophy },
          { to: "/app/profile", label: "Profile", icon: CircleUserRound },
        ];
  return (
    <nav
      className="mobile-bottom-nav fixed z-50 flex items-center justify-around rounded-2xl px-1 py-2 md:hidden"
      aria-label="Mobile navigation"
    >
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/app" || to === "/organizer"}
          className={({ isActive }) =>
            `flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1 ${isActive ? "text-ink" : "muted"}`
          }
        >
          <Icon size={18} />
          <span className="text-[9px] font-bold">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function CampusAI() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ from: "ai" | "you"; text: string }>
  >([]);
  const { data, user } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    const openPanel = () => setOpen(true);
    window.addEventListener("open-campus-ai", openPanel);
    return () => window.removeEventListener("open-campus-ai", openPanel);
  }, []);
  const ask = (text: string) => {
    const lower = text.toLowerCase();
    let answer =
      "I can help you find a tournament, team or venue. Try asking about your next match or today’s schedule.";
    if (lower.includes("next match")) {
      const myTeamIds = getStudentTeamIds(data, user?.id ?? "");
      const next = data.matches
        .filter(
          (match) =>
            match.status === "upcoming" &&
            (myTeamIds.has(match.teamAId) || myTeamIds.has(match.teamBId)),
        )
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      answer = next
        ? `Your next match is ${data.teams.find((team) => team.id === next.teamAId)?.name} vs ${data.teams.find((team) => team.id === next.teamBId)?.name} on ${new Date(`${next.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at ${next.time} · ${next.venue}.`
        : "No upcoming matches yet. Check back soon!";
    } else if (lower.includes("today")) {
      const today = data.matches.filter(
        (match) => match.date === new Date().toISOString().slice(0, 10),
      );
      answer = today.length
        ? `${today.length} fixture${today.length > 1 ? "s" : ""} are scheduled today. Open My Matches to see the schedule.`
        : "No matches on today’s schedule. There are fixtures coming up tomorrow—check My Matches.";
    } else if (lower.includes("won") || lower.includes("semifinal")) {
      const semi = data.matches.find(
        (match) =>
          match.round.toLowerCase().includes("semi") &&
          match.status === "completed" &&
          data.tournaments.find(
            (tournament) => tournament.id === match.tournamentId,
          )?.sport === "Cricket",
      );
      answer = semi
        ? `${data.teams.find((team) => team.id === semi.winnerId)?.name ?? "The winning side"} won the semifinal ${semi.scoreA}–${semi.scoreB}.`
        : "The cricket semifinal is underway—follow the live score in Fixtures.";
    } else if (lower.includes("tournament") || lower.includes("register")) {
      answer =
        "Registration is open for Inter-Class Cricket, Campus Football League, and the Campus Athletics Meet. Let’s find your next team.";
      navigate("/app/tournaments");
    }
    setMessages((current) => [
      ...current,
      { from: "you", text },
      { from: "ai", text: answer },
    ]);
    setQuestion("");
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full bg-[#1c342b] px-4 py-3 text-xs font-bold text-white shadow-xl transition hover:-translate-y-1 md:bottom-6 md:right-7"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lime text-[#1c342b]">
          ✦
        </span>
        <span>CampusAI</span>
      </button>
      {open && (
        <div className="surface fade-up fixed bottom-24 right-4 z-[85] flex h-[min(570px,calc(100vh-135px))] w-[min(370px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] shadow-2xl md:bottom-24 md:right-7">
          <div className="flex items-center gap-3 bg-[#1c342b] p-4 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime text-[#1c342b]">
              ✦
            </span>
            <div>
              <h2 className="text-sm font-extrabold">CampusAI</h2>
              <p className="mt-0.5 text-[10px] text-white/65">
                Your campus sports sidekick
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
              aria-label="Close CampusAI"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-surface-2 p-3 text-xs leading-relaxed">
              👋 Hi {user?.name.split(" ")[0] ?? "there"}! How can I help you
              get in the game?
            </div>
            {messages.map((message, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${message.from === "you" ? "ml-auto rounded-tr-md bg-[#1c342b] text-white" : "rounded-tl-md bg-surface-2"}`}
              >
                {message.text}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="space-y-2 pt-1">
                {[
                  "What is my next match?",
                  "Show today’s matches",
                  "Who won the cricket semifinal?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => ask(suggestion)}
                    className="block w-full rounded-xl border border-[var(--line)] px-3 py-2.5 text-left text-[11px] font-semibold hover:bg-surface-2"
                  >
                    {suggestion}
                    <span className="muted float-right">↗</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (question.trim()) ask(question.trim());
            }}
            className="flex gap-2 border-t border-[var(--line)] p-3"
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="input-field !rounded-full !py-2.5 text-xs"
              placeholder="Ask CampusAI…"
              aria-label="Ask CampusAI"
            />
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime text-ink"
              aria-label="Send message"
            >
              <ArrowRightLeft size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export function AppShell() {
  const { toast, clearToast } = useApp();
  const location = useLocation();
  const paths = [...studentLinks, ...organizerLinks];
  const activeTitle = location.pathname.includes("/manage/")
    ? "Manage tournament"
    : paths.find((link) => link.to === location.pathname)?.label;
  return (
    <div className="app-shell flex">
      <Sidebar />
      <div className="app-main min-h-screen">
        <Topbar />
        <main className="content-wrap fade-up" key={location.pathname}>
          <div className="mb-4 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#a1aaa2] md:flex">
            <span>CampusPlay</span>
            <span>·</span>
            <span>{activeTitle ?? "Workspace"}</span>
          </div>
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <CampusAI />
      {toast && (
        <div
          role="status"
          className="surface fixed bottom-20 left-1/2 z-[100] -translate-x-1/2 rounded-full px-5 py-3 text-xs font-semibold shadow-xl md:bottom-8"
        >
          {toast}
          <button
            className="ml-4 muted"
            onClick={clearToast}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
