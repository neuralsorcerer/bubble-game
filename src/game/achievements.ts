/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  CENTURY_POPS,
  HEAT_TIERS,
  MAX_HEAT,
  MAX_MULTIPLIER,
  THOUSAND_POPS,
} from "./config";
import { accuracyOf, multiplierFor } from "./engine";
import type { AchievementId, RunStats } from "./types";
import type { Totals } from "@/lib/storage";

export interface Achievement {
  id: AchievementId;
  label: string;
  blurb: string;
  emoji: string;
}

/** What a finished run is judged against. */
export interface AchievementContext extends RunStats {
  score: number;
  difficulty: string;
  mode: string;
  math: boolean;
  /** Lifetime figures, already including the run that just ended. */
  totals: Totals;
  dailyStreak: number;
}

interface Rule extends Achievement {
  earned: (context: AchievementContext) => boolean;
}

/**
 * Every badge is a "you did a nice thing" — none of them scold, and none can
 * be lost once earned.
 */
const RULES: Rule[] = [
  {
    id: "first-pop",
    label: "First Pop",
    blurb: "Pop your very first bubble.",
    emoji: "🫧",
    earned: (c) => c.totals.pops >= 1,
  },
  {
    id: "century",
    label: "Century",
    blurb: `Pop ${CENTURY_POPS} bubbles in total.`,
    emoji: "💯",
    earned: (c) => c.totals.pops >= CENTURY_POPS,
  },
  {
    id: "thousand",
    label: "Bubble Wrangler",
    blurb: `Pop ${THOUSAND_POPS.toLocaleString()} bubbles in total.`,
    emoji: "🌊",
    earned: (c) => c.totals.pops >= THOUSAND_POPS,
  },
  {
    id: "combo-four",
    label: "Warmed Up",
    blurb: "Reach a ×4 combo.",
    emoji: "🔥",
    earned: (c) => multiplierFor(c.bestStreak) >= 4,
  },
  {
    id: "combo-max",
    label: "Untouchable",
    blurb: `Reach the ×${MAX_MULTIPLIER} combo ceiling.`,
    emoji: "⚡",
    earned: (c) => multiplierFor(c.bestStreak) >= MAX_MULTIPLIER,
  },
  {
    id: "score-1k",
    label: "Four Figures",
    blurb: "Score 1,000 in a single run.",
    emoji: "⭐",
    earned: (c) => c.score >= 1000,
  },
  {
    id: "score-5k",
    label: "High Roller",
    blurb: "Score 5,000 in a single run.",
    emoji: "👑",
    earned: (c) => c.score >= 5000,
  },
  {
    id: "level-ten",
    label: "Double Digits",
    blurb: "Reach level 10 in one run.",
    emoji: "🚀",
    earned: (c) => c.level >= 10,
  },
  {
    id: "sharpshooter",
    label: "Sharpshooter",
    blurb: "Finish a run of 20+ pops at 95% accuracy.",
    emoji: "🎯",
    earned: (c) => c.pops >= 20 && accuracyOf(c.pops, c.misses) >= 95,
  },
  {
    id: "flawless",
    label: "Flawless",
    blurb: "Finish a run of 15+ pops without a single miss.",
    emoji: "💎",
    earned: (c) => c.pops >= 15 && c.misses === 0,
  },
  {
    id: "power-hungry",
    label: "Power Hungry",
    blurb: "Grab 10 power-ups in one run.",
    emoji: "🍬",
    earned: (c) => c.powers >= 10,
  },
  {
    id: "hard-graft",
    label: "Hard Graft",
    blurb: "Score 2,000 on Hard.",
    emoji: "🧗",
    earned: (c) => c.difficulty === "hard" && c.score >= 2000,
  },
  {
    id: "molten",
    label: HEAT_TIERS[MAX_HEAT].label,
    blurb: `Play one run long enough to reach ${HEAT_TIERS[MAX_HEAT].label} heat.`,
    emoji: "🌋",
    earned: (c) => c.maxHeat >= MAX_HEAT,
  },
  {
    id: "mathlete",
    label: "Mathlete",
    blurb: "Score 1,000 in a math mode run.",
    emoji: "🧮",
    earned: (c) => c.math && c.score >= 1000,
  },
  {
    id: "daily-three",
    label: "Habit Forming",
    blurb: "Play the daily challenge 3 days running.",
    emoji: "📅",
    earned: (c) => c.dailyStreak >= 3,
  },
  {
    id: "daily-seven",
    label: "Week Streak",
    blurb: "Play the daily challenge 7 days running.",
    emoji: "🏅",
    earned: (c) => c.dailyStreak >= 7,
  },
];

export const ACHIEVEMENTS: Achievement[] = RULES.map(
  ({ id, label, blurb, emoji }) => ({ id, label, blurb, emoji })
);

export const achievementById = (id: AchievementId) =>
  ACHIEVEMENTS.find((item) => item.id === id);

/** Badges the run just earned that the player did not already hold. */
export const newlyEarned = (
  context: AchievementContext,
  held: AchievementId[]
): AchievementId[] =>
  RULES.filter((rule) => !held.includes(rule.id) && rule.earned(context)).map(
    (rule) => rule.id
  );
