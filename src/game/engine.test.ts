/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  HEAT_THRESHOLDS,
  HEAT_TIERS,
  MAX_HEAT,
  MAX_MULTIPLIER,
  POPS_PER_LEVEL,
} from "./config";
import {
  accuracyOf,
  buildField,
  capTimeFor,
  clamp,
  formatClock,
  heatFor,
  heatProgress,
  levelForPops,
  multiplierFor,
  pickTarget,
  popsToNextLevel,
  startTimeFor,
  timeBonusFor,
} from "./engine";
import { seededRng } from "./rng";
import type { Difficulty, Mode } from "./types";

const field = (
  seed: number,
  overrides: Partial<Parameters<typeof buildField>[0]> = {}
) =>
  buildField({
    rng: seededRng(seed),
    target: 7,
    difficulty: "easy",
    mode: "rush",
    level: 1,
    ...overrides,
  });

/** Ids are handed out globally, so compare boards by what a player sees. */
const visible = (bubbles: ReturnType<typeof buildField>) =>
  bubbles.map(({ value, skin, power }) => ({ value, skin, power }));

describe("buildField", () => {
  it("always leaves at least one bubble showing the target", () => {
    for (let seed = 0; seed < 60; seed++) {
      for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
        const board = field(seed, { difficulty, level: 12 });
        const hits = board.filter((b) => b.value === 7 && b.power === null);
        expect(hits.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("never puts the target on a plain decoy", () => {
    for (let seed = 0; seed < 40; seed++) {
      const board = field(seed, { difficulty: "hard", target: 42 });
      const wrong = board.filter((b) => b.power === null && b.value !== 42);
      // Every non-target bubble must genuinely differ from the target.
      expect(wrong.every((b) => b.value !== 42)).toBe(true);
      expect(board.every((b) => b.value >= 1 && b.value <= 99)).toBe(true);
    }
  });

  it("replays exactly for the same seed and diverges for another", () => {
    expect(visible(field(2026))).toEqual(visible(field(2026)));
    expect(visible(field(2026))).not.toEqual(visible(field(2027)));
  });

  it("keeps every bubble alive on a fresh board", () => {
    expect(field(3).every((b) => !b.dead)).toBe(true);
  });

  it("leaves the opening board free of power-ups", () => {
    for (let seed = 0; seed < 30; seed++) {
      expect(field(seed, { allowPowers: false }).every((b) => !b.power)).toBe(
        true
      );
    }
  });

  it("only ever converts decoys into power-ups", () => {
    for (let seed = 0; seed < 80; seed++) {
      const board = field(seed, { level: 4 });
      const powered = board.filter((b) => b.power !== null);
      // A power-up that replaced a target would strand the board.
      expect(powered.every((b) => b.value !== 7)).toBe(true);
      expect(powered.length).toBeLessThanOrEqual(2);
    }
  });

  it("grows the board with the level, up to the configured cap", () => {
    const config = DIFFICULTIES.easy;
    expect(field(1, { level: 1 })).toHaveLength(config.baseCount);
    expect(field(1, { level: 3 })).toHaveLength(
      config.baseCount + 2 * config.countPerLevel
    );
    expect(field(1, { level: 99 })).toHaveLength(
      config.baseCount + config.maxExtra
    );
  });

  it("thins the target out as the level climbs, never past the floor", () => {
    const countHits = (level: number) =>
      field(5, { difficulty: "medium", level }).filter((b) => b.value === 7)
        .length;
    expect(countHits(1)).toBeGreaterThan(countHits(20));
    expect(countHits(500)).toBeGreaterThanOrEqual(1);
  });

  it("ramps more gently in chill mode than in rush", () => {
    const hits = (mode: Mode) =>
      field(9, { difficulty: "medium", mode, level: 15 }).filter(
        (b) => b.value === 7
      ).length;
    expect(hits("chill")).toBeGreaterThanOrEqual(hits("rush"));
  });
});

describe("pickTarget", () => {
  it("never repeats the previous target and stays in range", () => {
    const rng = seededRng(11);
    let previous = 5;
    for (let i = 0; i < 300; i++) {
      const next = pickTarget(rng, "medium", previous);
      expect(next).not.toBe(previous);
      expect(next).toBeGreaterThanOrEqual(1);
      expect(next).toBeLessThanOrEqual(DIFFICULTIES.medium.maxNumber);
      previous = next;
    }
  });
});

describe("scoring maths", () => {
  it("steps the multiplier every four hits and caps it", () => {
    expect(multiplierFor(0)).toBe(1);
    expect(multiplierFor(3)).toBe(1);
    expect(multiplierFor(4)).toBe(2);
    expect(multiplierFor(27)).toBe(7);
    expect(multiplierFor(28)).toBe(MAX_MULTIPLIER);
    expect(multiplierFor(10_000)).toBe(MAX_MULTIPLIER);
  });

  it("advances a level every eight pops", () => {
    expect(levelForPops(0)).toBe(1);
    expect(levelForPops(POPS_PER_LEVEL - 1)).toBe(1);
    expect(levelForPops(POPS_PER_LEVEL)).toBe(2);
    expect(popsToNextLevel(0)).toBe(POPS_PER_LEVEL);
    expect(popsToNextLevel(POPS_PER_LEVEL - 1)).toBe(1);
  });

  it("treats an untouched run as fully accurate", () => {
    expect(accuracyOf(0, 0)).toBe(100);
    expect(accuracyOf(9, 1)).toBe(90);
    expect(accuracyOf(0, 4)).toBe(0);
  });

  it("clamps into range", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(50, 0, 10)).toBe(10);
    expect(clamp(4, 0, 10)).toBe(4);
  });
});

describe("clock", () => {
  it("shows tenths only in the final stretch", () => {
    expect(formatClock(4.25)).toBe("4.3");
    expect(formatClock(42)).toBe("42");
    expect(formatClock(75)).toBe("1:15");
    expect(formatClock(60)).toBe("1:00");
  });

  it("gives chill mode its own generous clock, whatever the difficulty", () => {
    expect(startTimeFor("hard", "chill")).toBe(90);
    expect(capTimeFor("hard", "chill")).toBe(120);
    // Daily inherits the difficulty's own timings, like rush.
    expect(startTimeFor("hard", "daily")).toBe(DIFFICULTIES.hard.startTime);
    expect(startTimeFor("easy", "rush")).toBe(DIFFICULTIES.easy.startTime);
  });
});

describe("heat", () => {
  it("starts cool and climbs a tier at each threshold", () => {
    expect(heatFor(0, "rush")).toBe(0);
    expect(heatFor(HEAT_THRESHOLDS[1] - 1, "rush")).toBe(0);
    expect(heatFor(HEAT_THRESHOLDS[1], "rush")).toBe(1);
    expect(heatFor(HEAT_THRESHOLDS[2], "rush")).toBe(2);
    expect(heatFor(HEAT_THRESHOLDS[MAX_HEAT], "rush")).toBe(MAX_HEAT);
  });

  it("never climbs past the top tier", () => {
    expect(heatFor(100_000, "rush")).toBe(MAX_HEAT);
  });

  it("builds at half pace in chill mode", () => {
    const seconds = HEAT_THRESHOLDS[2];
    expect(heatFor(seconds, "rush")).toBe(2);
    // Chill's heatScale of 0.5 means the same wall time is only half as hot.
    expect(heatFor(seconds, "chill")).toBeLessThan(2);
    expect(heatFor(seconds * 2, "chill")).toBe(2);
  });

  it("reports progress towards the next tier and pins at the top", () => {
    expect(heatProgress(0, "rush")).toBe(0);
    const midway = (HEAT_THRESHOLDS[1] + HEAT_THRESHOLDS[2]) / 2;
    expect(heatProgress(midway, "rush")).toBeCloseTo(0.5, 1);
    expect(heatProgress(100_000, "rush")).toBe(1);
  });

  it("buys fewer seconds per hit as the run heats up", () => {
    const bonuses = HEAT_TIERS.map((_, tier) => timeBonusFor("easy", tier));
    for (let i = 1; i < bonuses.length; i++) {
      expect(bonuses[i]).toBeLessThan(bonuses[i - 1]);
    }
    expect(bonuses[0]).toBe(DIFFICULTIES.easy.timeBonus);
    // Even at full heat a hit still pays something, so a run is never hopeless.
    expect(bonuses[MAX_HEAT]).toBeGreaterThan(0);
  });

  it("thins the target as heat rises, without emptying the board", () => {
    const hitsAt = (heat: number) =>
      field(21, { difficulty: "medium", heat }).filter((b) => b.value === 7)
        .length;
    expect(hitsAt(MAX_HEAT)).toBeLessThanOrEqual(hitsAt(0));
    expect(hitsAt(MAX_HEAT)).toBeGreaterThanOrEqual(1);
  });

  it("keeps the board the same size however hot it gets", () => {
    // Heat governs the clock; levels govern the board. They must not compound.
    expect(field(4, { heat: 0 })).toHaveLength(field(4, { heat: MAX_HEAT }).length);
  });
});
