/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import Footer from "./Footer";
import { BackgroundLines } from "./ui/background-lines";
import {
  Trophy,
  Feather,
  Gauge,
  Flame,
  Target,
  PlusCircle,
  MinusCircle,
  Timer,
} from "lucide-react";

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
  <BackgroundLines className="flex items-center justify-center w-full min-h-[calc(var(--vh)*100)] flex-col px-4">
    <div className="flex flex-col items-center justify-start md:justify-center h-[calc(var(--vh)*100)] w-full text-center px-4 z-50 overflow-y-auto overscroll-contain pt-4 md:pt-0 pb-[calc(env(safe-area-inset-bottom)+72px)] no-scrollbar">
      <div className="max-w-xl w-full rounded-3xl bg-white/70 backdrop-blur p-6 md:p-8 border border-emerald-100 shadow-2xl">
        <span className="inline-block text-[11px] tracking-wider uppercase bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 mb-3">
          Reflex • Fun • Fast
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700 mb-2">
          Bubble Game
        </h1>
        <p className="text-sm md:text-base text-gray-600 mb-6">
          Pop bubbles matching the Hit Number before the timer runs out.
        </p>

        <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 w-fit mx-auto mb-5">
          <Trophy size={16} />
          <span className="text-sm">High Score:</span>
          <span className="font-semibold">{highScore}</span>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-emerald-700">
            Select Difficulty
          </h2>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {levels.map((level) => {
              const isActive = difficulty === level;
              const Icon =
                level === "easy" ? Feather : level === "medium" ? Gauge : Flame;
              const label = level.charAt(0).toUpperCase() + level.slice(1);
              return (
                <button
                  key={level}
                  className={`group flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow"
                      : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400"
                  }`}
                  onClick={() => setDifficulty(level)}
                >
                  <Icon
                    className={isActive ? "text-white" : "text-emerald-600"}
                    size={20}
                  />
                  <span className="text-sm font-medium">{label}</span>
                  <span
                    className={`text-[11px] ${
                      isActive ? "text-emerald-100" : "text-emerald-500"
                    }`}
                  >
                    {level === "easy"
                      ? "60s"
                      : level === "medium"
                      ? "30s"
                      : "10s"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="mt-6 w-full px-6 py-3 text-sm md:text-base bg-emerald-600 text-white rounded-full hover:bg-emerald-700 active:scale-[0.99] transition shadow-lg"
          onClick={startGame}
        >
          Start Game
        </button>

        <div className="mt-6 text-left">
          <h3 className="text-lg md:text-xl font-semibold text-emerald-700 mb-2">
            How to Play
          </h3>
          <ul className="space-y-2 text-sm md:text-base text-gray-700">
            <li className="flex items-start gap-2">
              <Target className="mt-[2px] text-emerald-600" size={16} />
              <span>
                <span className="font-semibold">Objective:</span> Click bubbles
                containing the <strong>Hit Number</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <PlusCircle className="mt-[2px] text-emerald-600" size={16} />
              <span>
                <span className="font-semibold">Score:</span> +10 for each
                correct hit.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Timer className="mt-[2px] text-emerald-600" size={16} />
              <span>
                <span className="font-semibold">Time:</span> +2s per correct
                hit. -1s per incorrect hit.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <MinusCircle className="mt-[2px] text-emerald-600" size={16} />
              <span>
                <span className="font-semibold">Penalty:</span> -5 for incorrect
                clicks.
              </span>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  </BackgroundLines>
);

export default StartScreen;
