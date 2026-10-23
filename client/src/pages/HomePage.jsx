import { useState } from "react";
import { ArrowRight, Check, Circle, MousePointer2, Pencil, Plus, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function HomePage() {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRoom() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/room/create`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to create room");
      }

      const data = await response.json();
      navigate(`/room/${data.roomId}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleJoinRoom(event) {
    event.preventDefault();

    if (!roomInput.trim()) {
      setError("Enter a room id to join.");
      return;
    }

    navigate(`/room/${roomInput.trim()}`);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0b1020] px-5 py-5 text-white md:px-10 md:py-7">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-[#0b1020] shadow-lg shadow-cyan-400/20">
            <Pencil size={20} strokeWidth={2.5} />
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-xl font-bold tracking-tight">CollabBoard</span>
        </div>
        <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Your ideas, in sync
        </span>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 pb-10 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pt-24">
        <div className="relative z-10">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            <Circle size={9} fill="currentColor" />
            Realtime collaboration
          </p>
          <h1 className="max-w-xl font-['Space_Grotesk',sans-serif] text-5xl font-bold leading-[1.02] tracking-tight text-white md:text-7xl">
            Think together.
            <br />
            <span className="text-cyan-300">Make it visible.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400 md:text-lg">
            A focused space for teams to sketch, plan, and turn rough ideas into something everyone can see.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCreateRoom}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-[#0b1020] shadow-xl shadow-cyan-400/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {loading ? "Creating..." : "Start a new board"}
              <ArrowRight size={17} />
            </button>
          </div>

          <form onSubmit={handleJoinRoom} className="mt-4 flex max-w-md rounded-xl border border-white/10 bg-white/5 p-1.5 focus-within:border-cyan-400/60">
            <input
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value)}
              placeholder="Paste a room code"
              aria-label="Room code"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
              Join
              <ArrowRight size={15} />
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
            {["Live cursors", "Shapes & text", "Voice rooms"].map((feature) => (
              <span key={feature} className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative rotate-1 rounded-2xl border border-white/10 bg-[#151d32] p-3 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">shared workspace</span>
              <UsersRound size={15} className="text-slate-500" />
            </div>
            <div className="relative mt-3 h-[290px] overflow-hidden rounded-xl bg-[#f8fafc] sm:h-[370px]">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
              <div className="absolute left-[18%] top-[22%] h-24 w-36 rotate-[-6deg] rounded-lg border-[3px] border-indigo-500 bg-indigo-100/60 sm:h-32 sm:w-48" />
              <div className="absolute right-[15%] top-[16%] h-20 w-20 rotate-12 rounded-full border-[3px] border-amber-500 bg-amber-100/70 sm:h-28 sm:w-28" />
              <div className="absolute bottom-[22%] left-[30%] h-20 w-40 rotate-6 border-[3px] border-emerald-500 bg-emerald-100/60 sm:h-24 sm:w-56" />
              <div className="absolute left-[14%] top-[17%] text-xs font-bold text-indigo-600">rough ideas</div>
              <div className="absolute bottom-[17%] right-[15%] rounded bg-sky-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                <MousePointer2 size={11} className="mr-1 inline" /> Alex is here
              </div>
              <div className="absolute right-[28%] top-[38%] h-2 w-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-slate-500">
        <span>Built for ideas that move fast.</span>
        <span>Open a room. Share the code. Create together.</span>
      </footer>
    </main>
  );
}
