/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

/** A source of randomness in [0, 1). `Math.random` satisfies it. */
export type Rng = () => number;

/**
 * mulberry32 — small, fast and well distributed. Seeded runs replay the exact
 * same boards, which is what makes a shared daily challenge fair.
 */
export const seededRng = (seed: number): Rng => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** FNV-1a, so a date string becomes a stable 32-bit seed. */
export const hashSeed = (text: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/**
 * Today's key in the player's own timezone, `YYYY-MM-DD`. Local rather than
 * UTC so "today's challenge" lines up with the player's actual day.
 */
export const dayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Whether `previous` is the calendar day immediately before `current`. */
export const isPreviousDay = (previous: string, current: string) => {
  const before = new Date(`${current}T00:00:00`);
  before.setDate(before.getDate() - 1);
  return dayKey(before) === previous;
};

export const randomInt = (rng: Rng, maxExclusive: number) =>
  Math.floor(rng() * maxExclusive);
