/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import type { Difficulty, Mode, PowerKind } from "./types";

export interface DifficultyConfig {
  label: string;
  blurb: string;
  icon: "feather" | "gauge" | "flame";
  maxNumber: number;
  /** Bubbles on screen at level 1. */
  baseCount: number;
  /** Extra bubbles added per level, up to `maxExtra`. */
  countPerLevel: number;
  maxExtra: number;
  /** Share of the field that matches the target, at level 1. */
  targetRatio: number;
  minTargetRatio: number;
  ratioDecay: number;
  basePoints: number;
  startTime: number;
  capTime: number;
  /** Seconds gained per correct pop. */
  timeBonus: number;
  /** Seconds lost on a miss (Rush only). */
  missTime: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: "Easy",
    blurb: "Numbers 1–12",
    icon: "feather",
    maxNumber: 12,
    baseCount: 40,
    countPerLevel: 2,
    maxExtra: 14,
    targetRatio: 0.2,
    minTargetRatio: 0.09,
    ratioDecay: 0.012,
    basePoints: 10,
    startTime: 45,
    capTime: 75,
    timeBonus: 2,
    missTime: 1,
  },
  medium: {
    label: "Medium",
    blurb: "Numbers 1–40",
    icon: "gauge",
    maxNumber: 40,
    baseCount: 52,
    countPerLevel: 2,
    maxExtra: 14,
    targetRatio: 0.12,
    minTargetRatio: 0.05,
    ratioDecay: 0.009,
    basePoints: 14,
    startTime: 38,
    capTime: 62,
    timeBonus: 1.8,
    missTime: 1.5,
  },
  hard: {
    label: "Hard",
    blurb: "Numbers 1–99",
    icon: "flame",
    maxNumber: 99,
    baseCount: 64,
    countPerLevel: 2,
    maxExtra: 12,
    targetRatio: 0.07,
    minTargetRatio: 0.03,
    ratioDecay: 0.006,
    basePoints: 20,
    startTime: 30,
    capTime: 52,
    timeBonus: 1.6,
    missTime: 2,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

export interface ModeConfig {
  label: string;
  tagline: string;
  blurb: string;
  icon: "zap" | "leaf" | "calendar";
  /** Rush keeps the clock honest; Chill hands out a long, generous one. */
  startTime?: number;
  capTime?: number;
  /** Chill never takes time away and never breaks your streak. */
  punishing: boolean;
  /** Multiplies how fast the field tightens as you level up. */
  rampScale: number;
  /** Multiplies how fast heat builds with time played. */
  heatScale: number;
  powerChance: number;
}

export const MODES: Record<Mode, ModeConfig> = {
  rush: {
    label: "Rush",
    tagline: "Beat the clock",
    blurb: "Every hit buys you seconds. Misses cost a little.",
    icon: "zap",
    punishing: true,
    rampScale: 1,
    heatScale: 1,
    powerChance: 0.45,
  },
  daily: {
    label: "Daily",
    tagline: "One board a day",
    blurb: "Rush rules on a board everyone gets today.",
    icon: "calendar",
    punishing: true,
    rampScale: 1,
    heatScale: 1,
    powerChance: 0.45,
  },
  chill: {
    label: "Chill",
    tagline: "No penalties",
    blurb: "90 relaxed seconds. Misses cost nothing at all.",
    icon: "leaf",
    startTime: 90,
    capTime: 120,
    punishing: false,
    rampScale: 0.55,
    // Chill still warms up, just at half pace.
    heatScale: 0.5,
    powerChance: 0.6,
  },
};

/** Only the two modes the player actually picks; daily has its own entry point. */
export const MODE_ORDER: Mode[] = ["rush", "chill"];

export interface PowerConfig {
  label: string;
  blurb: string;
  icon: "star" | "clock" | "snowflake" | "sparkles" | "zap";
  weight: number;
  /** Flat fill for the bubble itself. */
  color: string;
  /** Ink that stays legible on that fill. */
  ink: string;
}

export const POWERS: Record<PowerKind, PowerConfig> = {
  star: {
    label: "Star Bonus",
    blurb: "A fat pile of bonus points, multiplier included.",
    icon: "star",
    weight: 30,
    color: "#facc15",
    ink: "#0b2447",
  },
  clock: {
    label: "+6 Seconds",
    blurb: "Six more seconds on the clock.",
    icon: "clock",
    weight: 24,
    color: "#0ea5e9",
    ink: "#ffffff",
  },
  freeze: {
    label: "Time Freeze",
    blurb: "The timer stops dead for 6 seconds.",
    icon: "snowflake",
    weight: 16,
    color: "#a5f3fc",
    ink: "#0b2447",
  },
  rainbow: {
    label: "Rainbow",
    blurb: "Counts as a perfect hit, whatever the target is.",
    icon: "sparkles",
    weight: 20,
    color: "#c084fc",
    ink: "#0b2447",
  },
  nova: {
    label: "Nova Blast",
    blurb: "Pops every matching bubble on the board at once.",
    icon: "zap",
    weight: 10,
    color: "#ff6b81",
    ink: "#0b2447",
  },
};

export const POWER_ORDER: PowerKind[] = [
  "star",
  "clock",
  "freeze",
  "rainbow",
  "nova",
];

export interface BubbleSkin {
  fill: string;
  ink: string;
}

/**
 * The four play colours plus two deeper cousins, assigned at random per
 * bubble (never by value) so colour stays decoration and never leaks the
 * answer. Deep navy digits clear 4.3:1 on every one of them.
 */
export const BUBBLE_SKINS: BubbleSkin[] = [
  { fill: "#38bdf8", ink: "#0b2447" },
  { fill: "#facc15", ink: "#0b2447" },
  { fill: "#ff6b81", ink: "#0b2447" },
  { fill: "#4ade80", ink: "#0b2447" },
  { fill: "#0ea5e9", ink: "#ffffff" },
  { fill: "#22c55e", ink: "#0b2447" },
];

export interface HeatTier {
  label: string;
  color: string;
  /** Share of the base time bonus a hit still buys you. */
  timeScale: number;
  /** Extra thinning of the target, on top of the level ramp. */
  ratioDrop: number;
}

/**
 * Heat rises with time played, and governs the clock rather than the board.
 * Levels already grow the field and thin the target; if heat did the same the
 * two ramps would compound into an unreadable board. Instead each tier buys
 * you fewer seconds per hit, so a long run tightens towards an ending it
 * cannot outrun — while the board stays just as readable as it was.
 */
export const HEAT_TIERS: HeatTier[] = [
  { label: "Warm", color: "#4ade80", timeScale: 1, ratioDrop: 0 },
  { label: "Toasty", color: "#facc15", timeScale: 0.85, ratioDrop: 0.006 },
  { label: "Hot", color: "#fb923c", timeScale: 0.72, ratioDrop: 0.012 },
  { label: "Blazing", color: "#ff6b81", timeScale: 0.6, ratioDrop: 0.018 },
  { label: "Molten", color: "#f43f5e", timeScale: 0.5, ratioDrop: 0.024 },
];

/** Seconds of active play at which each tier begins. */
export const HEAT_THRESHOLDS = [0, 25, 55, 90, 130];

export const MAX_HEAT = HEAT_TIERS.length - 1;

/**
 * Math mode trades breadth for thought: a smaller board you have to reason
 * about rather than scan, more time per hit, and better points for the effort.
 */
export const MATH_MODIFIER = {
  countScale: 0.5,
  /** Expressions are scarcer on a smaller board, so raise the target share. */
  targetRatioScale: 1.4,
  timeBonusScale: 1.5,
  pointsScale: 1.6,
  extraStartTime: 10,
  extraCapTime: 15,
} as const;

/** Correct pops needed to advance a level. */
export const POPS_PER_LEVEL = 8;
/** Seconds handed out for reaching a new level. */
export const LEVEL_TIME_BONUS = 3;
/** Seconds added by a clock bubble. */
export const CLOCK_BONUS = 6;
/** How long a freeze bubble stops the clock. */
export const FREEZE_SECONDS = 6;
/** Star bonus, in multiples of the difficulty's base points. */
export const STAR_MULTIPLE = 5;
/** Streak needed per multiplier step, and the ceiling. */
export const STREAK_PER_STEP = 4;
export const MAX_MULTIPLIER = 8;
/** Below this many seconds the timer turns urgent and starts ticking. */
export const URGENT_SECONDS = 6;
/** Lifetime pops needed for the two volume badges. */
export const CENTURY_POPS = 100;
export const THOUSAND_POPS = 1000;
