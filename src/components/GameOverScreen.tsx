/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState, type ReactNode } from "react";
import { m } from "motion/react";
import {
  Check,
  Copy,
  Flame,
  House,
  Percent,
  RotateCcw,
  Ghost as GhostIcon,
  Share2,
  Sparkles,
  Target,
} from "lucide-react";
import { achievementById } from "@/game/achievements";
import { DIFFICULTIES, HEAT_TIERS, MODES } from "@/game/config";
import { accuracyOf, multiplierFor } from "@/game/engine";
import type { AchievementId, ScoreEntry } from "@/game/types";
import type { RunSummary } from "@/game/useBubbleGame";
import { Button } from "@/components/ui/Button";
import { canShare, shareResult, type ShareOutcome } from "@/lib/share";
import Leaderboard from "./Leaderboard";
import Footer from "./Footer";

interface GameOverScreenProps {
  summary: RunSummary;
  entries: ScoreEntry[];
  highlight: number;
  isBest: boolean;
  bestOverall: number;
  /** Badges this run just unlocked, revealed here as the reward. */
  earnedBadges: AchievementId[];
  dailyStreak: number;
  onReplay: () => void;
  onMenu: () => void;
}

const Metric = ({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-hairline bg-panel-sunk px-2 py-3">
    <span style={{ color }}>{icon}</span>
    <span className="font-display text-lg font-bold text-ink">{value}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
      {label}
    </span>
  </div>
);

export const GameOverScreen = ({
  summary,
  entries,
  highlight,
  isBest,
  bestOverall,
  earnedBadges,
  dailyStreak,
  onReplay,
  onMenu,
}: GameOverScreenProps) => {
  const [shared, setShared] = useState<ShareOutcome | null>(null);
  const accuracy = accuracyOf(summary.pops, summary.misses);
  const mode = MODES[summary.mode];
  const difficulty = DIFFICULTIES[summary.difficulty];

  const onShare = async () => {
    setShared(
      await shareResult({
        score: summary.score,
        multiplier: multiplierFor(summary.bestStreak),
        accuracy,
        level: summary.level,
        headline:
          (summary.day ? `Daily · ${difficulty.label}` : `${mode.label} · ${difficulty.label}`) +
          (summary.math ? " · Math" : ""),
        streak: summary.day ? dailyStreak : undefined,
      })
    );
  };

  return (
    <div className="flex min-h-[calc(var(--vh)*100)] w-full justify-center overflow-y-auto px-4 py-6 no-scrollbar md:items-center">
      <m.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 210, damping: 24 }}
        className="w-full max-w-xl"
      >
        <div className="panel rounded-[32px] p-6 text-center md:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-panel-sunk px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">
            {mode.label} · {difficulty.label}
            {summary.math && " · Math"} · Level {summary.level} ·{" "}
            {HEAT_TIERS[summary.maxHeat].label}
          </span>

          <h1
            className="mt-3 font-display text-4xl font-bold md:text-5xl"
            style={{
              color: isBest
                ? "var(--color-sun-deep)"
                : "var(--color-sky-deep)",
            }}
          >
            {isBest ? "New best!" : "Nice run!"}
          </h1>

          <m.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 16 }}
            className="mt-2 font-display text-6xl font-bold tabular-nums text-ink md:text-7xl"
          >
            {summary.score.toLocaleString()}
          </m.p>
          <p className="mt-1 text-sm font-bold text-ink-faint">
            {isBest
              ? "Straight to the top of your board."
              : `Personal best: ${bestOverall.toLocaleString()}`}
          </p>

          {summary.ghostScore !== null && (
            <p
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
              style={{
                background:
                  summary.score >= summary.ghostScore
                    ? "color-mix(in oklab, var(--good) 18%, transparent)"
                    : "color-mix(in oklab, var(--bad) 18%, transparent)",
                color:
                  summary.score >= summary.ghostScore
                    ? "var(--good)"
                    : "var(--bad)",
              }}
            >
              <GhostIcon size={15} strokeWidth={2.8} />
              {summary.score >= summary.ghostScore
                ? `Beat your ghost by ${(summary.score - summary.ghostScore).toLocaleString()}`
                : `Your ghost held on by ${(summary.ghostScore - summary.score).toLocaleString()}`}
            </p>
          )}

          <div className="mt-6 grid grid-cols-4 gap-2">
            <Metric
              icon={<Target size={17} strokeWidth={2.6} />}
              label="Pops"
              value={String(summary.pops)}
              color="var(--color-sky-deep)"
            />
            <Metric
              icon={<Flame size={17} strokeWidth={2.6} />}
              label="Streak"
              value={String(summary.bestStreak)}
              color="var(--color-sun-deep)"
            />
            <Metric
              icon={<Percent size={17} strokeWidth={2.6} />}
              label="Accuracy"
              value={`${accuracy}%`}
              color="var(--good)"
            />
            <Metric
              icon={<Sparkles size={17} strokeWidth={2.6} />}
              label="Powers"
              value={String(summary.powers)}
              color="var(--color-coral-deep)"
            />
          </div>

          {earnedBadges.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-5 rounded-2xl border-2 border-sun bg-sun/20 p-3.5 text-left"
            >
              <p className="mb-2 text-center font-display text-sm font-bold text-ink">
                {earnedBadges.length === 1
                  ? "New badge unlocked!"
                  : `${earnedBadges.length} new badges unlocked!`}
              </p>
              <ul className="space-y-1.5">
                {earnedBadges.map((id) => {
                  const badge = achievementById(id);
                  if (!badge) return null;
                  return (
                    <li key={id} className="flex items-center gap-2.5">
                      <span className="text-xl leading-none" aria-hidden>
                        {badge.emoji}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-sm font-bold leading-tight text-ink">
                          {badge.label}
                        </span>
                        <span className="block text-xs leading-tight text-ink-soft">
                          {badge.blurb}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </m.div>
          )}

          {summary.day && dailyStreak > 0 && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-ink-soft">
              <Flame size={15} strokeWidth={3} className="text-sun-deep" />
              {dailyStreak}-day daily streak
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            <Button variant="play" size="lg" block onClick={onReplay}>
              <RotateCcw size={19} strokeWidth={3} />
              Play again
            </Button>
            <div className="flex gap-2.5">
              <Button
                variant="soft"
                size="md"
                className="flex-1"
                onClick={onShare}
              >
                {shared === "copied" ? (
                  <>
                    <Check size={17} strokeWidth={3} />
                    Copied!
                  </>
                ) : shared === "shared" ? (
                  <>
                    <Check size={17} strokeWidth={3} />
                    Shared
                  </>
                ) : (
                  <>
                    {canShare() ? (
                      <Share2 size={17} strokeWidth={2.8} />
                    ) : (
                      <Copy size={17} strokeWidth={2.8} />
                    )}
                    Share
                  </>
                )}
              </Button>
              <Button
                variant="soft"
                size="md"
                className="flex-1"
                onClick={onMenu}
              >
                <House size={17} strokeWidth={2.6} />
                Menu
              </Button>
            </div>
          </div>

          <Leaderboard entries={entries} highlight={highlight} />
        </div>

        <Footer />
      </m.div>
    </div>
  );
};
