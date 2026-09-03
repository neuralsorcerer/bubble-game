/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 *
 * Thin, failure-tolerant localStorage helpers. Private-mode browsers and
 * blocked storage must never take the game down, so every access is guarded.
 */

import type { Ghost } from "@/game/ghost";
import { isPreviousDay } from "@/game/rng";
import type {
  AchievementId,
  Difficulty,
  Mode,
  ScoreEntry,
} from "@/game/types";

const KEYS = {
  scores: "bubble:scores:v2",
  legacyScores: "leaderboard",
  difficulty: "difficulty",
  mode: "bubble:mode",
  sound: "soundEnabled",
  theme: "bubble:theme",
  totals: "bubble:totals:v1",
  haptics: "bubble:haptics",
  math: "bubble:math",
  daily: "bubble:daily:v1",
  badges: "bubble:badges:v1",
  ghosts: "bubble:ghosts:v1",
} as const;

/**
 * Progress is what "reset" clears: scores, badges, stats, streaks and ghosts.
 * Preferences — theme, sound, vibration, and the last mode you picked — are
 * settings rather than progress, so wiping them would break the promise the
 * reset button makes and would silently revert the player's theme on reload.
 */
const PROGRESS_KEYS = [
  KEYS.scores,
  KEYS.legacyScores,
  KEYS.totals,
  KEYS.daily,
  KEYS.badges,
  KEYS.ghosts,
];

const MAX_ENTRIES = 30;

export const readRaw = (key: string): string | null => {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeRaw = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable — the game keeps working, it just forgets.
  }
};

const readJson = <T>(key: string, fallback: T): T => {
  const raw = readRaw(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) =>
  writeRaw(key, JSON.stringify(value));

const isEntry = (value: unknown): value is ScoreEntry =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as ScoreEntry).score === "number";

/**
 * Reads the score history, folding in any list left behind by the original
 * number-only format so long-time players keep their high scores.
 */
export const loadScores = (): ScoreEntry[] => {
  const current = readJson<unknown[]>(KEYS.scores, []);
  if (Array.isArray(current) && current.length > 0) {
    return current.filter(isEntry).sort((a, b) => b.score - a.score);
  }

  const legacy = readJson<unknown[]>(KEYS.legacyScores, []);
  if (!Array.isArray(legacy) || legacy.length === 0) return [];

  const migrated: ScoreEntry[] = legacy
    .filter((score): score is number => typeof score === "number")
    .map((score) => ({
      score,
      difficulty: null,
      mode: null,
      level: 1,
      streak: 0,
      at: 0,
    }))
    .sort((a, b) => b.score - a.score);

  if (migrated.length > 0) writeJson(KEYS.scores, migrated);
  return migrated;
};

export const saveScore = (entry: ScoreEntry, existing: ScoreEntry[]) => {
  const next = [...existing, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  writeJson(KEYS.scores, next);
  return next;
};

export const bestScore = (entries: ScoreEntry[]) =>
  entries.reduce((best, entry) => Math.max(best, entry.score), 0);

export const bestFor = (
  entries: ScoreEntry[],
  difficulty: Difficulty,
  mode: Mode,
  math = false
) =>
  entries.reduce(
    (best, entry) =>
      entry.difficulty === difficulty &&
      entry.mode === mode &&
      Boolean(entry.math) === math
        ? Math.max(best, entry.score)
        : best,
    0
  );

export interface Totals {
  games: number;
  pops: number;
  bestStreak: number;
}

const EMPTY_TOTALS: Totals = { games: 0, pops: 0, bestStreak: 0 };

export const loadTotals = (): Totals => {
  const stored = readJson<Partial<Totals>>(KEYS.totals, EMPTY_TOTALS);
  return {
    games: Number(stored.games) || 0,
    pops: Number(stored.pops) || 0,
    bestStreak: Number(stored.bestStreak) || 0,
  };
};

export const saveTotals = (totals: Totals) => writeJson(KEYS.totals, totals);

export const loadDifficulty = (): Difficulty => {
  const stored = readRaw(KEYS.difficulty);
  return stored === "easy" || stored === "medium" || stored === "hard"
    ? stored
    : "easy";
};

export const saveDifficulty = (difficulty: Difficulty) =>
  writeRaw(KEYS.difficulty, difficulty);

export const loadMode = (): Mode => {
  const stored = readRaw(KEYS.mode);
  return stored === "rush" || stored === "chill" ? stored : "rush";
};

export const saveMode = (mode: Mode) => writeRaw(KEYS.mode, mode);

export const loadMath = (): boolean => readJson<boolean>(KEYS.math, false);

export const saveMath = (enabled: boolean) => writeJson(KEYS.math, enabled);

export const loadSound = (): boolean => readJson<boolean>(KEYS.sound, true);

export const saveSound = (enabled: boolean) => writeJson(KEYS.sound, enabled);

export const loadHaptics = (): boolean => readJson<boolean>(KEYS.haptics, true);

export const saveHaptics = (enabled: boolean) =>
  writeJson(KEYS.haptics, enabled);

export interface DailyRecord {
  /** The last day the player took on the challenge, `YYYY-MM-DD`. */
  day: string;
  /** Best score on that day — replays are welcome, only the best one counts. */
  score: number;
  /** Consecutive days played, including `day`. */
  streak: number;
  /** Longest run of consecutive days ever. */
  bestStreak: number;
}

const EMPTY_DAILY: DailyRecord = {
  day: "",
  score: 0,
  streak: 0,
  bestStreak: 0,
};

export const loadDaily = (): DailyRecord => {
  const stored = readJson<Partial<DailyRecord>>(KEYS.daily, EMPTY_DAILY);
  return {
    day: typeof stored.day === "string" ? stored.day : "",
    score: Number(stored.score) || 0,
    streak: Number(stored.streak) || 0,
    bestStreak: Number(stored.bestStreak) || 0,
  };
};

/**
 * Folds a finished daily run into the record: a new day extends the streak
 * when it directly follows the last one and otherwise restarts it, while a
 * replay of the same day only ever raises the score.
 */
export const recordDaily = (
  previous: DailyRecord,
  day: string,
  score: number
): DailyRecord => {
  if (previous.day === day) {
    return { ...previous, score: Math.max(previous.score, score) };
  }

  const streak = isPreviousDay(previous.day, day) ? previous.streak + 1 : 1;
  const next: DailyRecord = {
    day,
    score,
    streak,
    bestStreak: Math.max(previous.bestStreak, streak),
  };
  writeJson(KEYS.daily, next);
  return next;
};

export const saveDaily = (record: DailyRecord) => writeJson(KEYS.daily, record);

export const loadBadges = (): AchievementId[] => {
  const stored = readJson<unknown[]>(KEYS.badges, []);
  return Array.isArray(stored)
    ? stored.filter((id): id is AchievementId => typeof id === "string")
    : [];
};

export const saveBadges = (badges: AchievementId[]) =>
  writeJson(KEYS.badges, badges);

/** Wipes every scrap of saved progress. Only ever called after a confirmation. */
/** Clears saved progress, leaving the player's settings alone. */
export const resetProgress = () => {
  for (const key of PROGRESS_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Nothing to do — the data was unreachable to begin with.
    }
  }
};

/** Best-run traces, keyed by `mode:difficulty`. */
export type GhostStore = Record<string, Ghost>;

export const loadGhosts = (): GhostStore => {
  const stored = readJson<GhostStore>(KEYS.ghosts, {});
  if (typeof stored !== "object" || stored === null) return {};

  const clean: GhostStore = {};
  for (const [key, ghost] of Object.entries(stored)) {
    if (
      ghost &&
      typeof ghost.score === "number" &&
      Array.isArray(ghost.samples)
    ) {
      clean[key] = {
        score: ghost.score,
        samples: ghost.samples.filter((n) => typeof n === "number"),
      };
    }
  }
  return clean;
};

export const saveGhosts = (ghosts: GhostStore) => writeJson(KEYS.ghosts, ghosts);

export const THEME_KEY = KEYS.theme;
