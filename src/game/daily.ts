/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { DIFFICULTY_ORDER } from "./config";
import { dayKey, hashSeed } from "./rng";
import type { Difficulty } from "./types";

export interface DailyChallenge {
  /** `YYYY-MM-DD` in the player's own timezone. */
  day: string;
  /** Feeds the run's RNG, so every player gets the same boards today. */
  seed: number;
  difficulty: Difficulty;
  /** Every third day the daily is played in math mode. */
  math: boolean;
  /** e.g. "Tue 2 Sep" — for the card on the menu. */
  label: string;
}

/**
 * Derives today's challenge purely from the date, so no server is involved and
 * two devices on the same calendar day agree without talking to each other.
 */
export const challengeFor = (date = new Date()): DailyChallenge => {
  const day = dayKey(date);
  const seed = hashSeed(`bubble-game:${day}`);

  return {
    day,
    seed,
    // The difficulty rotates so the daily never gets stale.
    difficulty: DIFFICULTY_ORDER[seed % DIFFICULTY_ORDER.length] as Difficulty,
    // Roughly every third day turns the daily into a mental-arithmetic run.
    math: Math.floor(seed / DIFFICULTY_ORDER.length) % 3 === 0,
    label: new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date),
  };
};
