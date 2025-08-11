/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

interface LeaderboardProps {
  scores: number[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores }) => (
  <div className="mt-6 text-left">
    <h3 className="text-lg md:text-xl font-semibold text-emerald-700 mb-2">
      Your Top 5 Scores
    </h3>
    {scores.length === 0 ? (
      <p className="text-sm md:text-base text-gray-600">No scores yet</p>
    ) : (
      <ol className="list-decimal list-inside text-sm md:text-base text-gray-700 space-y-1">
        {scores.map((score, index) => (
          <li key={index} className="font-medium">
            {score}
          </li>
        ))}
      </ol>
    )}
  </div>
);

export default Leaderboard;
