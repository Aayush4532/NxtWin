"use client";
import React, { useState } from 'react';

export default function BiddingPage() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [aiPrediction, setAiPrediction] = useState(null);

  const handleAICheck = () => {
    // Mock AI prediction
    setAiPrediction({
      probability: "Virat Kohli Century: 72%",
      reasoning: "Based on recent form, pitch conditions, and historical data from similar matches."
    });
  };

  const options = [
    { id: 1, text: 'Yes, Kohli will score a century', percentage: 64 },
    { id: 2, text: 'No, Kohli will not score a century', percentage: 36 }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Virat Kohli Century Prediction</h1>

      <div className="bg-gray-800 w-full max-w-4xl rounded-2xl p-6 shadow-lg">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setSelectedOption(opt.id)}
            className={`cursor-pointer p-4 rounded-xl mb-4 transition-colors duration-300 ${
              selectedOption === opt.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="flex justify-between">
              <span>{opt.text}</span>
              <span>{opt.percentage}% users</span>
            </div>
          </div>
        ))}

        <button
          onClick={handleAICheck}
          className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-lg font-semibold transition-colors duration-300"
        >
          Get AI Probability
        </button>

        {aiPrediction && (
          <div className="mt-6 bg-gray-700 p-4 rounded-xl">
            <p className="text-lg font-bold">AI Prediction:</p>
            <p>{aiPrediction.probability}</p>
            <p className="mt-2 text-sm text-gray-300">Reasoning: {aiPrediction.reasoning}</p>
          </div>
        )}
      </div>
    </div>
  );
}