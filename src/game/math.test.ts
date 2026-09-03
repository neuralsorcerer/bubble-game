/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { describe, expect, it } from "vitest";
import { buildField } from "./engine";
import { expressionFor, factorPairs, MATH_STYLES } from "./math";
import { seededRng } from "./rng";
import type { Difficulty } from "./types";

/** Evaluates a single-operator expression the way a player would read it. */
const evaluate = (label: string): number => {
  const match = /^(\d+)([+−×÷])(\d+)$/.exec(label);
  if (!match) return Number(label);
  const [, left, op, right] = match;
  const a = Number(left);
  const b = Number(right);
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    default:
      return a / b;
  }
};

describe("expressionFor", () => {
  it("always evaluates to the value it was built from", () => {
    const rng = seededRng(7);
    for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
      const style = MATH_STYLES[difficulty];
      const max = difficulty === "easy" ? 12 : difficulty === "medium" ? 40 : 99;
      for (let value = 1; value <= max; value++) {
        for (let i = 0; i < 8; i++) {
          expect(evaluate(expressionFor(rng, value, style))).toBe(value);
        }
      }
    }
  });

  it("only uses operators the difficulty allows", () => {
    const rng = seededRng(3);
    for (let value = 1; value <= 12; value++) {
      for (let i = 0; i < 20; i++) {
        // Easy never shows times or divide.
        expect(expressionFor(rng, value, MATH_STYLES.easy)).not.toMatch(/[×÷]/);
      }
    }
  });

  it("keeps operands inside the difficulty's ceiling", () => {
    const rng = seededRng(5);
    const style = MATH_STYLES.medium;
    for (let value = 1; value <= 40; value++) {
      for (let i = 0; i < 10; i++) {
        for (const part of expressionFor(rng, value, style).split(/[+−×÷]/)) {
          expect(Number(part)).toBeLessThanOrEqual(style.maxOperand);
        }
      }
    }
  });

  it("keeps labels short enough to fit inside a bubble", () => {
    const rng = seededRng(9);
    for (let value = 1; value <= 99; value++) {
      for (let i = 0; i < 6; i++) {
        expect(
          expressionFor(rng, value, MATH_STYLES.hard).length
        ).toBeLessThanOrEqual(6);
      }
    }
  });

  it("falls back to the bare number when no operator fits", () => {
    // 1 cannot be a sum of two positives, and the ceiling blocks the rest.
    expect(expressionFor(seededRng(1), 1, { ops: ["+"], maxOperand: 1 })).toBe(
      "1"
    );
  });
});

describe("factorPairs", () => {
  it("finds non-trivial pairs only", () => {
    expect(factorPairs(12, 99)).toEqual([
      [2, 6],
      [3, 4],
    ]);
    expect(factorPairs(7, 99)).toEqual([]);
  });

  it("respects the operand ceiling", () => {
    expect(factorPairs(38, 10)).toEqual([]);
  });
});

describe("a math board", () => {
  const field = (seed: number) =>
    buildField({
      rng: seededRng(seed),
      target: 12,
      difficulty: "medium",
      mode: "rush",
      level: 1,
      math: true,
    });

  it("never lets a decoy work out to the target", () => {
    for (let seed = 0; seed < 40; seed++) {
      for (const bubble of field(seed)) {
        if (bubble.power) continue;
        // The label must agree with the value it is scored against.
        expect(evaluate(bubble.label)).toBe(bubble.value);
        if (bubble.value !== 12) expect(evaluate(bubble.label)).not.toBe(12);
      }
    }
  });

  it("still guarantees something poppable", () => {
    for (let seed = 0; seed < 40; seed++) {
      expect(field(seed).filter((b) => b.value === 12).length).toBeGreaterThan(0);
    }
  });

  it("deals a smaller board than the plain mode", () => {
    const plain = buildField({
      rng: seededRng(1),
      target: 12,
      difficulty: "medium",
      mode: "rush",
      level: 1,
    });
    expect(field(1).length).toBeLessThan(plain.length);
  });

  it("labels plain bubbles with their own number", () => {
    const plain = buildField({
      rng: seededRng(2),
      target: 5,
      difficulty: "easy",
      mode: "rush",
      level: 1,
    });
    expect(plain.every((b) => b.label === String(b.value))).toBe(true);
  });
});
