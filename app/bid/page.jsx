"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  withRandomVolume,
  formatINRCompact,
  getPrices,
} from "../utils/formatters";
import SpotlightCard from "../components/SpotlightCard";

export default function Page() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:1102/api/get/bids");
        const results = await res.json().catch(() => null);

        // defensive: if results is not object or has no bids, fallback to []
        const rawBids = Array.isArray(results?.bids) ? results.bids : [];

        // normalize into the shape UI expects (safe defaults)
        const normalized = rawBids.map((b) => {
          const optA = (b.options && b.options[0]) || { key: "A", label: "Yes", currentPrice: 0 };
          const optB = (b.options && b.options[1]) || { key: "B", label: "No", currentPrice: 0 };

          const priceA = Number(optA.currentPrice ?? 0);
          const priceB = Number(optB.currentPrice ?? 0);
          const sumPrice = priceA + priceB;
          const yesShare = sumPrice > 0 ? Math.round((priceA / sumPrice) * 100) : 50;

          const avgPrice = sumPrice > 0 ? Math.round(sumPrice / 2) : 0;
          const stocks = Number(b.stocks ?? 0);
          const volume = (sumPrice) * (stocks || 1); // numeric

          const participants = Number(b.participants ?? b.stocks ?? 0);

          const endTime = b.endTime ? new Date(b.endTime) : null;
          const deadline = endTime ? endTime.toLocaleString() : (b.deadline ?? "—");

          return {
            // keep original fields too, but add the UI-friendly ones
            ...b,
            id: b._id ?? b.id ?? `${b._id ?? Math.random().toString(36).slice(2, 9)}`,
            _id: b._id ?? b.id ?? null,
            title: b.question ?? b.title ?? "Untitled market",
            question: b.question ?? b.title ?? "Untitled market",
            optionA: optA.label ?? "Yes",
            optionB: optB.label ?? "No",
            optionAPrice: priceA,
            optionBPrice: priceB,
            amount: avgPrice,
            volume: Number.isFinite(volume) ? volume : 0,
            yesShare: Number.isFinite(yesShare) ? yesShare : 50,
            participants: Number.isFinite(participants) ? participants : 0,
            deadline,
            image: b.image ?? null,
          };
        });

        setData(normalized);
      } catch (err) {
        console.error("fetch bids failed:", err);
        setData([]);
      }
    };
    fetchData();
  }, []);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(2000);
  const [sortBy, setSortBy] = useState("relevance");
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(data.map((d) => d.category ?? "Uncategorized")))],
    [data]
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let r = (Array.isArray(data) ? data : []).filter((m) => {
      if (category !== "All" && (m.category ?? "Uncategorized") !== category) return false;

      // amount safety: fallback to 0 if missing
      const amt = Number(m.amount ?? 0);
      if (amt < minAmount || amt > maxAmount) return false;

      if (!ql) return true;

      // fields to search safely
      const title = (m.title ?? m.question ?? "").toString().toLowerCase();
      const optionA = (m.optionA ?? "").toString().toLowerCase();
      const optionB = (m.optionB ?? "").toString().toLowerCase();
      const cat = (m.category ?? "").toString().toLowerCase();

      return title.includes(ql) || optionA.includes(ql) || optionB.includes(ql) || cat.includes(ql);
    });

    if (sortBy === "amount-desc") r = r.sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0));
    else if (sortBy === "amount-asc") r = r.sort((a, b) => Number(a.amount ?? 0) - Number(b.amount ?? 0));
    else if (sortBy === "newest")
      r = r.sort((a, b) => new Date(b.createdAt ?? b.startTime ?? 0) - new Date(a.createdAt ?? a.startTime ?? 0));
    return r;
  }, [data, q, category, minAmount, maxAmount, sortBy]);

  const resetFilters = () => {
    setQ("");
    setCategory("All");
    setMinAmount(0);
    setMaxAmount(2000);
    setSortBy("relevance");
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 selection:bg-cyan-300 selection:text-black">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_500px_at_15%_-10%,rgba(0,255,200,0.07),transparent),radial-gradient(1000px_500px_at_85%_110%,rgba(120,60,255,0.08),transparent)]" />
      </div>

      <div className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-xl bg-[#030712]/60">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
            <svg
              className="h-4 w-4 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search markets..."
              className="bg-transparent outline-none placeholder:text-slate-500 text-slate-100 w-full"
            />
            <button
              onClick={resetFilters}
              className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              Reset
            </button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hidden sm:block rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="amount-desc">Amount (High → Low)</option>
            <option value="amount-asc">Amount (Low → High)</option>
            <option value="newest">Newest</option>
          </select>
          <div className="hidden sm:flex items-center rounded-xl border border-white/10 bg-white/[0.05] px-1 py-1">
            <Tab
              active={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              label="Grid"
            />
            <Tab
              active={viewMode === "list"}
              onClick={() => setViewMode("list")}
              label="List"
            />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    category === c
                      ? "border-emerald-400/60 bg-emerald-300/10 text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.25)]"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400 mb-2">Min</div>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
                <div className="mt-1 text-right text-xs text-slate-400">
                  ₹{minAmount}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400 mb-2">Max</div>

                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>₹0</span>
                  <span>₹{maxAmount}</span>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs text-slate-400 mb-2">Quick tags</div>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    onClick={() => {
                      setMinAmount(0);
                      setMaxAmount(500);
                    }}
                    label="Low stake"
                  />
                  <Chip
                    onClick={() => {
                      setMinAmount(500);
                      setMaxAmount(1500);
                    }}
                    label="Medium"
                  />
                  <Chip
                    onClick={() => {
                      setMinAmount(1500);
                      setMaxAmount(5000);
                    }}
                    label="High stake"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <div className="mb-4 text-sm text-slate-400">
          {filtered.length} markets
        </div>

        {filtered.length === 0 ? (
          <Empty onClear={resetFilters} />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {filtered.map((m) => (
              <CardGrid
                key={m._id ?? m.id}
                market={m}
                selected={selected === m.id}
                onSelect={() => setSelected((s) => (s === m.id ? null : m.id))}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((m) => (
              <CardList
                key={m._id ?? m.id}
                market={m}
                selected={selected === m.id}
                onSelect={() => setSelected((s) => (s === m.id ? null : m.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- atoms ---------- */

function Empty({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">
        No markets found
      </h3>
      <p className="text-slate-400 mb-6 max-w-md">
        No markets match your current filters. Try adjusting your search
        criteria or clearing all filters.
      </p>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm"
      >
        Clear filters
      </button>
    </div>
  );
}

function Tab({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm transition ${
        active
          ? "bg-gradient-to-r from-teal-300 to-cyan-300 text-black shadow-[0_8px_30px_-8px_rgba(45,212,191,0.6)]"
          : "bg-white/5 text-slate-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function Chip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 backdrop-blur transition"
    >
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
      <div
        style={{ width: `${value}%` }}
        className="h-full bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 transition-[width] duration-300"
      />
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(60%_50%_at_30%_50%,black,transparent)] bg-white/20 mix-blend-overlay" />
    </div>
  );
}

/* ---------- cards (no channel/owner in grid) ---------- */

function CardGrid({ market, selected, onSelect }) {
  const volCompact = formatINRCompact(market.volume ?? 0);
  const { yes, no } = getPrices(Number(market.yesShare ?? 50));

  return (
    <SpotlightCard
      className="!p-2 !m-0"
      spotlightColor="rgba(0, 229, 255, 0.35)"
    >
      <div
        className={`rounded-2xl border ${
          selected ? "border-emerald-300/60" : "border-white/10"
        } bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)] overflow-hidden`}
      >
        <Link href={`/bid/${market.id}`} className="block">
          <div className="relative aspect-[16/9] bg-slate-900">
            {market.image ? (
              <Image
                src={market.image}
                alt={market.title}
                fill
                className="object-cover opacity-85"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            ) : null}

            <div className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur text-slate-200">
              {market.category}
            </div>
            <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur">
              Vol: ₹{volCompact}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3">
              <ProgressPulse value={Number(market.yesShare ?? 50)} />
            </div>
          </div>
        </Link>

        <div className="p-3 space-y-2.5">
          <h3 className="text-[15px] font-semibold leading-snug text-slate-100 line-clamp-2">
            {market.title}
          </h3>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-300 truncate">
              <span className="font-medium text-slate-200">
                {market.optionA}
              </span>
              <span className="mx-1 text-slate-500">vs</span>
              <span className="font-medium text-slate-200">
                {market.optionB}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-slate-200">
                {Number(market.yesShare ?? 50)}% Yes
              </span>
              <input
                type="radio"
                readOnly
                checked={!!selected}
                className="accent-emerald-400"
              />
            </div>
          </div>

          {/* Yes / No prices row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 flex items-center justify-between">
              <span className="text-emerald-300 font-medium">
                {market.optionA}
              </span>
              <span className="text-emerald-200 tabular-nums">
                ₹{Math.round((yes ?? 0) * 100)}
              </span>
            </div>
            <div className="flex-1 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 flex items-center justify-between">
              <span className="text-red-400 font-medium">{market.optionB}</span>
              <span className="text-red-300 tabular-nums">
                ₹{Math.round((no ?? 0) * 100)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center">
            <div className="col-span-7 flex items-center gap-3 text-xs text-slate-400">
              <span>{(Number(market.participants ?? 0)).toLocaleString()} joined</span>
              <span>•</span>
              <span>{market.deadline}</span>
            </div>

            <div className="col-span-5 flex items-center justify-end gap-2">
              <Link
                href={`/bid/${market.id}`}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 text-sm hover:bg-white/[0.08]"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function CardList({ market, selected, onSelect }) {
  const volCompact = formatINRCompact(market.volume ?? 0);
  const { yes, no } = getPrices(Number(market.yesShare ?? 50));
  const noShare = 100 - Number(market.yesShare ?? 50);

  return (
    <Link
      href={`/bid/${market.id}`}
      className={`group block rounded-2xl border transition shadow-[0_14px_50px_-20px_rgba(0,0,0,0.6)] ${
        selected
          ? "border-emerald-300/60 bg-white/[0.12]"
          : "border-white/10 bg-white/[0.06] hover:bg-white/[0.09]"
      } backdrop-blur-xl p-3`}
    >
      <div className="flex items-stretch gap-4">
        <div className="w-[260px] max-w-[40%] rounded-xl overflow-hidden bg-slate-900">
          <div className="relative aspect-[16/9]">
            {market.image ? (
              <Image
                src={market.image}
                alt={market.title}
                fill
                className="object-cover opacity-85"
                sizes="(max-width:768px) 100vw, 40vw"
              />
            ) : null}

            <div className="absolute top-2 left-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur">
              {market.category}
            </div>
            <div className="absolute bottom-2 right-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-black/40 backdrop-blur">
              Vol: ₹{volCompact}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3">
              <ProgressPulse value={Number(market.yesShare ?? 50)} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold leading-snug text-slate-100 line-clamp-2">
              {market.question}
            </h3>
            <input
              type="radio"
              checked={!!selected}
              readOnly
              className="accent-emerald-400 mt-0.5 shrink-0"
              onClick={(e) => e.preventDefault()}
            />
          </div>

          <div className="text-sm text-slate-300 truncate">
            <span className="font-medium text-slate-200">{market.optionA}</span>
            <span className="mx-1 text-slate-500">vs</span>
            <span className="font-medium text-slate-200">{market.optionB}</span>
          </div>

          {/* Yes / No prices + shares */}
          <div className="flex items-stretch gap-3">
            <div className="flex-1 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-emerald-300 font-medium">Yes</span>
                <span className="text-emerald-200 text-sm">
                  {Number(market.yesShare ?? 50)}%
                </span>
              </div>
              <span className="text-emerald-200 tabular-nums">
                ₹{Math.round((yes ?? 0) * 100)}
              </span>
            </div>
            <div className="flex-1 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-medium">No</span>
                <span className="text-cyan-200 text-sm">{noShare}%</span>
              </div>
              <span className="text-cyan-200 tabular-nums">
                ₹{Math.round((no ?? 0) * 100)}
              </span>
            </div>
          </div>

          <div className="mt-1 grid grid-cols-12 items-center gap-3">
            <div className="col-span-7 flex items-center gap-3 text-xs text-slate-400">
              <Badge>
                Participants: {(Number(market.participants ?? 0)).toLocaleString()}
              </Badge>
              <Badge>Vol: ₹{volCompact}</Badge>
              <Badge>{market.deadline}</Badge>
            </div>

            <div className="col-span-5 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSelect?.();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-300 to-cyan-300 text-black font-semibold hover:shadow-[0_16px_50px_-12px_rgba(45,212,191,0.7)]"
              >
                Select
              </button>
              <Link
                href={`/bid/${market.id}`}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-slate-200 text-sm hover:bg-white/[0.08]"
              >
                Open
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}