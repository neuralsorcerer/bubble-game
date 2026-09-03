/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, it, vi } from "vitest";
import type { ScoreEntry } from "@/game/types";
import {
  bestFor,
  bestScore,
  recordDaily,
  resetProgress,
  saveScore,
  type DailyRecord,
} from "./storage";

const entry = (
  score: number,
  overrides: Partial<ScoreEntry> = {}
): ScoreEntry => ({
  score,
  difficulty: "easy",
  mode: "rush",
  level: 1,
  streak: 0,
  at: score,
  ...overrides,
});

const record = (overrides: Partial<DailyRecord> = {}): DailyRecord => ({
  day: "",
  score: 0,
  streak: 0,
  bestStreak: 0,
  ...overrides,
});

describe("recordDaily", () => {
  it("starts a streak on the first ever day", () => {
    const next = recordDaily(record(), "2026-09-02", 500);
    expect(next).toMatchObject({
      day: "2026-09-02",
      score: 500,
      streak: 1,
      bestStreak: 1,
    });
  });

  it("extends the streak on the very next day", () => {
    const previous = record({
      day: "2026-09-01",
      score: 900,
      streak: 4,
      bestStreak: 6,
    });
    const next = recordDaily(previous, "2026-09-02", 300);
    expect(next.streak).toBe(5);
    expect(next.score).toBe(300);
    // A lower score on a new day still counts as showing up.
    expect(next.bestStreak).toBe(6);
  });

  it("raises the best streak once the run passes it", () => {
    const previous = record({
      day: "2026-09-01",
      score: 900,
      streak: 6,
      bestStreak: 6,
    });
    expect(recordDaily(previous, "2026-09-02", 100).bestStreak).toBe(7);
  });

  it("restarts the streak after a missed day", () => {
    const previous = record({
      day: "2026-08-28",
      score: 900,
      streak: 9,
      bestStreak: 9,
    });
    const next = recordDaily(previous, "2026-09-02", 100);
    expect(next.streak).toBe(1);
    // The record of what they once managed survives the lapse.
    expect(next.bestStreak).toBe(9);
  });

  it("keeps only the best score when replaying the same day", () => {
    const previous = record({
      day: "2026-09-02",
      score: 900,
      streak: 3,
      bestStreak: 5,
    });
    expect(recordDaily(previous, "2026-09-02", 400).score).toBe(900);
    expect(recordDaily(previous, "2026-09-02", 1500).score).toBe(1500);
    // A replay must never inflate the streak.
    expect(recordDaily(previous, "2026-09-02", 1500).streak).toBe(3);
  });
});

describe("saveScore", () => {
  it("sorts highest first", () => {
    const list = saveScore(entry(500), [entry(900), entry(100)]);
    expect(list.map((item) => item.score)).toEqual([900, 500, 100]);
  });

  it("caps the history so it cannot grow without bound", () => {
    let list: ScoreEntry[] = [];
    for (let i = 0; i < 60; i++) list = saveScore(entry(i), list);
    expect(list).toHaveLength(30);
    expect(list[0].score).toBe(59);
  });
});

describe("best score lookups", () => {
  const entries = [
    entry(3000, { difficulty: "medium", mode: "rush" }),
    entry(2000, { difficulty: "easy", mode: "chill" }),
    entry(1000, { difficulty: "easy", mode: "daily" }),
    entry(500, { difficulty: null, mode: null }),
  ];

  it("finds the overall best", () => {
    expect(bestScore(entries)).toBe(3000);
    expect(bestScore([])).toBe(0);
  });

  it("scopes a best to one mode and difficulty", () => {
    expect(bestFor(entries, "medium", "rush")).toBe(3000);
    expect(bestFor(entries, "easy", "daily")).toBe(1000);
    // Migrated entries have no mode, so they belong to no bucket.
    expect(bestFor(entries, "hard", "rush")).toBe(0);
  });
});

describe("resetProgress", () => {
  it("clears progress but keeps the player's settings", () => {
    // A minimal localStorage so the guarded helpers have something to talk to.
    const store: Record<string, string> = {
      "bubble:scores:v2": "[]",
      leaderboard: "[]",
      "bubble:totals:v1": "{}",
      "bubble:daily:v1": "{}",
      "bubble:badges:v1": "[]",
      "bubble:ghosts:v1": "{}",
      "bubble:theme": "dark",
      soundEnabled: "false",
      "bubble:haptics": "false",
      "bubble:math": "true",
      difficulty: "hard",
      "bubble:mode": "chill",
    };
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });

    resetProgress();

    expect(Object.keys(store).sort()).toEqual(
      [
        "bubble:haptics",
        "bubble:math",
        "bubble:mode",
        "bubble:theme",
        "difficulty",
        "soundEnabled",
      ].sort()
    );

    vi.unstubAllGlobals();
  });
});
