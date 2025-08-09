"use client";
import React from "react";
import Aurora from "./Aurora";
import RippleGrid from "./RippleGrid";
import Link from "next/link";
import Footer from "./layout/Footer";
import CardSwap, { Card } from "./CardSwap";
import InfiniteScroll from "./InfiniteScroll";

const Home = () => {
  const items = [
    { content: <p>📊 AI predicts a 78% chance of Team A winning tonight!</p> },
    { content: <p>💰 Big Win! User123 just earned ₹50,000 on Probo.</p> },
    {
      content: (
        <p>📈 Cricket market trending upwards, join before the close!</p>
      ),
    },
    {
      content: (
        <p>🎯 “AI nailed my predictions last week” – Real User Review</p>
      ),
    },
    {
      content: (
        <p>📰 Breaking: Bitcoin crosses $80,000 – open a position now!</p>
      ),
    },
    { content: <p>⚡ Lightning-fast betting with zero downtime</p> },
    {
      content: (
        <p>💡 Tip: Diversify your portfolio with AI-driven suggestions</p>
      ),
    },
    { content: <p>📊 Market depth charts now live for all categories</p> },
    { content: <p>🎮 Esports predictions with real-time odds</p> },
    { content: <p>🚀 New “Quick Bet” feature just launched</p> },
  ];

  return (
    <div>
      <main className="relative w-screen h-screen flex items-center justify-center overflow-hidden text-white">
        <div className="landing-page w-full h-full">
          {/* Aurora background */}
          <Aurora
            colorStops={["#92d5e0", "#92ace0", "#99c2b6"]}
            blend={0.5}
            amplitude={0.7}
            speed={0.7}
          />

          {/* Ripple grid background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <RippleGrid
              enableRainbow={false}
              gridColor="#000000"
              rippleIntensity={0.04}
              gridSize={5}
              gridThickness={20}
              mouseInteraction={true}
              mouseInteractionRadius={1.2}
              opacity={0.9}
            />
          </div>

          {/* Foreground: Hero section */}
          <div
            className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full"
            style={{ minHeight: "500px" }}
          >
            {/* Left: Text and CTA */}
            <section className="flex-1 flex flex-col items-center justify-center px-6 md:items-end md:text-right">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Probo – Bet Smarter with AI
              </h1>
              <p className="text-lg mb-6 text-gray-200">
                Real-time predictions. Intelligent insights. Bigger wins.
              </p>
              <Link href="/sign-in">
                <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition">
                  Get Started
                </button>
              </Link>
            </section>

            {/* Right: Card Swap */}
            <div className="flex-1 flex items-center justify-center px-6">
              <div
                style={{
                  height: "400px",
                  width: "100%",
                  maxWidth: "400px",
                  position: "relative",
                }}
              >
                <CardSwap
                  cardDistance={60}
                  verticalDistance={70}
                  delay={5000}
                  pauseOnHover={false}
                >
                  <Card>
                    <div className="p-6 bg-card rounded-lg border">
                      <h3 className="text-lg font-semibold mb-2">
                        Advanced AI Prediction
                      </h3>
                      <img src={"/AI.png"} className="mt-4 rounded-lg" />
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6 bg-card rounded-lg border">
                      <h3 className="text-lg font-semibold mb-2">
                        One Stop Portfolio
                      </h3>
                      <img src={"/dashboard.png"} className="mt-4 rounded-lg" />
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6 bg-card rounded-lg border">
                      <h3 className="text-lg font-semibold mb-2">
                        Category News
                      </h3>
                      <img
                        src={"/categories.png"}
                        className="mt-4 rounded-lg"
                      />
                    </div>
                  </Card>
                </CardSwap>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Scrolling news + text */}
      <div className="min-h-20"></div>
      <div
        style={{
          height: "500px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          padding: "2rem",
        }}
      >
        {/* Left: Infinite Scroll with fade mask */}
        <div
          style={{
            flex: "1 1 50%",
            height: "100%",
            position: "relative",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0))",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0))",
            maskRepeat: "no-repeat",
            maskSize: "100% 100%",
          }}
        >
          <InfiniteScroll
            items={items}
            isTilted={true}
            autoplay={true}
            autoplaySpeed={0.5}
            autoplayDirection="down"
            pauseOnHover={false}
          />
        </div>

        {/* Right: Text section */}
        <div style={{ flex: "1 1 50%", color: "white" }}>
          <h2 className="text-2xl font-bold mb-4">Stay Ahead of the Market</h2>
          <p className="mb-4 text-gray-300">
            Get live updates on sports, crypto, politics, and more — all powered
            by our cutting-edge AI. Whether you’re betting on the next cricket
            match or predicting the stock market, Probo keeps you informed and
            ready.
          </p>
          <p className="mb-4 text-gray-300">
            Join thousands of users who trust Probo for accurate, real-time
            predictions and seamless betting experiences.
          </p>
          <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition">
            Learn More
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="min-h-50"></div>
      <Footer />
    </div>
  );
};

export default Home;
