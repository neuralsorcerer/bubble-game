/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Footer from "./Footer";
import Leaderboard from "./Leaderboard";
import { BackgroundLines } from "./ui/background-lines";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  leaderboard: number[];
  restartGame: () => void;
  goToStart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  leaderboard,
  restartGame,
  goToStart,
}) => (
  <BackgroundLines className="flex items-center justify-center w-full min-h-[calc(var(--vh)*100)] flex-col px-4">
    <div className="flex flex-col items-center justify-center min-h-[calc(var(--vh)*100)] text-center space-y-6 z-50">
      <div className="max-w-xl w-full bg-white/70 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-8 border border-white/40">
        <h1 className="text-4xl md:text-5xl font-extrabold text-rose-600">
          Game Over
        </h1>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/80 p-4 border border-white/40 shadow-sm">
            <p className="text-sm text-gray-500">Your Score</p>
            <p className="text-2xl font-bold text-gray-800">{score}</p>
          </div>
          <div className="rounded-xl bg-white/80 p-4 border border-white/40 shadow-sm">
            <p className="text-sm text-gray-500">High Score</p>
            <p className="text-2xl font-bold text-gray-800">{highScore}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button
            className="w-full px-6 py-3 text-sm md:text-base bg-emerald-600 text-white rounded-full hover:bg-emerald-700 active:scale-[0.99] transition shadow-lg"
            onClick={restartGame}
          >
            Play Again
          </button>
          <button
            className="w-full px-6 py-3 text-sm md:text-base bg-white text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-50 active:scale-[0.99] transition"
            onClick={goToStart}
          >
            Main Menu
          </button>
        </div>
        <Leaderboard scores={leaderboard} />
      </div>
      <Footer />
    </div>
  </BackgroundLines>
);

export default GameOverScreen;
