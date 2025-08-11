/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

interface HeaderProps {
  hitNumber: number;
  timer: number;
  score: number;
  exitGame: () => void;
  startGame: () => void;
  toggleSound: () => void;
  soundEnabled: boolean;
  streak: number;
  multiplier: number;
}

const Header: React.FC<HeaderProps> = ({
  hitNumber,
  timer,
  score,
  exitGame,
  startGame,
  toggleSound,
  soundEnabled,
  streak,
  multiplier,
}) => {
  let bgColor = "#2F855A";
  let textColor = "#2F855A";

  if (score > 1000) {
    bgColor = "#B83280";
    textColor = "#D53F8C";
  } else if (score > 500) {
    bgColor = "#6B46C1";
    textColor = "#9F7AEA";
  } else if (score > 250) {
    bgColor = "#2C7A7B";
    textColor = "#38B2AC";
  }

  return (
    <div
      className="sticky top-0 z-10 flex flex-wrap justify-between items-center text-white px-3 sm:px-5 md:px-10 py-3 md:py-4 transition-colors duration-500 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-sm md:text-xl font-medium">Hit</h2>
        <div
          className="bg-white/90 backdrop-blur font-extrabold text-sm md:text-xl px-2.5 py-1 md:px-4 md:py-2 rounded-md shadow-sm"
          style={{ color: textColor }}
          aria-live="polite"
        >
          {hitNumber}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-sm md:text-xl font-medium">Timer</h2>
        <div
          className="bg-white/90 backdrop-blur font-semibold text-sm md:text-xl px-2.5 py-1 md:px-4 md:py-2 rounded-md shadow-sm"
          style={{ color: textColor }}
          aria-live="polite"
        >
          {timer}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-sm md:text-xl font-medium">Score</h2>
        <div
          className="bg-white/80 backdrop-blur font-extrabold text-sm md:text-xl px-2.5 py-1 md:px-4 md:py-2 rounded-md shadow-sm"
          style={{ color: textColor }}
          aria-live="polite"
        >
          {score}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-sm md:text-xl font-medium">Streak</h2>
        <div
          className="bg-white/80 backdrop-blur font-bold text-sm md:text-xl px-2.5 py-1 md:px-4 md:py-2 rounded-md shadow-sm"
          style={{ color: textColor }}
          aria-live="polite"
        >
          {streak}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-sm md:text-xl font-medium">Mult</h2>
        <div
          className="bg-white/90 backdrop-blur font-bold text-sm md:text-xl px-2.5 py-1 md:px-4 md:py-2 rounded-md shadow-sm"
          style={{ color: textColor }}
          aria-live="polite"
        >
          x{multiplier}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-0">
        <button
          className="bg-white/90 backdrop-blur font-semibold text-xs sm:text-sm md:text-base px-2.5 py-1 md:px-4 md:py-2 rounded hover:bg-white transition-colors duration-300 text-gray-800"
          onClick={exitGame}
        >
          Exit
        </button>
        <button
          className="bg-white/90 backdrop-blur font-semibold text-xs sm:text-sm md:text-base px-2.5 py-1 md:px-4 md:py-2 rounded hover:bg-white transition-colors duration-300 text-gray-800"
          onClick={toggleSound}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? "Mute" : "Unmute"}
        </button>
        <button
          className="bg-white/90 backdrop-blur font-semibold text-xs sm:text-sm md:text-base px-2.5 py-1 md:px-4 md:py-2 rounded hover:bg-white transition-colors duration-300 text-gray-800"
          onClick={startGame}
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default Header;
