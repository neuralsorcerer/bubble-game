/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, it } from "vitest";
import { DIFFICULTY_ORDER } from "./config";
import { challengeFor } from "./daily";
import { buildField } from "./engine";
import { seededRng } from "./rng";

describe("challengeFor", () => {
  it("is identical for two players on the same calendar day", () => {
    const morning = challengeFor(new Date(2026, 8, 2, 7, 15));
    const evening = challengeFor(new Date(2026, 8, 2, 22, 45));
    expect(morning.day).toBe(evening.day);
    expect(morning.seed).toBe(evening.seed);
    expect(morning.difficulty).toBe(evening.difficulty);
  });

  it("changes from one day to the next", () => {
    const today = challengeFor(new Date(2026, 8, 2));
    const tomorrow = challengeFor(new Date(2026, 8, 3));
    expect(today.seed).not.toBe(tomorrow.seed);
    expect(today.day).not.toBe(tomorrow.day);
  });

  it("always picks a real difficulty", () => {
    for (let day = 1; day <= 60; day++) {
      const challenge = challengeFor(new Date(2026, 0, day));
      expect(DIFFICULTY_ORDER).toContain(challenge.difficulty);
      expect(challenge.label.length).toBeGreaterThan(0);
    }
  });

  it("rotates the difficulty rather than sticking on one", () => {
    const seen = new Set(
      Array.from({ length: 90 }, (_, day) =>
        challengeFor(new Date(2026, 0, day + 1)).difficulty
      )
    );
    expect(seen.size).toBe(DIFFICULTY_ORDER.length);
  });

  it("deals the same boards to two devices sharing a date", () => {
    const challenge = challengeFor(new Date(2026, 8, 2));

    // Two independent runs, each dealing three boards from the day's seed.
    const deal = () => {
      const rng = seededRng(challenge.seed);
      return Array.from({ length: 3 }, () =>
        buildField({
          rng,
          target: 7,
          difficulty: challenge.difficulty,
          mode: "daily",
          level: 1,
        }).map(({ value, skin, power }) => ({ value, skin, power }))
      );
    };

    expect(deal()).toEqual(deal());
  });
});
