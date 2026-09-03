/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, it } from "vitest";
import { dayKey, hashSeed, isPreviousDay, randomInt, seededRng } from "./rng";

const take = (seed: number, count: number) => {
  const rng = seededRng(seed);
  return Array.from({ length: count }, () => rng());
};

describe("seededRng", () => {
  it("replays the same sequence for the same seed", () => {
    expect(take(1234, 20)).toEqual(take(1234, 20));
  });

  it("diverges for different seeds", () => {
    expect(take(1234, 20)).not.toEqual(take(1235, 20));
  });

  it("stays within [0, 1)", () => {
    for (const value of take(99, 500)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("spreads across the range rather than clustering", () => {
    const buckets = new Array(10).fill(0);
    for (const value of take(7, 5000)) buckets[Math.floor(value * 10)] += 1;
    // A fair generator puts roughly 500 in each bucket; allow a wide margin.
    for (const count of buckets) expect(count).toBeGreaterThan(300);
  });
});

describe("hashSeed", () => {
  it("is stable for the same input", () => {
    expect(hashSeed("bubble-game:2026-09-02")).toBe(
      hashSeed("bubble-game:2026-09-02")
    );
  });

  it("differs for neighbouring days", () => {
    expect(hashSeed("bubble-game:2026-09-02")).not.toBe(
      hashSeed("bubble-game:2026-09-03")
    );
  });

  it("returns an unsigned 32-bit integer", () => {
    const seed = hashSeed("anything");
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });
});

describe("dayKey", () => {
  it("zero-pads month and day", () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("reads the local calendar date, not UTC", () => {
    // 23:30 local on the 2nd is still the 2nd, whatever the offset.
    expect(dayKey(new Date(2026, 8, 2, 23, 30))).toBe("2026-09-02");
  });
});

describe("isPreviousDay", () => {
  it("accepts the day immediately before", () => {
    expect(isPreviousDay("2026-09-01", "2026-09-02")).toBe(true);
  });

  it("crosses a month boundary", () => {
    expect(isPreviousDay("2026-08-31", "2026-09-01")).toBe(true);
  });

  it("crosses a year boundary", () => {
    expect(isPreviousDay("2025-12-31", "2026-01-01")).toBe(true);
  });

  it("handles a leap day", () => {
    expect(isPreviousDay("2028-02-29", "2028-03-01")).toBe(true);
  });

  it("rejects the same day, a gap, and an empty history", () => {
    expect(isPreviousDay("2026-09-02", "2026-09-02")).toBe(false);
    expect(isPreviousDay("2026-08-30", "2026-09-02")).toBe(false);
    expect(isPreviousDay("", "2026-09-02")).toBe(false);
  });
});

describe("randomInt", () => {
  it("stays below the exclusive bound", () => {
    const rng = seededRng(42);
    for (let i = 0; i < 200; i++) {
      const value = randomInt(rng, 6);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
    }
  });
});
