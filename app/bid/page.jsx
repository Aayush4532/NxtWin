"use client";
import React, { useMemo, useState } from "react";

const SAMPLE = [
  { id: "m1", title: "Will XYZ win the match?", category: "Sports", optionA: "Team XYZ", optionB: "Team ABC", yesShare: 62, amount: 425, participants: 2412, deadline: "Closes in 3h 24m", date: "2025-08-07" },
  { id: "m2", title: "Will company A beat quarterly targets?", category: "Finance", optionA: "Yes", optionB: "No", yesShare: 48, amount: 1200, participants: 812, deadline: "Closes in 1d 2h", date: "2025-08-08" },
  { id: "m3", title: "Will Party X win the state election?", category: "Politics", optionA: "Party X", optionB: "Party Y", yesShare: 39, amount: 760, participants: 351, deadline: "Closes in 5d", date: "2025-08-12" },
  { id: "m4", title: "Will cryptocurrency Z break $100K?", category: "Crypto", optionA: "Yes", optionB: "No", yesShare: 22, amount: 980, participants: 1240, deadline: "Closes in 12h", date: "2025-08-06" },
  { id: "m5", title: "Will movie ABC be top of box office this weekend?", category: "Entertainment", optionA: "ABC", optionB: "Other", yesShare: 71, amount: 300, participants: 410, deadline: "Closes in 2d", date: "2025-08-09" },
];

export default function Page() {
  const [data] = useState(SAMPLE);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(2000);
  const [sortBy, setSortBy] = useState("relevance");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const categories = useMemo(() => ["All", ...Array.from(new Set(data.map(d => d.category)))], [data]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let r = data.filter(m => {
      if (category !== "All" && m.category !== category) return false;
      if (m.amount < minAmount || m.amount > maxAmount) return false;
      if (!ql) return true;
      return (
        m.title.toLowerCase().includes(ql) ||
        m.optionA.toLowerCase().includes(ql) ||
        m.optionB.toLowerCase().includes(ql) ||
        m.category.toLowerCase().includes(ql)
      );
    });
    if (sortBy === "amount-desc") r = r.sort((a, b) => b.amount - a.amount);
    else if (sortBy === "amount-asc") r = r.sort((a, b) => a.amount - b.amount);
    else if (sortBy === "newest") r = r.sort((a, b) => new Date(b.date) - new Date(a.date));
    return r;
  }, [data, q, category, minAmount, maxAmount, sortBy]);

  const resetFilters = () => {
    setQ(""); setCategory("All"); setMinAmount(0); setMaxAmount(2000); setSortBy("relevance");
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 selection:bg-cyan-300 selection:text-black">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_500px_at_15%_-10%,rgba(0,255,200,0.07),transparent),radial-gradient(1000px_500px_at_85%_110%,rgba(120,60,255,0.08),transparent)]" />
      </div>

      <div className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-xl bg-[#030712]/60">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.5"/></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search markets..." className="bg-transparent outline-none placeholder:text-slate-500 text-slate-100 w-full" />
            <button onClick={resetFilters} className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition">Reset</button>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="hidden sm:block rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm">
            <option value="relevance">Relevance</option>
            <option value="amount-desc">Amount (High → Low)</option>
            <option value="amount-asc">Amount (Low → High)</option>
            <option value="newest">Newest</option>
          </select>
          <div className="hidden sm:flex items-center rounded-xl border border-white/10 bg-white/[0.05] px-1 py-1">
            <Tab active={viewMode === "grid"} onClick={() => setViewMode("grid")} label="Grid" />
            <Tab active={viewMode === "list"} onClick={() => setViewMode("list")} label="List" />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-sm border ${category===c?'border-emerald-400/60 bg-emerald-300/10 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.25)]':'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400 mb-2">Min</div>
                <input type="range" min={0} max={5000} value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} className="w-full accent-emerald-400" />
                <div className="mt-1 text-right text-xs text-slate-400">₹{minAmount}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400 mb-2">Max</div>
                <input type="range" min={0} max={5000} value={maxAmount} onChange={(e) => setMaxAmount(Number(e.target.value))} className="w-full accent-emerald-400" />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>₹0</span><span>₹{maxAmount}</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400 mb-2">Quick tags</div>
                <div className="flex flex-wrap gap-2">
                  <Chip onClick={() => { setMinAmount(0); setMaxAmount(500); }} label="Low stake" />
                  <Chip onClick={() => { setMinAmount(500); setMaxAmount(1500); }} label="Medium" />
                  <Chip onClick={() => { setMinAmount(1500); setMaxAmount(5000); }} label="High stake" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <div className="mb-4 text-sm text-slate-400">{filtered.length} markets</div>

        {filtered.length === 0 ? (
          <Empty onClear={resetFilters} />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filtered.map(m => (
              <CardGrid key={m.id} market={m} selected={selected === m.id} onSelect={() => setSelected(s => s===m.id?null:m.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(m => (
              <CardList key={m.id} market={m} selected={selected === m.id} onSelect={() => setSelected(s => s===m.id?null:m.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- atoms ---------- */

function Tab({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-sm transition ${active?'bg-gradient-to-r from-teal-300 to-cyan-300 text-black shadow-[0_8px_30px_-8px_rgba(45,212,191,0.6)]':'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
      {label}
    </button>
  );
}

function Chip({ label, onClick }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 text-sm rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 backdrop-blur transition">
      {label}
    </button>
  );
}

function Badge({ children }) {
  return (
    <div className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.05] backdrop-blur text-slate-300">
      {children}
    </div>
  );
}

function ProgressPulse({ value = 50 }) {
  return (
    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative">
      <div style={{ width: `${value}%` }} className="h-full bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 transition-all" />
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(60%_50%_at_30%_50%,black,transparent)] bg-white/20 mix-blend-overlay" />
    </div>
  );
}

/* ---------- cards (no channel/owner in grid) ---------- */

function CardGrid({ market, selected, onSelect }) {
  return (
    <div className={`rounded-2xl border ${selected?'border-emerald-300/60':'border-white/10'} bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden`}>
      <button onClick={onSelect} className="w-full text-left">
        <div className="relative aspect-video bg-gradient-to-br from-slate-800/60 to-slate-900/60">
          <div className="absolute inset-0 grid place-items-center px-6">
            <ProgressPulse value={market.yesShare} />
          </div>
          <div className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur text-slate-200">
            {market.category}
          </div>
          <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur">
            ₹{market.amount.toLocaleString()}
          </div>
        </div>
      </button>

      <div className="p-3">
        <h3 className="text-[15px] font-semibold leading-snug text-slate-100 line-clamp-2">{market.title}</h3>
        <div className="mt-1 text-xs text-slate-400 line-clamp-1">{market.optionA} vs {market.optionB}</div>

        <div className="mt-3 grid grid-cols-12 items-center">
          <div className="col-span-7 flex items-center gap-3 text-xs text-slate-400">
            <span>{market.participants.toLocaleString()} joined</span>
            <span>•</span>
            <span>{market.deadline}</span>
          </div>
          <div className="col-span-5 flex items-center justify-end gap-2">
            <span className="text-sm text-slate-200">{market.yesShare}% Yes</span>
            <input type="radio" readOnly checked={selected} className="accent-emerald-400" />
            <button onClick={onSelect} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-300 to-cyan-300 text-black text-sm font-semibold hover:shadow-[0_12px_40px_-14px_rgba(45,212,191,0.7)]">
              Join
            </button>
            <button onClick={() => alert(`Open market ${market.title}`)} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 text-sm hover:bg-white/[0.08]">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardList({ market, selected, onSelect }) {
  return (
    <div onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e)=>e.key==="Enter"&&onSelect()} className={`group cursor-pointer rounded-2xl border transition shadow-[0_14px_50px_-20px_rgba(0,0,0,0.6)] ${selected?'border-emerald-300/60 bg-white/[0.12]':'border-white/10 bg-white/[0.06] hover:bg-white/[0.09]'} backdrop-blur-xl p-3`}>
      <div className="flex items-stretch gap-4">
        <div className="w-[260px] max-w-[40%] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60">
          <div className="aspect-video relative">
            <div className="absolute inset-0 grid place-items-center px-5">
              <ProgressPulse value={market.yesShare} />
            </div>
            <div className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur">{market.category}</div>
            <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur">₹{market.amount.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="text-lg font-semibold leading-snug text-slate-100 line-clamp-2">{market.title}</h3>
            <input type="radio" checked={selected} readOnly className="accent-emerald-400 mt-0.5" />
          </div>
          <div className="mt-1 text-sm text-slate-300 line-clamp-1">{market.optionA} vs {market.optionB}</div>

          <div className="mt-3 grid grid-cols-12 items-center gap-3">
            <div className="col-span-7 flex items-center gap-3 text-xs text-slate-400">
              <Badge>Participants: {market.participants.toLocaleString()}</Badge>
              <Badge>Vol: ₹{market.amount.toLocaleString()}</Badge>
              <Badge>{market.deadline}</Badge>
            </div>
            <div className="col-span-5 flex items-center justify-end gap-2">
              <span className="text-sm text-slate-200">{market.yesShare}% Yes</span>
              <button onClick={(e)=>{e.stopPropagation(); onSelect();}} className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-300 to-cyan-300 text-black font-semibold hover:shadow-[0_16px_50px_-12px_rgba(45,212,191,0.7)]">
                Join
              </button>
              <button onClick={(e)=>{e.stopPropagation(); alert(`Open market ${market.title}`);}} className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 text-sm hover:bg-white/[0.08]">
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}