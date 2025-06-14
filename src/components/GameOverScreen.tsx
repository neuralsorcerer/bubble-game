import React from "react";
import Footer from "./Footer";
import Leaderboard from "./Leaderboard";
import { BackgroundLines } from "./ui/background-lines";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  leaderboard: number[];
  restartGame: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  leaderboard,
  restartGame,
}) => (
  <BackgroundLines className="flex items-center justify-center w-full h-full flex-col px-4">
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 z-50">
      <h1 className="text-4xl md:text-5xl font-bold text-red-600">Game Over</h1>
      <p className="text-xl md:text-2xl">Your Score: {score}</p>
      <p className="text-xl md:text-2xl">High Score: {highScore}</p>
      <button
        className="px-6 py-3 text-sm md:text-base bg-green-700 text-white rounded-full hover:bg-green-800 transition"
        onClick={restartGame}
      >
        Play Again
      </button>
      <Leaderboard scores={leaderboard} />
      <Footer />
    </div>
  </BackgroundLines>
);

export default GameOverScreen;
