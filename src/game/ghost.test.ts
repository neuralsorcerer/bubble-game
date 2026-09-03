/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, it } from "vitest";
import {
  betterGhost,
  ghostKey,
  ghostScoreAt,
  MAX_TRACE_SECONDS,
  recordSample,
  type GhostTrace,
} from "./ghost";

describe("recordSample", () => {
  it("writes the score at the second played", () => {
    const trace: GhostTrace = [];
    recordSample(trace, 0.4, 10);
    recordSample(trace, 1.9, 30);
    expect(trace).toEqual([10, 30]);
  });

  it("keeps the latest score within the same second", () => {
    const trace: GhostTrace = [];
    recordSample(trace, 2.1, 10);
    recordSample(trace, 2.8, 45);
    expect(trace[2]).toBe(45);
  });

  it("fills gaps so an idle stretch leaves no holes", () => {
    const trace: GhostTrace = [];
    recordSample(trace, 0, 10);
    recordSample(trace, 5, 60);
    expect(trace).toHaveLength(6);
    expect(trace.some((value) => value === undefined)).toBe(false);
    // The idle seconds carry the score the run was sitting on.
    expect(trace.slice(1, 5)).toEqual([60, 60, 60, 60]);
  });

  it("refuses to grow past the cap", () => {
    const trace: GhostTrace = [];
    recordSample(trace, MAX_TRACE_SECONDS + 500, 999);
    expect(trace.length).toBeLessThanOrEqual(MAX_TRACE_SECONDS);
  });
});

describe("ghostScoreAt", () => {
  const ghost = { score: 300, samples: [0, 100, 200, 300] };

  it("reads the ghost's score at that second", () => {
    expect(ghostScoreAt(ghost, 0)).toBe(0);
    expect(ghostScoreAt(ghost, 2.7)).toBe(200);
  });

  it("holds the final score once the ghost's run is over", () => {
    // Past its end the ghost is finished, so its total is the bar to clear.
    expect(ghostScoreAt(ghost, 60)).toBe(300);
  });

  it("treats an empty trace as zero", () => {
    expect(ghostScoreAt({ score: 0, samples: [] }, 5)).toBe(0);
  });
});

describe("betterGhost", () => {
  it("promotes a first run", () => {
    expect(betterGhost(undefined, 500, [500])).toEqual({
      score: 500,
      samples: [500],
    });
  });

  it("promotes only a genuine improvement", () => {
    const held = { score: 500, samples: [500] };
    expect(betterGhost(held, 400, [400])).toBeNull();
    expect(betterGhost(held, 500, [500])).toBeNull();
    expect(betterGhost(held, 501, [501])?.score).toBe(501);
  });

  it("copies the trace rather than aliasing the live one", () => {
    const live = [10, 20];
    const promoted = betterGhost(undefined, 20, live);
    live.push(30);
    expect(promoted?.samples).toEqual([10, 20]);
  });
});

describe("ghostKey", () => {
  it("separates every mode and difficulty pairing", () => {
    const keys = new Set([
      ghostKey("rush", "easy"),
      ghostKey("rush", "hard"),
      ghostKey("chill", "easy"),
      ghostKey("daily", "easy"),
    ]);
    expect(keys.size).toBe(4);
  });
});
