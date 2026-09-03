/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const harness = vi.hoisted(() => ({ setters: [] as ReturnType<typeof vi.fn>[] }));

vi.mock("react", () => ({
  useCallback: <T>(callback: T) => callback,
  useEffect: () => undefined,
  useRef: <T>(value: T) => ({ current: value }),
  useState: <T>(initial: T | (() => T)) => {
    const value = typeof initial === "function" ? (initial as () => T)() : initial;
    const setter = vi.fn();
    harness.setters.push(setter);
    return [value, setter];
  },
}));

import type { GameSnapshot } from "./useBubbleGame";
import { useBubbleGame } from "./useBubbleGame";

describe("run restarts", () => {
  beforeEach(() => {
    harness.setters.length = 0;
  });

  it("preserves a daily math run's seed and modifiers", () => {
    const game = useBubbleGame({
      difficulty: "easy",
      mode: "rush",
      onFinish: vi.fn(),
    });
    const options = {
      difficulty: "hard" as const,
      mode: "daily" as const,
      seed: 20260903,
      day: "2026-09-03",
      math: true,
    };

    game.start(options);
    const first = harness.setters[1].mock.lastCall?.[0] as GameSnapshot;
    game.restart();
    const restarted = harness.setters[1].mock.lastCall?.[0] as GameSnapshot;

    expect(restarted).toMatchObject({
      difficulty: options.difficulty,
      mode: options.mode,
      day: options.day,
      math: true,
      phase: "playing",
    });
    expect(restarted.target).toBe(first.target);
    expect(
      restarted.bubbles.map(({ value, label, power, skin, seed }) => ({
        value,
        label,
        power,
        skin,
        seed,
      }))
    ).toEqual(
      first.bubbles.map(({ value, label, power, skin, seed }) => ({
        value,
        label,
        power,
        skin,
        seed,
      }))
    );
  });
});
