/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  achievementById,
  newlyEarned,
  type AchievementContext,
} from "./achievements";

const run = (overrides: Partial<AchievementContext> = {}): AchievementContext => ({
  score: 0,
  difficulty: "easy",
  mode: "rush",
  math: false,
  pops: 0,
  misses: 0,
  bestStreak: 0,
  powers: 0,
  level: 1,
  maxHeat: 0,
  totals: { games: 1, pops: 0, bestStreak: 0 },
  dailyStreak: 0,
  ...overrides,
});

describe("achievement catalogue", () => {
  it("has unique ids and no missing copy", () => {
    const ids = ACHIEVEMENTS.map((badge) => badge.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const badge of ACHIEVEMENTS) {
      expect(badge.label.length).toBeGreaterThan(0);
      expect(badge.blurb.length).toBeGreaterThan(0);
      expect(badge.emoji.length).toBeGreaterThan(0);
    }
  });

  it("resolves every id back to its badge", () => {
    for (const badge of ACHIEVEMENTS) {
      expect(achievementById(badge.id)?.label).toBe(badge.label);
    }
  });
});

describe("newlyEarned", () => {
  it("awards the first pop as soon as one is on the board", () => {
    expect(newlyEarned(run({ totals: { games: 1, pops: 1, bestStreak: 1 } }), [])).toContain(
      "first-pop"
    );
  });

  it("never re-awards a badge already held", () => {
    const context = run({ totals: { games: 1, pops: 1, bestStreak: 1 } });
    expect(newlyEarned(context, ["first-pop"])).not.toContain("first-pop");
  });

  it("needs a 28 streak for the combo ceiling", () => {
    expect(newlyEarned(run({ bestStreak: 27 }), [])).not.toContain("combo-max");
    expect(newlyEarned(run({ bestStreak: 28 }), [])).toContain("combo-max");
  });

  it("gates hard graft on the hard difficulty", () => {
    expect(newlyEarned(run({ difficulty: "medium", score: 5000 }), [])).not.toContain(
      "hard-graft"
    );
    expect(newlyEarned(run({ difficulty: "hard", score: 2000 }), [])).toContain(
      "hard-graft"
    );
  });

  it("wants a real run behind a flawless or sharpshooter badge", () => {
    // Zero pops and zero misses is technically 100% — it must not count.
    const empty = newlyEarned(run(), []);
    expect(empty).not.toContain("flawless");
    expect(empty).not.toContain("sharpshooter");

    expect(newlyEarned(run({ pops: 15, misses: 0 }), [])).toContain("flawless");
    expect(newlyEarned(run({ pops: 20, misses: 1 }), [])).toContain(
      "sharpshooter"
    );
    expect(newlyEarned(run({ pops: 20, misses: 4 }), [])).not.toContain(
      "sharpshooter"
    );
  });

  it("tracks the daily streak badges", () => {
    expect(newlyEarned(run({ dailyStreak: 2 }), [])).not.toContain("daily-three");
    expect(newlyEarned(run({ dailyStreak: 3 }), [])).toContain("daily-three");
    const week = newlyEarned(run({ dailyStreak: 7 }), []);
    expect(week).toContain("daily-three");
    expect(week).toContain("daily-seven");
  });

  it("returns several badges at once when a run earns them together", () => {
    const earned = newlyEarned(
      run({
        score: 5200,
        pops: 40,
        misses: 0,
        bestStreak: 40,
        level: 11,
        powers: 12,
        totals: { games: 4, pops: 120, bestStreak: 40 },
      }),
      []
    );
    expect(earned).toEqual(
      expect.arrayContaining([
        "first-pop",
        "century",
        "combo-four",
        "combo-max",
        "score-1k",
        "score-5k",
        "level-ten",
        "sharpshooter",
        "flawless",
        "power-hungry",
      ])
    );
  });
});
