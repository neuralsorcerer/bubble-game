/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

export type Difficulty = "easy" | "medium" | "hard";

/**
 * `daily` plays by Rush rules but on a seeded board everyone shares for the
 * day, so it is a mode for scoring and display purposes but never appears in
 * the mode picker.
 */
export type Mode = "rush" | "chill" | "daily";

/** Special bubbles. Every one of them is a reward — none ever punish. */
export type PowerKind = "star" | "clock" | "freeze" | "rainbow" | "nova";

export interface Bubble {
  id: number;
  value: number;
  /** Index into `BUBBLE_SKINS`; random per bubble so colour never leaks the answer. */
  skin: number;
  /** What the bubble shows. A number normally, a sum in math mode. */
  label: string;
  power: PowerKind | null;
  /** 0–1 seed used to de-synchronise idle animations. */
  seed: number;
  /** A spent bubble: left in place as an empty husk so nothing reflows. */
  dead: boolean;
}

export type PopTone = "hit" | "miss" | "power" | "level";

/** What a single tap produced, handed back to the view for floaters and sfx. */
export interface PopResult {
  tone: PopTone;
  label: string;
  points: number;
  /** Combo multiplier in force when the tap landed. */
  multiplier: number;
  power?: PowerKind;
  leveledUp?: boolean;
}

export interface RunStats {
  pops: number;
  misses: number;
  bestStreak: number;
  powers: number;
  level: number;
  /** Hottest tier the run reached. */
  maxHeat: number;
}

export type AchievementId =
  | "first-pop"
  | "century"
  | "thousand"
  | "combo-four"
  | "combo-max"
  | "score-1k"
  | "score-5k"
  | "level-ten"
  | "sharpshooter"
  | "flawless"
  | "power-hungry"
  | "hard-graft"
  | "daily-three"
  | "daily-seven"
  | "molten"
  | "mathlete";

export interface ScoreEntry {
  score: number;
  difficulty: Difficulty | null;
  mode: Mode | null;
  /** Math runs are scored on their own board, never mixed with plain ones. */
  math?: boolean;
  level: number;
  streak: number;
  at: number;
}
