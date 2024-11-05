import React from "react";
import Footer from "./Footer";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  restartGame: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  restartGame,
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
    <h1 className="text-4xl md:text-5xl font-bold text-red-600">Game Over</h1>
    <p className="text-xl md:text-2xl">Your Score: {score}</p>
    <p className="text-xl md:text-2xl">High Score: {highScore}</p>
    <button
      className="px-6 py-3 text-sm md:text-base bg-green-700 text-white rounded-full hover:bg-green-800 transition"
      onClick={restartGame}
    >
      Play Again
    </button>
    <Footer />
  </div>
);

export default GameOverScreen;
