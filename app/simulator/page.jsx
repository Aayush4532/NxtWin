"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function SimulatorPage() {
  // Global State
  const [yesOrders, setYesOrders] = useState([]);
  const [noOrders, setNoOrders] = useState([]);
  const [totalPool, setTotalPool] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [orderIdCounter, setOrderIdCounter] = useState(0);
  const [proboFee, setProboFee] = useState(2);
  const [totalFeesCollected, setTotalFeesCollected] = useState(0);
  const [currentMarketPrice, setCurrentMarketPrice] = useState(null);
  const [newBetsLog, setNewBetsLog] = useState([
    "All newly placed bets will be logged here.",
  ]);
  const [matchedOrdersLog, setMatchedOrdersLog] = useState([
    "All matched orders will be logged here.",
  ]);

  // Form state
  const [yesBets, setYesBets] = useState(100);
  const [yesPriceSlider, setYesPriceSlider] = useState(5.0);
  const [noBets, setNoBets] = useState(100);
  const [noPriceSlider, setNoPriceSlider] = useState(5.0);

  // Function to create a unique ID for each order
  const getUniqueId = useCallback(() => {
    setOrderIdCounter((prev) => prev + 1);
    return `order-${orderIdCounter}`;
  }, [orderIdCounter]);

  // Log functions
  const logNewBet = useCallback((message) => {
    setNewBetsLog((prev) => [message, ...prev].slice(0, 50));
  }, []);

  const logMatchedOrder = useCallback((message) => {
    setMatchedOrdersLog((prev) => [message, ...prev].slice(0, 50));
  }, []);

  // Core matching logic
  const matchOrders = useCallback(() => {
    const yesOrdersCopy = [...yesOrders].sort((a, b) => b.price - a.price);
    const noOrdersCopy = [...noOrders].sort((a, b) => a.price - b.price);

    let i = 0;
    let j = 0;
    const matchedOrders = [];

    while (i < yesOrdersCopy.length && j < noOrdersCopy.length) {
      const yesOrder = yesOrdersCopy[i];
      const noOrder = noOrdersCopy[j];

      if (yesOrder.price + noOrder.price === 10) {
        matchedOrders.push({ yes: yesOrder, no: noOrder });
        i++;
        j++;
      } else if (yesOrder.price + noOrder.price > 10) {
        i++;
      } else {
        j++;
      }
    }

    if (matchedOrders.length > 0) {
      const yesIdsToRemove = new Set(matchedOrders.map((m) => m.yes.id));
      const noIdsToRemove = new Set(matchedOrders.map((m) => m.no.id));

      setYesOrders((prev) =>
        prev.filter((order) => !yesIdsToRemove.has(order.id))
      );
      setNoOrders((prev) =>
        prev.filter((order) => !noIdsToRemove.has(order.id))
      );

      logMatchedOrder(`Successfully matched ${matchedOrders.length} orders.`);
      setCurrentMarketPrice(matchedOrders[matchedOrders.length - 1].yes.price);
      setTotalPool((prev) => prev + matchedOrders.length * 10);
      setMatchedCount((prev) => prev + matchedOrders.length);
      setTotalFeesCollected(
        (prev) => prev + (proboFee / 100) * matchedOrders.length * 10
      );
    } else {
      logMatchedOrder(`No new matches were found in this round.`);
    }
  }, [yesOrders, noOrders, proboFee, logMatchedOrder]);

  // Function to place a bulk of bets
  const placeBulkBets = useCallback(
    (type, count, centerPrice) => {
      const newOrders = [];
      const roundedPrice = Math.round(centerPrice * 2) / 2;

      for (let i = 0; i < count; i++) {
        newOrders.push({
          id: getUniqueId(),
          type: type,
          price: Math.max(0.5, Math.min(9.5, roundedPrice)),
        });
      }

      if (type === "yes") {
        setYesOrders((prev) => [...prev, ...newOrders]);
        logNewBet(`Placed ${count} 'YES' bets at ₹${roundedPrice.toFixed(1)}.`);
      } else {
        setNoOrders((prev) => [...prev, ...newOrders]);
        logNewBet(`Placed ${count} 'NO' bets at ₹${roundedPrice.toFixed(1)}.`);
      }
    },
    [getUniqueId, logNewBet]
  );

  // Order book depth calculation
  const getOrderBookDepth = useCallback(() => {
    const yesPrices = {};
    const noPrices = {};

    yesOrders.forEach(
      (order) => (yesPrices[order.price] = (yesPrices[order.price] || 0) + 1)
    );
    noOrders.forEach(
      (order) =>
        (noPrices[10 - order.price] = (noPrices[10 - order.price] || 0) + 1)
    );

    const allPossiblePrices = Array.from(
      { length: 19 },
      (_, i) => 0.5 + i * 0.5
    ).reverse();
    const maxOrders = Math.max(
      ...Object.values(yesPrices),
      ...Object.values(noPrices),
      1
    );

    return allPossiblePrices.map((price) => ({
      price,
      yesCount: yesPrices[price] || 0,
      noCount: noPrices[price] || 0,
      yesWidth: ((yesPrices[price] || 0) / maxOrders) * 100,
      noWidth: ((noPrices[price] || 0) / maxOrders) * 100,
    }));
  }, [yesOrders, noOrders]);

  // Event handlers
  const handlePlaceYesBets = () => {
    if (yesBets > 0 && yesPriceSlider >= 0.5 && yesPriceSlider <= 9.5) {
      placeBulkBets("yes", yesBets, yesPriceSlider);
    } else {
      logNewBet(
        "Invalid input for Yes bets. Number must be > 0 and price between 0.5 and 9.5."
      );
    }
  };

  const handlePlaceNoBets = () => {
    if (noBets > 0 && noPriceSlider >= 0.5 && noPriceSlider <= 9.5) {
      placeBulkBets("no", noBets, noPriceSlider);
    } else {
      logNewBet(
        "Invalid input for No bets. Number must be > 0 and price between 0.5 and 9.5."
      );
    }
  };

  const handleUpdateFee = () => {
    logNewBet(`Probo Fee updated to ${proboFee}%.`);
  };

  // Sync sliders and recommended prices on market price change
  useEffect(() => {
    if (currentMarketPrice !== null) {
      setYesPriceSlider(currentMarketPrice);
      setNoPriceSlider(10 - currentMarketPrice);
    }
  }, [currentMarketPrice]);

  useEffect(() => {
    matchOrders();
  }, [yesOrders, noOrders, matchOrders]);

  const orderBookDepth = getOrderBookDepth();
  const probability =
    currentMarketPrice !== null ? (currentMarketPrice * 10).toFixed(0) : 50;

  return (
    <>
      <title>Probo Trading Simulator</title>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <style>{`
        .order-book-row {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }
        .order-book-bar {
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 0.375rem;
            transition: width 0.3s ease-in-out;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            white-space: nowrap;
            overflow: hidden;
        }
        .order-book-bar.yes-side {
            background-color: #10b981; /* Green for 'Yes' */
        }
        .order-book-bar.no-side {
            background-color: #ef4444; /* Red for 'No' */
        }
        .order-book-bar-container {
            display: flex;
            height: 100%;
        }
        .range-slider-container {
            position: relative;
            width: 100%;
        }
        .range-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 10px;
            background: #4a5568; /* Darker slider track */
            outline: none;
            opacity: 0.7;
            transition: opacity .2s;
            border-radius: 5px;
        }
        .range-slider:hover {
            opacity: 1;
        }
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #63b3ed; /* Lighter thumb for dark theme */
            cursor: pointer;
            border-radius: 50%;
        }
        .range-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #63b3ed; /* Lighter thumb for dark theme */
            cursor: pointer;
            border-radius: 50%;
            border: none;
        }
        /* Style for the value display above the slider */
        .slider-value {
            position: absolute;
            top: -25px;
            transform: translateX(-50%);
            background-color: #63b3ed; /* Lighter value box */
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
            white-space: nowrap;
        }
      `}</style>
      <div className="p-4 bg-gray-900 text-gray-200 min-h-screen flex items-center justify-center font-['Inter']">
        <div className="container mx-auto p-8 bg-gray-800 shadow-xl rounded-2xl max-w-5xl">
          <h1 className="text-3xl font-bold text-center mb-6 text-white"></h1>
          <p className="text-center text-gray-400 mb-8">‎</p>

          {/* Live Data Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
            <div className="p-4 bg-gray-700 text-white rounded-lg shadow-md">
              <p className="text-xl font-bold">₹{totalPool.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Total Pool Value</p>
            </div>
            <div className="p-4 bg-yellow-500 text-white rounded-lg shadow-md">
              <p className="text-xl font-bold">
                ₹{totalFeesCollected.toFixed(2)}
              </p>
              <p className="text-sm text-gray-200">Fees Collected</p>
            </div>
            <div className="p-4 bg-gray-700 text-white rounded-lg shadow-md">
              <p className="text-xl font-bold">{yesOrders.length}</p>
              <p className="text-sm text-gray-400">Pending 'Yes' Bets</p>
            </div>
            <div className="p-4 bg-gray-700 text-white rounded-lg shadow-md">
              <p className="text-xl font-bold">{noOrders.length}</p>
              <p className="text-sm text-gray-400">Pending 'No' Bets</p>
            </div>
            <div className="p-4 bg-green-500 text-white rounded-lg shadow-md">
              <p className="text-xl font-bold">{matchedCount}</p>
              <p className="text-sm text-gray-200">Matched Orders</p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-purple-600 text-white rounded-lg shadow-md text-center">
            <p className="text-2xl font-bold">{probability}%</p>
            <p className="text-sm text-gray-200">Probability of YES</p>
          </div>

          {/* Bet Controls */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Yes Bet Control */}
            <div className="bg-gray-700 p-6 rounded-xl shadow-inner">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">
                Place 'Yes' Bets
              </h2>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                Recommended Price:{" "}
                <span>₹{currentMarketPrice?.toFixed(1) || "5.0"}</span>
              </h3>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Number of Bets
                </label>
                <input
                  type="number"
                  value={yesBets}
                  onChange={(e) => setYesBets(parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-4">
                  Target Price (₹0.5-₹9.5)
                </label>
                <div className="range-slider-container">
                  <input
                    type="range"
                    className="range-slider"
                    min="0.5"
                    max="9.5"
                    value={yesPriceSlider}
                    step="0.5"
                    onChange={(e) =>
                      setYesPriceSlider(parseFloat(e.target.value))
                    }
                  />
                  <div
                    className="slider-value"
                    style={{
                      left: `calc(${((yesPriceSlider - 0.5) / 9).toFixed(
                        2
                      )} * 100%)`,
                    }}
                  >
                    ₹{yesPriceSlider.toFixed(1)}
                  </div>
                </div>
              </div>
              <button
                onClick={handlePlaceYesBets}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-green-700 transition-colors"
              >
                Place Yes Bets
              </button>
            </div>

            {/* No Bet Control */}
            <div className="bg-gray-700 p-6 rounded-xl shadow-inner">
              <h2 className="text-2xl font-semibold mb-4 text-red-400">
                Place 'No' Bets
              </h2>
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                Recommended Price:{" "}
                <span>
                  ₹
                  {currentMarketPrice
                    ? (10 - currentMarketPrice).toFixed(1)
                    : "5.0"}
                </span>
              </h3>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">
                  Number of Bets
                </label>
                <input
                  type="number"
                  value={noBets}
                  onChange={(e) => setNoBets(parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-4">
                  Target Price (₹0.5-₹9.5)
                </label>
                <div className="range-slider-container">
                  <input
                    type="range"
                    className="range-slider"
                    min="0.5"
                    max="9.5"
                    value={noPriceSlider}
                    step="0.5"
                    onChange={(e) =>
                      setNoPriceSlider(parseFloat(e.target.value))
                    }
                  />
                  <div
                    className="slider-value"
                    style={{
                      left: `calc(${((noPriceSlider - 0.5) / 9).toFixed(
                        2
                      )} * 100%)`,
                    }}
                  >
                    ₹{noPriceSlider.toFixed(1)}
                  </div>
                </div>
              </div>
              <button
                onClick={handlePlaceNoBets}
                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-red-700 transition-colors"
              >
                Place No Bets
              </button>
            </div>
          </div>

          {/* Probo Settings */}
          <div className="bg-gray-700 p-6 rounded-xl shadow-inner mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Probo Settings
            </h2>
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Probo Fee (%)</label>
              <input
                type="number"
                value={proboFee}
                onChange={(e) => setProboFee(parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="w-full p-2 border border-gray-600 rounded-lg bg-gray-900 text-white"
              />
            </div>
            <button
              onClick={handleUpdateFee}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors"
            >
              Update Fee
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Order Book Depth Graph */}
            <div className="bg-gray-700 p-6 rounded-xl shadow-inner">
              <h2 className="text-xl font-semibold mb-4 text-gray-200">
                Order Book Depth
              </h2>
              <div className="max-h-96 overflow-y-auto">
                {orderBookDepth.map((item, index) => (
                  <div key={index} className="order-book-row">
                    <div className="order-book-bar-container justify-end">
                      <div
                        className="order-book-bar yes-side"
                        style={{
                          width: `${item.yesWidth}%`,
                          minWidth: item.yesCount > 0 ? "2rem" : "0",
                        }}
                      >
                        {item.yesCount > 0 ? item.yesCount : ""}
                      </div>
                    </div>
                    <span className="font-bold text-gray-400 text-center text-sm">
                      ₹{item.price.toFixed(1)}
                    </span>
                    <div className="order-book-bar-container justify-start">
                      <div
                        className="order-book-bar no-side"
                        style={{
                          width: `${item.noWidth}%`,
                          minWidth: item.noCount > 0 ? "2rem" : "0",
                        }}
                      >
                        {item.noCount > 0 ? item.noCount : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulation Logs */}
            <div className="grid grid-rows-2 gap-4">
              {/* New Bets Log */}
              <div className="bg-gray-700 p-6 rounded-xl shadow-inner overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  New Bets Log
                </h2>
                <div className="text-sm text-gray-400 space-y-1">
                  {newBetsLog.map((log, index) => (
                    <p key={index}>{log}</p>
                  ))}
                </div>
              </div>
              {/* Matched Orders Log */}
              <div className="bg-gray-700 p-6 rounded-xl shadow-inner overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                  Matched Orders Log
                </h2>
                <div className="text-sm text-gray-400 space-y-1">
                  {matchedOrdersLog.map((log, index) => (
                    <p key={index}>{log}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
