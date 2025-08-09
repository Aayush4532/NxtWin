"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function BidPage() {
  const { id } = useParams();
  const [market, setMarket] = useState(null);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [balance, setBalance] = useState(() => {
    try {
      return Number(localStorage.getItem("balance")) || 1000;
    } catch {
      return 1000;
    }
  });

  const [selected, setSelected] = useState("A");
  const [mode, setMode] = useState("amount"); // 'amount' | 'write'
  const [sliderValue, setSliderValue] = useState(50);
  const [exactAmt, setExactAmt] = useState(50);
  const [writeText, setWriteText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const mount = useRef(false);

  useEffect(() => {
    mount.current = true;
    async function load() {
      setLoadingMarket(true);
      try {
        const res = await fetch(`/api/markets/${id}`);
        if (res.ok) {
          const j = await res.json();
          setMarket(j);
          const start = Math.max(1, Math.min(100, Math.round(j?.yesShare ?? 50)));
          setSliderValue(start);
          setExactAmt(start);
        } else {
          const sm = sampleMarket();
          setMarket(sm);
          setSliderValue(50);
          setExactAmt(50);
        }
      } catch {
        const sm = sampleMarket();
        setMarket(sm);
        setSliderValue(50);
        setExactAmt(50);
      } finally {
        if (mount.current) setLoadingMarket(false);
      }
    }
    load();
    return () => {
      mount.current = false;
    };
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem("balance", String(balance));
    } catch {}
  }, [balance]);

  useEffect(() => {
    const handle = (e) => {
      document.documentElement.style.setProperty("--mx", `${(e.clientX / window.innerWidth) * 100}%`);
      document.documentElement.style.setProperty("--my", `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener("pointermove", handle);
    return () => window.removeEventListener("pointermove", handle);
  }, []);

  useEffect(() => {
    const max = Math.max(100, Math.floor(balance));
    if (sliderValue > max) setSliderValue(max);
    if (exactAmt > max) setExactAmt(max);
  }, [balance]);

  function sampleMarket() {
    return {
      id,
      title: "Will XYZ win the match?",
      category: "Sports",
      deadline: "Closes in 3h 24m",
      optionA: "Team XYZ",
      optionB: "Team ABC",
      yesShare: 62,
      participants: 2412,
      volume: 425000,
      context: "Head-to-head, injuries, home advantage",
      marketNews: "Recent lineups show XYZ missing a key player.",
    };
  }

  const pulseMessage = (txt) => {
    setMessage(txt);
    setTimeout(() => setMessage(null), 3000);
  };

  const placeBid = (opt) => {
    if (!market) return;
    if (mode === "write") {
      if (!writeText.trim()) return pulseMessage("Write something before posting");
      pulseMessage(`Posted note on ${opt === "A" ? market.optionA : market.optionB}`);
      setWriteText("");
      return;
    }

    const amt = Number(exactAmt || sliderValue || 0);
    if (!amt || amt <= 0) return pulseMessage("Enter a valid amount");
    if (amt > balance) return pulseMessage("Insufficient balance");
    setBalance((b) => b - amt);
    pulseMessage(`Placed ₹${amt} on ${opt === "A" ? market.optionA : market.optionB}`);
  };

  const runAi = async () => {
    if (!market) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const payload = {
        question: market.title,
        optionA: market.optionA,
        optionB: market.optionB,
        context: market.context || "",
        marketNews: market.marketNews || "",
      };
      const res = await fetch("/api/gemini/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      let data = j?.data ?? j;
      if (j?.ok && j?.data) data = j.data;
      if (!data && j?.raw) {
        try {
          data = typeof j.raw === "string" ? JSON.parse(j.raw) : j.raw;
        } catch {
          data = null;
        }
      }
      setAiResult(data || j);
    } catch (e) {
      setAiResult({ error: "AI request failed" });
    } finally {
      setAiLoading(false);
    }
  };

  const percentVisual = (v, from, to) => {
    return (
      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
        <div
          style={{ width: `${Math.max(0, Math.min(100, v))}%`, transition: "width 700ms cubic-bezier(.2,.9,.2,1)" }}
          className={`h-full bg-gradient-to-r ${from} ${to}`}
        />
      </div>
    );
  };

  const maxSlider = Math.max(100, Math.floor(balance));
  const sliderFill = ((sliderValue - 1) / Math.max(1, maxSlider - 1)) * 100;

  return (
    <div className="min-w-screen min-h-screen bg-gradient-to-b from-[#00040a] via-[#02081a] to-[#000814] flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-[1600px]">
        {/* unified glass container */}
        <div className="rounded-3xl bg-[rgba(6,8,12,0.45)] border border-[rgba(255,255,255,0.04)] backdrop-blur-md shadow-[0_24px_60px_rgba(2,6,23,0.7)] overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6 p-7">
            {/* left/main column */}
            <div className="md:col-span-2 space-y-7">
              {/* header with title + balance */}
              <div className="rounded-2xl p-6 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)] flex items-start justify-between gap-6">
                <div className="flex-1 pr-6">
                  <div className="text-sm text-emerald-300 font-medium">{market?.category ?? "Loading..."}</div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-slate-100">{loadingMarket ? "Loading market…" : market.title}</h1>
                  <p className="mt-3 text-sm text-slate-300 max-w-prose">{market?.context}</p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                    <div className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)]"> {market?.deadline ?? "—"} </div>
                    <div className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)]">{market?.participants ?? 0} participants</div>
                    <div className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)]">Vol ₹{(market?.volume ?? 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="w-72 text-right flex-shrink-0">
                  <div className="text-xs text-slate-400">Your balance</div>
                  <div className="mt-1 text-2xl font-bold text-slate-100 transition-colors duration-200">{balance >= 0 ? `₹${balance.toFixed(2)}` : `-`}</div>
                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => {
                        setBalance((b) => b + 500);
                        pulseMessage("₹500 added");
                      }}
                      className="w-full rounded-lg px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold shadow"
                    >
                      Add ₹500
                    </button>
                    <button
                      onClick={() => {
                        setBalance(1000);
                        pulseMessage("Balance reset to ₹1000");
                      }}
                      className="w-full rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.04)] text-sm text-slate-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* options - use more width, roomy cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <OptionCard
                  side="A"
                  selected={selected}
                  onSelect={() => setSelected("A")}
                  market={market}
                  percent={market?.yesShare ?? 0}
                  percentVisual={percentVisual}
                  mode={mode}
                  exactAmt={exactAmt}
                  setExactAmt={(v) => {
                    const val = Number(v || 0);
                    setExactAmt(val);
                    setSliderValue(val);
                  }}
                  sliderValue={sliderValue}
                  setSliderValue={(v) => {
                    setSliderValue(v);
                    setExactAmt(v);
                  }}
                  maxSlider={maxSlider}
                  placeBid={() => placeBid("A")}
                  sliderFill={sliderFill}
                  sliderColorFrom="#06b6d4"
                  sliderColorTo="#3b82f6"
                  showTip={showTip}
                  setShowTip={setShowTip}
                  writeText={writeText}
                  setWriteText={setWriteText}
                />

                <OptionCard
                  side="B"
                  selected={selected}
                  onSelect={() => setSelected("B")}
                  market={market}
                  percent={100 - (market?.yesShare ?? 0)}
                  percentVisual={percentVisual}
                  mode={mode}
                  exactAmt={exactAmt}
                  setExactAmt={(v) => {
                    const val = Number(v || 0);
                    setExactAmt(val);
                    setSliderValue(val);
                  }}
                  sliderValue={sliderValue}
                  setSliderValue={(v) => {
                    setSliderValue(v);
                    setExactAmt(v);
                  }}
                  maxSlider={maxSlider}
                  placeBid={() => placeBid("B")}
                  sliderFill={sliderFill}
                  sliderColorFrom="#7c3aed"
                  sliderColorTo="#8b5cf6"
                  showTip={showTip}
                  setShowTip={setShowTip}
                  writeText={writeText}
                  setWriteText={setWriteText}
                />
              </div>

              {/* discussion */}
              <div className="rounded-2xl p-6 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)]">
                <h3 className="text-lg font-semibold text-slate-100">Discussion & Context</h3>
                <div className="mt-3 text-slate-300 leading-relaxed max-w-prose">
                  This market bundles short-term news and available context. Place small bets to test the AI's edge, watch how the percentages react to new information, and keep your exposure controlled.
                </div>
              </div>
            </div>

            {/* right column */}
            <aside className="space-y-6 sticky top-6 self-start">
              <div className="rounded-2xl p-5 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)] w-80">
                <div className="text-sm text-emerald-300 font-medium">Market News</div>
                <div className="mt-3 text-slate-300 text-sm">{market?.marketNews || "No recent news."}</div>
                <div className="mt-4 flex items-center gap-2 justify-between">
                  <div className="text-xs text-slate-400">Mode</div>
                  <div className="rounded-full bg-[rgba(255,255,255,0.03)] p-1 flex items-center">
                    <button onClick={() => setMode("amount")} className={`px-3 py-1 rounded-full text-sm ${mode === "amount" ? "bg-[rgba(255,255,255,0.02)]" : ""}`}>
                      Amount
                    </button>
                    <button onClick={() => setMode("write")} className={`px-3 py-1 rounded-full text-sm ${mode === "write" ? "bg-[rgba(255,255,255,0.02)]" : ""}`}>
                      Write
                    </button>
                  </div>
                </div>
                <button disabled={aiLoading} onClick={runAi} className="mt-4 w-full rounded-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 font-semibold">
                  {aiLoading ? "Analyzing…" : "AI Analyze"}
                </button>
              </div>

              <div className="rounded-2xl p-5 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)] w-80">
                <div className="text-sm text-slate-400">Quick Stats</div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <div>Market ID</div>
                    <div className="font-mono text-xs">{market?.id ?? id}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Participants</div>
                    <div>{market?.participants ?? 0}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Volume</div>
                    <div>₹{(market?.volume ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Expires</div>
                    <div>{market?.deadline ?? "—"}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-5 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)] w-80">
                <div className="text-sm text-slate-400">Recent Activity</div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Bid placed</span>
                    <span>₹200</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market created</span>
                    <span>2h ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI update</span>
                    <span>5m ago</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* upcoming bids — wider, spacious cards using more width */}
        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-[1480px] rounded-3xl p-6 bg-[rgba(6,8,12,0.45)] border border-[rgba(255,255,255,0.03)] backdrop-blur-md shadow-lg">
            <h4 className="text-sm text-slate-300 mb-5">Upcoming Bids</h4>
            <div className="overflow-x-auto py-3">
              <div className="flex gap-8 min-w-max">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[380px] p-6 rounded-xl bg-[rgba(10,12,16,0.65)] border border-[rgba(255,255,255,0.03)] backdrop-blur-md transform transition hover:-translate-y-1"
                  >
                    <div className="text-xs text-slate-400">Bid #{i + 1}</div>
                    <div className="mt-3 font-semibold text-slate-100">{i % 2 === 0 ? market?.optionA : market?.optionB}</div>
                    <div className="mt-1 text-sm text-slate-300">Amount: ₹{(i + 1) * 75}</div>
                    <div className="mt-3 text-xs text-slate-400">By user{(i + 1)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 px-4 py-2 rounded-md bg-[rgba(0,0,0,0.8)] border border-[rgba(255,255,255,0.04)]">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

/* --- OptionCard component --- */
function OptionCard({
  side,
  selected,
  onSelect,
  market,
  percent,
  percentVisual,
  mode,
  exactAmt,
  setExactAmt,
  sliderValue,
  setSliderValue,
  maxSlider,
  placeBid,
  sliderFill,
  sliderColorFrom,
  sliderColorTo,
  showTip,
  setShowTip,
  writeText,
  setWriteText,
}) {
  // dynamic filled background for the range track
  const rangeBg = `linear-gradient(90deg, ${sliderColorFrom} ${sliderFill}%, rgba(255,255,255,0.04) ${sliderFill}%)`;
  const tipLeft = `${sliderFill}%`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // avoid selecting when clicking on input controls
        const tag = e.target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "button") return;
        onSelect();
      }}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`rounded-2xl p-6 bg-[rgba(10,12,16,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.03)] cursor-pointer transform transition hover:-translate-y-1 ${
        selected === side ? "ring-2 ring-emerald-400 ring-opacity-25" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex-1 pr-4">
          <div className="text-xs text-slate-400">Option {side}</div>
          <div className="text-2xl font-semibold mt-1 text-slate-100">{side === "A" ? market?.optionA : market?.optionB}</div>

          <div className="mt-4">{percentVisual(percent, side === "A" ? "from-teal-400" : "from-indigo-500", side === "A" ? "to-blue-500" : "to-purple-500")}</div>

          <div className="mt-5">
            {mode === "amount" ? (
              <>
                <div className="flex items-center gap-4">
                  <input
                    aria-label={`exact amount ${side}`}
                    type="number"
                    min={1}
                    max={maxSlider}
                    value={exactAmt}
                    onChange={(e) => {
                      const v = Number(e.target.value || 0);
                      setExactAmt(v);
                      setSliderValue(v);
                    }}
                    className="w-36 bg-[rgba(255,255,255,0.03)] rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none border border-[rgba(255,255,255,0.03)]"
                  />

                  <div className="flex-1 relative">
                    <input
                      aria-label={`range ${side}`}
                      type="range"
                      min={1}
                      max={maxSlider}
                      value={sliderValue}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setSliderValue(v);
                        setExactAmt(v);
                      }}
                      onPointerDown={() => setShowTip(true)}
                      onPointerUp={() => setShowTip(false)}
                      onTouchStart={() => setShowTip(true)}
                      onTouchEnd={() => setShowTip(false)}
                      className="w-full h-2 appearance-none rounded-lg"
                      style={{ background: rangeBg }}
                    />

                    {showTip && (
                      <div className="pointer-events-none absolute -top-10" style={{ left: tipLeft, transform: "translateX(-50%)" }}>
                        <div className="px-2 py-1 rounded-md bg-[rgba(6,8,12,0.9)] border border-[rgba(255,255,255,0.04)] text-xs">₹{sliderValue}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-400 mt-3">Placing ₹{exactAmt}</div>
              </>
            ) : (
              <input
                aria-label={`write ${side}`}
                type="text"
                placeholder="Write your note..."
                value={writeText}
                onChange={(e) => setWriteText(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.03)] rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none border border-[rgba(255,255,255,0.03)]"
              />
            )}
          </div>
        </div>

        <div className="w-44 flex-shrink-0 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="radio" name="side" checked={selected === side} onChange={onSelect} className="accent-emerald-400 w-4 h-4" />
            <span className="text-sm text-slate-300">Select</span>
          </div>

          <button onClick={placeBid} className="w-full rounded-lg px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-500 font-semibold shadow">
            {mode === "amount" ? "Place" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}