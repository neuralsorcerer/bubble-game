/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 *
 * Pure game maths: no React, no DOM, no side effects.
 */

import {
  BUBBLE_SKINS,
  DIFFICULTIES,
  HEAT_THRESHOLDS,
  HEAT_TIERS,
  MATH_MODIFIER,
  MAX_HEAT,
  MAX_MULTIPLIER,
  MODES,
  POWERS,
  POWER_ORDER,
  POPS_PER_LEVEL,
  STREAK_PER_STEP,
} from "./config";
import { expressionFor, MATH_STYLES } from "./math";
import { randomInt, type Rng } from "./rng";
import type { Bubble, Difficulty, Mode, PowerKind } from "./types";

let nextBubbleId = 1;

const makeBubble = (
  rng: Rng,
  value: number,
  power: PowerKind | null = null,
  label = String(value)
): Bubble => ({
  id: nextBubbleId++,
  value,
  label,
  skin: randomInt(rng, BUBBLE_SKINS.length),
  power,
  seed: rng(),
  dead: false,
});

/** Fisher–Yates, in place. */
const shuffle = <T>(rng: Rng, items: T[]): T[] => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const multiplierFor = (streak: number) =>
  Math.min(1 + Math.floor(streak / STREAK_PER_STEP), MAX_MULTIPLIER);

/** Pops still needed before the next level. */
export const popsToNextLevel = (pops: number) =>
  POPS_PER_LEVEL - (pops % POPS_PER_LEVEL);

export const levelForPops = (pops: number) =>
  Math.floor(pops / POPS_PER_LEVEL) + 1;

/**
 * How hot the run has become. Driven by seconds actually played — a paused or
 * frozen clock buys real breathing room, not just a pause in the countdown.
 */
export const heatFor = (playedSeconds: number, mode: Mode) => {
  const scaled = playedSeconds * MODES[mode].heatScale;
  let tier = 0;
  while (tier < MAX_HEAT && scaled >= HEAT_THRESHOLDS[tier + 1]) tier += 1;
  return tier;
};

/** Progress towards the next tier, 0–1. Reads 1 once the top tier is reached. */
export const heatProgress = (playedSeconds: number, mode: Mode) => {
  const heat = heatFor(playedSeconds, mode);
  if (heat >= MAX_HEAT) return 1;
  const scaled = playedSeconds * MODES[mode].heatScale;
  const from = HEAT_THRESHOLDS[heat];
  const to = HEAT_THRESHOLDS[heat + 1];
  return clamp((scaled - from) / (to - from), 0, 1);
};

/** Seconds a correct pop buys, thinned by heat and widened by math mode. */
export const timeBonusFor = (
  difficulty: Difficulty,
  heat: number,
  math = false
) =>
  DIFFICULTIES[difficulty].timeBonus *
  HEAT_TIERS[heat].timeScale *
  (math ? MATH_MODIFIER.timeBonusScale : 1);

/** Points a single hit is worth before the combo multiplier. */
export const basePointsFor = (difficulty: Difficulty, math = false) =>
  Math.round(
    DIFFICULTIES[difficulty].basePoints * (math ? MATH_MODIFIER.pointsScale : 1)
  );

export const startTimeFor = (difficulty: Difficulty, mode: Mode, math = false) =>
  (MODES[mode].startTime ?? DIFFICULTIES[difficulty].startTime) +
  (math ? MATH_MODIFIER.extraStartTime : 0);

export const capTimeFor = (difficulty: Difficulty, mode: Mode, math = false) =>
  (MODES[mode].capTime ?? DIFFICULTIES[difficulty].capTime) +
  (math ? MATH_MODIFIER.extraCapTime : 0);

/** Picks a fresh target, never repeating the previous one. */
export const pickTarget = (
  rng: Rng,
  difficulty: Difficulty,
  previous: number
) => {
  const { maxNumber } = DIFFICULTIES[difficulty];
  if (maxNumber <= 1) return 1;
  let next = randomInt(rng, maxNumber) + 1;
  while (next === previous) next = randomInt(rng, maxNumber) + 1;
  return next;
};

const rollPower = (rng: Rng): PowerKind => {
  const total = POWER_ORDER.reduce((sum, k) => sum + POWERS[k].weight, 0);
  let roll = rng() * total;
  for (const kind of POWER_ORDER) {
    roll -= POWERS[kind].weight;
    if (roll <= 0) return kind;
  }
  return "star";
};

export interface FieldOptions {
  rng: Rng;
  target: number;
  difficulty: Difficulty;
  mode: Mode;
  level: number;
  /** Current heat tier; nudges the target a little thinner. */
  heat?: number;
  /** Dresses every bubble as a sum that evaluates to its value. */
  math?: boolean;
  /** Suppressed on the very first field so the opening move is never wasted. */
  allowPowers?: boolean;
}

/**
 * Builds a full board. The count of target bubbles is guaranteed to be at
 * least one, and power-ups only ever replace decoys — so a board is always
 * winnable no matter how the dice land.
 */
export const buildField = ({
  rng,
  target,
  difficulty,
  mode,
  level,
  heat = 0,
  math = false,
  allowPowers = true,
}: FieldOptions): Bubble[] => {
  const config = DIFFICULTIES[difficulty];
  const modeConfig = MODES[mode];
  const steps = Math.max(0, level - 1);

  const full = Math.min(
    config.baseCount + steps * config.countPerLevel,
    config.baseCount + config.maxExtra
  );
  // A sum takes longer to read than a digit, so math mode deals fewer of them.
  const count = math ? Math.round(full * MATH_MODIFIER.countScale) : full;

  const ratio =
    Math.max(
      config.minTargetRatio,
      config.targetRatio -
        steps * config.ratioDecay * modeConfig.rampScale -
        HEAT_TIERS[clamp(heat, 0, MAX_HEAT)].ratioDrop
    ) * (math ? MATH_MODIFIER.targetRatioScale : 1);

  const targetCount = Math.max(1, Math.round(count * ratio));
  const decoyCount = count - targetCount;

  // Expressions are built from the value they must equal, so a decoy can never
  // accidentally evaluate to the target.
  const style = math ? MATH_STYLES[difficulty] : null;
  const dress = (value: number) =>
    style ? expressionFor(rng, value, style) : String(value);

  const bubbles: Bubble[] = [];
  for (let i = 0; i < targetCount; i++) {
    bubbles.push(makeBubble(rng, target, null, dress(target)));
  }

  for (let i = 0; i < decoyCount; i++) {
    let value = randomInt(rng, config.maxNumber) + 1;
    while (value === target) value = randomInt(rng, config.maxNumber) + 1;
    bubbles.push(makeBubble(rng, value, null, dress(value)));
  }

  if (allowPowers && decoyCount > 2) {
    const chance = modeConfig.powerChance;
    let slots = 0;
    if (rng() < chance) slots = 1;
    if (slots === 1 && rng() < chance * 0.35) slots = 2;

    // Power-ups always take over decoys, never the target bubbles.
    for (let i = 0; i < slots; i++) {
      const decoy = bubbles[targetCount + i];
      decoy.power = rollPower(rng);
    }
  }

  return shuffle(rng, bubbles);
};

/** Formats seconds as `M:SS`, or `SS.s` for the final urgent stretch. */
export const formatClock = (seconds: number) => {
  if (seconds < 10) return seconds.toFixed(1);
  const whole = Math.ceil(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : String(secs);
};

export const accuracyOf = (pops: number, misses: number) =>
  pops + misses === 0 ? 100 : Math.round((pops / (pops + misses)) * 100);

const PRAISE = ["Nice!", "Sweet!", "Boom!", "Pop!", "Yes!", "Crisp!", "Zing!"];

/**
 * A little variety in the floating text. Deliberately off the seeded stream —
 * flavour text must never shift a daily challenge's boards.
 */
export const praiseFor = (multiplier: number) => {
  if (multiplier >= 6) return "UNREAL!";
  if (multiplier >= 4) return "ON FIRE!";
  if (multiplier >= 2) return "COMBO!";
  return PRAISE[Math.floor(Math.random() * PRAISE.length)];
};
