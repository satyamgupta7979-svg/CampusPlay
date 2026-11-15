import {
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Check,
  CirclePlay,
  MapPin,
  MoveUpRight,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Shell";
import { useApp } from "../app/AppContext";

export function Landing() {
  const navigate = useNavigate();
  const { signInDemo: _signInDemo } = useApp();
  const tryDemo = () => {
    // Navigate to login where demo credentials can be used through the full MFA flow
    navigate("/login");
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-cover bg-center"
    style={{backgroundImage : "url('/login image.png')"}}>
      <div className="absolute inset-0 bg-black/50" />
      <header className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-10 mt-3">
        <Brand />
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="btn-secondary hidden rounded-full px-6 py-2.5 text-md font-bold sm:inline-flex bg-[#ffff]/80 "
          >
            Log in
          </Link>
          <Link to="/register" className="btn-primary !px-4 !py-2.5 text-md bg-[#85b62b]">
            Create an Account <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-[1400px] items-center gap-10 px-5 pb-20 pt-10 sm:px-10 md:mt-[45px]">
          <div className="absolute -left-36 top-20 h-80 w-80 rounded-full bg-lime/25 blur-[100px]" />
          <div className="relative z-10 max-w-[650px]">
            <h1 className="text-[clamp(3.2rem,7vw,5.2rem)] font-black leading-[.91] tracking-[-.075em]">
              One Campus.
              <br />
              <span className="inline-block text-[#85b62b]">Every Game.</span>
              <br />
              <span className="text-[#18211e]">Every Player.</span>
            </h1>
            <p className="mt-7 max-w-[450px] text-base leading-relaxed sm:text-lg text-white/60">
              Your complete campus sports management platform. Find your team,
              own your fixtures, and make every match count.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/login" className="btn-primary !px-5 !py-3.5 text-sm bg-[#85b62b] ">
                Explore tournaments <ArrowRight size={16} />
              </Link>
              <Link
                to="/register"
                className="btn-secondary !px-5 !py-3.5 text-sm bg-[#ffff]/70"
              >
                Get started <MoveUpRight size={15} />
              </Link>
            </div>
          </div>
          {/* <div className="relative mx-auto w-full max-w-[540px] md:ml-auto">
            <div className="relative overflow-hidden rounded-[30px] bg-[#1c342b] p-5 text-white shadow-[0_30px_80px_rgba(28,52,43,.2)] sm:p-7">
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/55">
                    CampusPlay · Live board
                  </p>
                  <p className="mt-1 text-lg font-bold">Today on campus</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-lime">
                  13 Nov
                </span>
              </div>
              <div className="relative mt-6 rounded-[22px] border border-white/10 bg-white/[.07] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="relative ml-3 text-[9px] font-extrabold uppercase tracking-[.16em] text-rose-200 before:absolute before:-left-3 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-rose-400">
                    LIVE · FINAL
                  </span>
                  <span className="text-[10px] text-white/50">
                    Cricket · Main Ground
                  </span>
                </div>
                <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime text-xs font-black text-[#1c342b]">
                      CW
                    </span>
                    <p className="mt-2 text-xs font-semibold">CSE Warriors</p>
                    <p className="mt-1 text-3xl font-black tracking-tight">
                      78<span className="text-base text-white/55">/5</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-white/35">
                    VS
                  </span>
                  <div className="text-right">
                    <span className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xs font-black">
                      CT
                    </span>
                    <p className="mt-2 text-xs font-semibold">CSE Titans</p>
                    <p className="mt-1 text-3xl font-black tracking-tight">
                      72<span className="text-base text-white/55">/8</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/55">
                  <span>8.2 overs · 10 overs</span>
                  <span className="text-lime">Chasing 79</span>
                </div>
              </div>
              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[.07] p-4">
                  <div className="flex items-center gap-2 text-[10px] text-white/55">
                    <CalendarDays size={13} /> NEXT UP
                  </div>
                  <p className="mt-2 text-xs font-bold">
                    Badminton · CSE 2A vs 2B
                  </p>
                  <p className="mt-1 text-[10px] text-white/50">
                    Tomorrow · 10:30 AM
                  </p>
                </div>
                <div className="rounded-2xl bg-lime p-4 text-[#1c342b]">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <Users size={13} /> Open spots
                  </div>
                  <p className="mt-2 text-xs font-extrabold">
                    Cricket needs you.
                  </p>
                  <p className="mt-1 text-[10px] opacity-70">
                    Registration closes in 4 days
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </section>
      </main>

    </div>
  );
}
