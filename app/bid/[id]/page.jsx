"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { SAMPLE } from "../../data/bids_data";
import SpotlightCard from "../../components/SpotlightCard";
import {
  calculateMarketPrices,
  incrementPrice,
  decrementPrice,
  formatPrice,
  PRICING_CONFIG,
} from "../../utils/pricing";

// The updated OrderPanel component
function OrderPanel({ market, balance, setBalance, pulseMessage }) {
  const [selectedOption, setSelectedOption] = useState("YES"); // 'YES' or 'NO'
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(null); // null means use market price

  // Calculate default market prices using centralized utility
  const marketPrices = market
    ? calculateMarketPrices(market.yesShare)
    : { yes: 0.5, no: 0.5 };

  // Get current price (custom or market)
  const getCurrentPrice = () => {
    if (customPrice !== null) {
      return customPrice;
    }
    return selectedOption === "YES" ? marketPrices.yes : marketPrices.no;
  };

  const currentPrice = getCurrentPrice();
  const cost = currentPrice * quantity;
  const potentialReturn = quantity * PRICING_CONFIG.MAX_PAYOUT;

  // Reset custom price when switching options
  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setCustomPrice(null); // Reset to market price when switching
  };

  // Price adjustment functions using centralized utilities
  const handleIncreasePrice = () => {
    const newPrice = incrementPrice(currentPrice);
    setCustomPrice(newPrice);
  };

  const handleDecreasePrice = () => {
    const newPrice = decrementPrice(currentPrice);
    setCustomPrice(newPrice);
  };

  const handlePlaceOrder = () => {
    if (!market) return;
    if (cost <= 0) return pulseMessage("Enter a valid quantity");
    if (cost > balance) return pulseMessage("Insufficient balance");

    setBalance((b) => b - cost);
    const optionText =
      selectedOption === "YES" ? market.optionA : market.optionB;
    const priceType = customPrice !== null ? "custom" : "market";
    pulseMessage(
      `Placed ₹${cost.toFixed(2)} on ${optionText} at ${priceType} price`
    );
    setQuantity(1);
    setCustomPrice(null); // Reset to market price after order
  };

  if (!market) {
    return (
      <div className="rounded-2xl p-6 bg-[rgba(8,10,15,0.55)] border-2 border-[rgba(255,255,255,0.08)] flex justify-center items-center h-80">
        <p className="text-slate-400">Loading order panel...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-[rgba(8,10,15,0.55)] border-2 border-[rgba(255,255,255,0.08)] shadow-lg">
      <h3 className="text-lg font-semibold text-slate-100 mb-6 text-center">
        Place Your Bet
      </h3>

      {/* YES/NO Toggle */}
      <div className="flex w-full gap-2 p-1 mb-6 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
        <button
          onClick={() => handleOptionChange("YES")}
          className={`w-1/2 py-3 rounded-lg font-semibold transition-all duration-300 ${
            selectedOption === "YES"
              ? "bg-green-500 text-white shadow-lg shadow-green-500/25 transform scale-[1.02]"
              : "bg-green-500/10 text-green-300 hover:bg-green-500/20"
          }`}
        >
          YES - ₹{formatPrice(marketPrices.yes)}
        </button>
        <button
          onClick={() => handleOptionChange("NO")}
          className={`w-1/2 py-3 rounded-lg font-semibold transition-all duration-300 ${
            selectedOption === "NO"
              ? "bg-red-500 text-white shadow-lg shadow-red-500/25 transform scale-[1.02]"
              : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
          }`}
        >
          NO - ₹{formatPrice(marketPrices.no)}
        </button>
      </div>

      {/* Main Controls */}
      <div className="w-full p-5 mb-6 rounded-xl border-2 border-[rgba(255,255,255,0.1)] space-y-5 bg-[rgba(6,8,12,0.6)]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-slate-300 font-medium">Price</span>
            {customPrice !== null && (
              <span className="text-xs text-amber-400">Custom Price</span>
            )}
          </div>
          <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
            <button
              onClick={handleDecreasePrice}
              className="px-2 text-xl font-light text-slate-400 hover:text-white transition-colors hover:bg-[rgba(255,255,255,0.1)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPrice <= PRICING_CONFIG.MIN_PRICE}
            >
              -
            </button>
            <span className="font-mono text-lg text-white w-20 text-center">
              ₹{formatPrice(currentPrice)}
            </span>
            <button
              onClick={handleIncreasePrice}
              className="px-2 text-xl font-light text-slate-400 hover:text-white transition-colors hover:bg-[rgba(255,255,255,0.1)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPrice >= PRICING_CONFIG.MAX_PRICE}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-medium">Quantity</span>
          <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-2 text-xl font-light text-slate-400 hover:text-white transition-colors hover:bg-[rgba(255,255,255,0.1)] rounded"
            >
              -
            </button>
            <span className="font-mono text-lg text-white w-20 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-2 text-xl font-light text-slate-400 hover:text-white transition-colors hover:bg-[rgba(255,255,255,0.1)] rounded"
            >
              +
            </button>
          </div>
        </div>

        {/* Price increment info */}
        <div className="text-center">
          <span className="text-xs text-slate-500">
            Price adjusts in ₹{formatPrice(PRICING_CONFIG.PRICE_INCREMENT)}{" "}
            increments
          </span>
        </div>

        {/* Price reset button */}
        {customPrice !== null && (
          <div className="flex justify-center">
            <button
              onClick={() => setCustomPrice(null)}
              className="text-xs text-slate-400 hover:text-slate-300 underline transition-colors"
            >
              Reset to market price
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="w-full p-4 mb-6 rounded-xl border border-[rgba(255,255,255,0.1)] text-center bg-[rgba(0,0,0,0.3)]">
        <div className="text-slate-300">
          <span>You Put - </span>
          <span className="font-semibold text-white">₹{cost.toFixed(2)}</span>
          <span className="text-slate-500 mx-3">|</span>
          <span>You get </span>
          <span className="font-semibold text-white">
            ₹{potentialReturn.toFixed(2)}
          </span>
        </div>
        {customPrice !== null && (
          <div className="text-xs text-amber-400 mt-1">
            Using custom price (Market: ₹
            {formatPrice(
              selectedOption === "YES" ? marketPrices.yes : marketPrices.no
            )}
            )
          </div>
        )}
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/30 transition-all duration-300 disabled:opacity-50 disabled:bg-gradient-to-r disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-[1.02]"
        disabled={cost > balance}
      >
        {cost > balance ? "Insufficient Balance" : "Place Order"}
      </button>
    </div>
  );
}

// AIResultsCard component (restored)
function AIResultsCard({ result }) {
  const getWinnerColor = (winner) => {
    if (winner === "A") return "#10b981"; // Green
    if (winner === "B") return "#f59e0b"; // Amber
    return "#6b7280"; // Gray for tie
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return { text: "High", color: "#10b981" };
    if (confidence >= 0.6) return { text: "Medium", color: "#f59e0b" };
    return { text: "Low", color: "#ef4444" };
  };

  const confidenceInfo = getConfidenceLevel(result.confidence);

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-600/50">
        <div>
          <h5 className="text-slate-400 text-sm font-medium mb-2">
            🏆 AI Prediction
          </h5>
          <div
            className="px-3 py-2 rounded-lg border text-center font-medium"
            style={{
              backgroundColor: `${getWinnerColor(result.winner)}20`,
              borderColor: getWinnerColor(result.winner),
              color: getWinnerColor(result.winner),
            }}
          >
            {result.winner === "Tie"
              ? "Too Close to Call"
              : result.winner === "A"
              ? result.optionA
              : result.optionB}
          </div>
        </div>
        <div>
          <h5 className="text-slate-400 text-sm font-medium mb-2">
            📈 Confidence
          </h5>
          <div
            className="px-3 py-2 rounded-lg border text-center font-medium"
            style={{
              backgroundColor: `${confidenceInfo.color}20`,
              borderColor: confidenceInfo.color,
              color: confidenceInfo.color,
            }}
          >
            {confidenceInfo.text} ({Math.round(result.confidence * 100)}%)
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-600/50">
        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
          💡 AI Reasoning
        </h5>
        <p className="text-slate-300 leading-relaxed">{result.reasoning}</p>
      </div>
      {result.market_insights && result.market_insights.length > 0 && (
        <div className="pt-4 border-t border-slate-600/50">
          <h5 className="text-white font-medium mb-3 flex items-center gap-2">
            🔍 Market Insights
          </h5>
          <ul className="space-y-2">
            {result.market_insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-300">
                <span className="text-blue-400 font-bold mt-1">•</span>
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
  const [message, setMessage] = useState(null);
  // Restored AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const mount = useRef(false);

  useEffect(() => {
    mount.current = true;
    async function load() {
      setLoadingMarket(true);
      try {
        const foundMarket = SAMPLE.find((market) => market.id === id);
        if (foundMarket) {
          const transformedMarket = {
            id: foundMarket.id,
            title: foundMarket.title,
            category: foundMarket.category,
            deadline: foundMarket.deadline,
            optionA: foundMarket.optionA,
            optionB: foundMarket.optionB,
            yesShare: foundMarket.yesShare,
            participants: foundMarket.participants,
            volume: foundMarket.volume || foundMarket.amount * 1000,
            context: `Market analysis for ${foundMarket.category.toLowerCase()} prediction`,
            marketNews: `Recent activity shows ${foundMarket.participants} participants with ${foundMarket.yesShare}% confidence.`,
            image: foundMarket.image,
          };
          setMarket(transformedMarket);
        } else {
          const res = await fetch(`/api/markets/${id}`);
          if (res.ok) {
            setMarket(await res.json());
          } else {
            setMarket(sampleMarket());
          }
        }
      } catch {
        setMarket(sampleMarket());
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
      document.documentElement.style.setProperty(
        "--mx",
        `${(e.clientX / window.innerWidth) * 100}%`
      );
      document.documentElement.style.setProperty(
        "--my",
        `${(e.clientY / window.innerHeight) * 100}%`
      );
    };
    window.addEventListener("pointermove", handle);
    return () => window.removeEventListener("pointermove", handle);
  }, []);

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

  // Restored runAi function
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

  return (
    <div className="min-w-screen min-h-screen bg-gradient-to-b from-[#00040a] via-[#02081a] to-[#000814] flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-[1600px]">
        <div className="rounded-3xl bg-[rgba(6,8,12,0.45)] border border-[rgba(255,255,255,0.04)] backdrop-blur-md shadow-[0_24px_60px_rgba(2,6,23,0.7)] overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6 p-7">
            {/* Left column - Main content */}
            <div className="md:col-span-2 space-y-7">
              {/* Header with title + balance */}
              <div className="rounded-2xl p-6 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)] flex items-start justify-between gap-6">
                <div className="flex-1 pr-6">
                  <div className="text-sm text-emerald-300 font-medium">
                    {market?.category ?? "Loading..."}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-slate-100">
                    {loadingMarket ? "Loading market…" : market?.title}
                  </h1>

                  {/* Market News moved here */}
                  <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-sm text-emerald-300 font-medium mb-2">
                      📰 Market News
                    </div>
                    <div className="text-slate-300 text-sm leading-relaxed">
                      {market?.marketNews || "No recent news available."}
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-300 max-w-prose">
                    {market?.context}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                    <div className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)]">
                      {market?.deadline ?? "—"}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)]">
                      {market?.participants ?? 0} participants
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[rgba(255,255,255,0.03)]">
                      Vol ₹{(market?.volume ?? 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Balance section */}
                <div className="w-72 text-right flex-shrink-0">
                  <div className="text-xs text-slate-400">Your balance</div>
                  <div className="mt-1 text-2xl font-bold text-slate-100 transition-colors duration-200">
                    {balance >= 0 ? `₹${balance.toFixed(2)}` : `-`}
                  </div>
                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => {
                        setBalance(1000);
                        pulseMessage("Balance reset to ₹1000");
                      }}
                      className="w-full rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.1)] text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="rounded-2xl p-6 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    🤖 Realtime AI's Market Analysis
                  </h3>
                  <button
                    onClick={runAi}
                    disabled={aiLoading}
                    className="flex items-center gap-3 px-8 py-3 bg-transparent border-2 border-amber-400 hover:border-amber-300 text-amber-400 hover:text-amber-300 font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:bg-amber-400/10 hover:shadow-lg hover:shadow-amber-400/20"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5">
                          <img
                            src="/premium.svg"
                            alt="Premium AI Analysis"
                            className="w-5 h-5"
                            style={{
                              filter:
                                "invert(77%) sepia(89%) saturate(1919%) hue-rotate(3deg) brightness(103%) contrast(107%)",
                            }}
                          />
                        </div>
                        <span>Run AI Analysis</span>
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      </>
                    )}
                  </button>
                </div>
                {aiResult && !aiResult.error && (
                  <AIResultsCard result={aiResult} />
                )}
                {aiResult?.error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <span className="text-red-400">❌</span>
                    <p className="text-red-300">
                      Failed to analyze: {aiResult.error}
                    </p>
                  </div>
                )}
                {!aiResult && !aiLoading && (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-4xl mb-4">🔮</div>
                    <p>
                      Click "Run AI Analysis" to get AI-powered predictions for
                      this market
                    </p>
                  </div>
                )}
              </div>

              {/* Discussion section */}
              <div className="rounded-2xl p-6 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)]">
                <h3 className="text-lg font-semibold text-slate-100 mb-3">
                  💬 Discussion & Context
                </h3>
                <div className="text-slate-300 leading-relaxed">
                  This market bundles short-term news and available context.
                  Place small bets, watch how the percentages react to new
                  information, and keep your exposure controlled.
                </div>
              </div>
            </div>

            {/* Right column - Order panel and stats */}
            <aside className="space-y-6 sticky top-6 self-start">
              {/* Order Panel moved here */}
              <OrderPanel
                market={market}
                balance={balance}
                setBalance={setBalance}
                pulseMessage={pulseMessage}
              />

              {/* Quick Stats */}
              <div className="rounded-2xl p-5 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)]">
                <div className="text-sm text-slate-400 mb-4">
                  📊 Quick Stats
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <div>Market ID</div>
                    <div className="font-mono text-xs bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">
                      {market?.id ?? id}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Participants</div>
                    <div className="font-semibold">
                      {market?.participants ?? 0}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Volume</div>
                    <div className="font-semibold">
                      ₹{(market?.volume ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Expires</div>
                    <div className="text-orange-400">
                      {market?.deadline ?? "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl p-5 bg-[rgba(8,10,15,0.55)] border border-[rgba(255,255,255,0.03)]">
                <div className="text-sm text-slate-400 mb-4">
                  ⚡ Recent Activity
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span>Bid placed</span>
                    <span className="text-green-400 font-semibold">
                      ₹{market?.amount ?? 200}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Market created</span>
                    <span className="text-slate-400">2h ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>AI update</span>
                    <span className="text-amber-400">5m ago</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Upcoming Bids Section */}
        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-[1480px] rounded-3xl p-6 bg-[rgba(6,8,12,0.45)] border border-[rgba(255,255,255,0.03)] backdrop-blur-md shadow-lg">
            <h4 className="text-sm text-slate-300 mb-5">🔮 Upcoming Bids</h4>
            <div className="overflow-x-auto py-3">
              <div className="flex gap-8 min-w-max">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[380px] p-6 rounded-xl bg-[rgba(10,12,16,0.65)] border border-[rgba(255,255,255,0.03)] backdrop-blur-md transform transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="text-xs text-slate-400">Bid #{i + 1}</div>
                    <div className="mt-3 font-semibold text-slate-100">
                      {i % 2 === 0 ? market?.optionA : market?.optionB}
                    </div>
                    <div className="mt-1 text-sm text-slate-300">
                      Amount: ₹{(i + 1) * 75}
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                      By user{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Message notification */}
        {message && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 px-6 py-3 rounded-xl bg-[rgba(0,0,0,0.9)] border border-[rgba(255,255,255,0.1)] text-white shadow-lg backdrop-blur-md">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
