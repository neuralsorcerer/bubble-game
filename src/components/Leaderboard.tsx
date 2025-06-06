import React from "react";

interface LeaderboardProps {
  scores: number[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores }) => (
  <div className="mt-4">
    <h3 className="text-lg md:text-xl font-semibold text-green-700 mb-2">
      Your top 5 Scores (All Difficulty Levels)
    </h3>
    {scores.length === 0 ? (
      <p className="text-sm md:text-base text-gray-700">No scores yet</p>
    ) : (
      <ol className="list-decimal list-inside text-sm md:text-base text-gray-700 space-y-1">
        {scores.map((score, index) => (
          <li key={index}>{score}</li>
        ))}
      </ol>
    )}
  </div>
);

export default Leaderboard;
