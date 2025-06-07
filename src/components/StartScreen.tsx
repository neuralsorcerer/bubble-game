import React from "react";
import Footer from "./Footer";
import { BackgroundLines } from "./ui/background-lines";

const levels = ["easy", "medium", "hard"] as const;
type DifficultyLevel = (typeof levels)[number];

interface StartScreenProps {
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;
  startGame: () => void;
  highScore: number;
}

const StartScreen: React.FC<StartScreenProps> = ({
  difficulty,
  setDifficulty,
  startGame,
  highScore,
}) => (
  <BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4">
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 px-4 z-50">
      <h1 className="text-4xl md:text-5xl font-bold text-green-700">
        Welcome to Bubble Game
      </h1>
      <div>
        <h2 className="text-xl md:text-2xl">Select Difficulty</h2>
        <div className="flex justify-center space-x-4 mt-2">
          {levels.map((level) => (
            <button
              key={level}
              className={`px-4 py-2 text-sm md:text-base rounded ${
                difficulty === level
                  ? "bg-green-700 text-white"
                  : "bg-white text-green-700"
              } hover:bg-green-600 hover:text-white transition`}
              onClick={() => setDifficulty(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <button
        className="px-6 py-3 text-sm md:text-base bg-green-700 text-white rounded-full hover:bg-green-800 transition"
        onClick={startGame}
      >
        Start Game
      </button>
      <p className="text-sm md:text-lg">High Score: {highScore}</p>

      <div className="mt-8 max-w-md text-left">
        <h3 className="text-lg md:text-xl font-semibold text-green-700 mb-2">
          How to Play:
        </h3>
        <ul className="list-disc list-inside text-sm md:text-base text-gray-700 space-y-1">
          <li>
            <span className="font-semibold">Objective:</span> Find and click on
            the bubbles containing the <strong>Hit Number</strong>.
          </li>
          <li>
            <span className="font-semibold">Score Points:</span> Earn{" "}
            <strong>10 points</strong> for each correct bubble.
          </li>
          <li>
            <span className="font-semibold">Time Bonus:</span> Gain{" "}
            <strong>+2 seconds</strong> for each correct click.
          </li>
          <li>
            <span className="font-semibold">Penalties:</span> Lose{" "}
            <strong>5 points</strong> for incorrect clicks.
          </li>
          <li>
            <span className="font-semibold">Game Over:</span> The game ends when
            the timer reaches zero.
          </li>
        </ul>
      </div>
      <Footer />
    </div>
  </BackgroundLines>
);

export default StartScreen;
