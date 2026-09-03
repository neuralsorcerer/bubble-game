/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 *
 * Math mode: a bubble still carries a value, it just wears a sum instead of a
 * digit. Every expression is built *from* the value it should equal, so a
 * decoy can never accidentally evaluate to the target.
 */

import { randomInt, type Rng } from "./rng";
import type { Difficulty } from "./types";

export type MathOp = "+" | "−" | "×" | "÷";

export interface MathStyle {
  ops: MathOp[];
  /** Ceiling for either side of the expression, keeping labels short. */
  maxOperand: number;
}

export const MATH_STYLES: Record<Difficulty, MathStyle> = {
  easy: { ops: ["+", "−"], maxOperand: 20 },
  medium: { ops: ["+", "−", "×"], maxOperand: 40 },
  hard: { ops: ["+", "−", "×", "÷"], maxOperand: 99 },
};

/** Factor pairs a×b = value with both sides in range and neither trivial. */
export const factorPairs = (value: number, max: number) => {
  const pairs: [number, number][] = [];
  for (let a = 2; a * a <= value; a++) {
    if (value % a !== 0) continue;
    const b = value / a;
    if (b <= max) pairs.push([a, b]);
  }
  return pairs;
};

/** Divisors b where value×b still fits, so a÷b reads cleanly. */
const divisors = (value: number, max: number) => {
  const options: number[] = [];
  for (let b = 2; b <= 9; b++) if (value * b <= max) options.push(b);
  return options;
};

const canUse = (op: MathOp, value: number, max: number) => {
  switch (op) {
    case "+":
      return value >= 2;
    case "−":
      return value + 1 <= max;
    case "×":
      return factorPairs(value, max).length > 0;
    case "÷":
      return divisors(value, max).length > 0;
  }
};

/**
 * An expression equal to `value`. Falls back to the plain number when no
 * operator fits — a prime beyond the operand ceiling, say — so a board is
 * never left without a poppable target.
 */
export const expressionFor = (
  rng: Rng,
  value: number,
  style: MathStyle
): string => {
  const viable = style.ops.filter((op) => canUse(op, value, style.maxOperand));
  if (viable.length === 0) return String(value);

  const op = viable[randomInt(rng, viable.length)];

  switch (op) {
    case "+": {
      const a = 1 + randomInt(rng, value - 1);
      return `${a}+${value - a}`;
    }
    case "−": {
      const headroom = style.maxOperand - value;
      const b = 1 + randomInt(rng, Math.min(headroom, style.maxOperand));
      return `${value + b}−${b}`;
    }
    case "×": {
      const pairs = factorPairs(value, style.maxOperand);
      const [a, b] = pairs[randomInt(rng, pairs.length)];
      return `${a}×${b}`;
    }
    case "÷": {
      const options = divisors(value, style.maxOperand);
      const b = options[randomInt(rng, options.length)];
      return `${value * b}÷${b}`;
    }
  }
};
