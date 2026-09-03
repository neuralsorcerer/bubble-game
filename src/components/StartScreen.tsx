/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useState } from "react";
import { m } from "motion/react";
import { Calculator, ChevronRight, Play, Trophy } from "lucide-react";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  MODES,
  MODE_ORDER,
  POWERS,
  POWER_ORDER,
} from "@/game/config";
import type { DailyChallenge } from "@/game/daily";
import { startTimeFor } from "@/game/engine";
import type { Difficulty, Mode } from "@/game/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import Footer from "./Footer";
import { DailyCard } from "./DailyCard";
import { cn } from "@/lib/utils";
import type { DailyRecord, Totals } from "@/lib/storage";

interface StartScreenProps {
  difficulty: Difficulty;
  mode: Mode;
  best: number;
  bestOverall: number;
  totals: Totals;
  challenge: DailyChallenge;
  daily: DailyRecord;
  badgeCount: number;
  math: boolean;
  onDifficulty: (value: Difficulty) => void;
  onMode: (value: Mode) => void;
  onMath: (value: boolean) => void;
  onPlay: () => void;
  onPlayDaily: () => void;
}

/** What arithmetic each difficulty deals, for the toggle's hint line. */
const MATH_HINT: Record<Difficulty, string> = {
  easy: "adding and subtracting",
  medium: "adding, subtracting and times tables",
  hard: "all four operations",
};

/** Flat slab styling for the two pickers, shared so they stay in step. */
const slab = (active: boolean) =>
  cn(
    "relative rounded-2xl border-2 transition-transform duration-100",
    active
      ? "text-navy translate-y-0"
      : "border-hairline bg-panel-sunk text-ink hover:-translate-y-0.5"
  );

const activeSlab = (fill: string, shade: string) => ({
  background: fill,
  borderColor: shade,
  boxShadow: `0 5px 0 0 ${shade}`,
});

/** Only the two pickable modes need a slab colour. */
const MODE_COLORS: Record<"rush" | "chill", [string, string]> = {
  rush: ["#ff6b81", "#be123c"],
  chill: ["#4ade80", "#15803d"],
};

export const StartScreen = ({
  difficulty,
  mode,
  best,
  bestOverall,
  totals,
  challenge,
  daily,
  badgeCount,
  math,
  onDifficulty,
  onMode,
  onMath,
  onPlay,
  onPlayDaily,
}: StartScreenProps) => {
  // A first-time player gets the rules already open; everyone else does not.
  const [showHelp, setShowHelp] = useState(() => totals.games === 0);
  const modeConfig = MODES[mode];

  return (
    <div className="flex min-h-[calc(var(--vh)*100)] w-full justify-center overflow-y-auto px-4 py-6 no-scrollbar md:items-center">
      <m.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="w-full max-w-xl"
      >
        <div className="panel rounded-[32px] p-6 md:p-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-sky/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-deep">
              Reflex • Fun • Fast
            </span>
            <h1 className="mt-3 font-display text-5xl font-bold leading-none md:text-6xl">
              <span className="text-sky-deep">Bubble</span>{" "}
              <span className="text-coral">Game</span>
            </h1>
            <p className="mx-auto mt-2.5 max-w-md text-sm text-ink-soft md:text-base">
              Find the number. Pop it. Keep the combo alive.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-2 rounded-full border-2 border-[#a16207] bg-sun px-3.5 py-1.5 text-sm font-bold text-navy shadow-[0_3px_0_0_#a16207]">
              <Trophy size={15} strokeWidth={2.8} />
              Best {bestOverall.toLocaleString()}
            </span>
            {totals.games > 0 && (
              <span className="rounded-full bg-panel-sunk px-3.5 py-1.5 text-sm font-bold text-ink-soft">
                {totals.games} {totals.games === 1 ? "run" : "runs"} ·{" "}
                {totals.pops.toLocaleString()} pops
              </span>
            )}
            {badgeCount > 0 && (
              <span className="rounded-full bg-panel-sunk px-3.5 py-1.5 text-sm font-bold text-ink-soft">
                {badgeCount} {badgeCount === 1 ? "badge" : "badges"}
              </span>
            )}
          </div>

          <div className="mt-6">
            <DailyCard
              challenge={challenge}
              record={daily}
              onPlay={onPlayDaily}
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Or set up your own run
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MODE_ORDER.map((value) => {
                const item = MODES[value];
                const active = value === mode;
                const [fill, shade] = MODE_COLORS[value as "rush" | "chill"];
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onMode(value)}
                    aria-pressed={active}
                    className={cn(
                      slab(active),
                      "flex flex-col items-start gap-1 p-3.5 text-left"
                    )}
                    style={active ? activeSlab(fill, shade) : undefined}
                  >
                    <span className="flex items-center gap-2 font-display text-base font-bold">
                      <Icon name={item.icon} size={18} />
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-bold leading-snug",
                        active ? "opacity-75" : "text-ink-faint"
                      )}
                    >
                      {item.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Difficulty
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {DIFFICULTY_ORDER.map((value) => {
                const item = DIFFICULTIES[value];
                const active = value === difficulty;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onDifficulty(value)}
                    aria-pressed={active}
                    className={cn(
                      slab(active),
                      "flex flex-col items-center gap-1 py-3"
                    )}
                    style={active ? activeSlab("#38bdf8", "#0369a1") : undefined}
                  >
                    <Icon name={item.icon} size={20} />
                    <span className="font-display text-sm font-bold">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        active ? "opacity-75" : "text-ink-faint"
                      )}
                    >
                      {item.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              "mt-4 flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 transition-colors",
              math
                ? "border-grape/60 bg-grape/10"
                : "border-hairline bg-panel-sunk"
            )}
            style={
              math
                ? {
                    borderColor: "#a855f7",
                    background: "color-mix(in oklab, #a855f7 12%, transparent)",
                  }
                : undefined
            }
          >
            <Calculator
              size={19}
              strokeWidth={2.6}
              style={{ color: math ? "#a855f7" : "var(--ink-soft)" }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-ink">
                Math mode
              </p>
              <p className="text-xs text-ink-faint">
                {math
                  ? `Bubbles show sums. Pop the ones that equal the target — ${MATH_HINT[difficulty]}.`
                  : "Bubbles show sums instead of numbers."}
              </p>
            </div>
            <Toggle on={math} onChange={() => onMath(!math)} label="Math mode" />
          </div>

          <Button
            variant="play"
            size="lg"
            block
            className="mt-4 animate-nudge"
            onClick={onPlay}
          >
            <Play size={20} strokeWidth={3} fill="currentColor" />
            Play {modeConfig.label}
            {math && " Math"}
          </Button>

          <p className="mt-3 text-center text-xs font-bold text-ink-faint">
            {modeConfig.blurb} Starts at {startTimeFor(difficulty, mode, math)}s
            {best > 0 && ` · your best here is ${best.toLocaleString()}`}
          </p>

          <button
            type="button"
            onClick={() => setShowHelp((open) => !open)}
            aria-expanded={showHelp}
            className="mt-5 flex w-full items-center justify-between rounded-2xl border-2 border-hairline bg-panel-sunk px-4 py-3 text-left"
          >
            <span className="font-display text-sm font-bold text-ink">
              How to play &amp; power-ups
            </span>
            <ChevronRight
              size={18}
              className={cn(
                "text-ink-faint transition-transform duration-200",
                showHelp && "rotate-90"
              )}
            />
          </button>

          {showHelp && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>
                  <strong className="text-ink">Pop the target.</strong> The
                  number in the ring is what you are hunting.
                </li>
                <li>
                  <strong className="text-ink">Chain them.</strong> Every 4 hits
                  in a row bumps your multiplier, up to ×8.
                </li>
                <li>
                  <strong className="text-ink">Miss freely.</strong> A wrong tap
                  just burns that bubble away
                  {modeConfig.punishing
                    ? " and shaves a second off the clock."
                    : " — Chill mode costs you nothing."}
                </li>
                <li>
                  <strong className="text-ink">Level up.</strong> Every 8 pops
                  adds a level, bonus seconds and a livelier board.
                </li>
                <li>
                  <strong className="text-ink">Watch the heat.</strong> The
                  longer a run lasts the hotter it gets, and each hit buys you
                  fewer seconds than the last. A freeze holds the heat too.
                </li>
                <li>
                  <strong className="text-ink">Math mode.</strong> Every bubble
                  wears a sum. Pop the ones that work out to the target — worth
                  more points, on a smaller board with more time per hit.
                </li>
                <li>
                  <strong className="text-ink">Race your ghost.</strong> Once
                  you have a best run here, the chip beside your score shows how
                  far ahead of it you are right now.
                </li>
              </ul>

              <div className="mt-4 space-y-2.5">
                {POWER_ORDER.map((kind) => {
                  const power = POWERS[kind];
                  return (
                    <div key={kind} className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: power.color,
                          color: power.ink,
                          boxShadow: `inset 0 -3px 0 0 color-mix(in oklab, ${power.color} 76%, #0b2447)`,
                        }}
                      >
                        <Icon name={power.icon} size={17} strokeWidth={2.8} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-sm font-bold text-ink">
                          {power.label}
                        </p>
                        <p className="text-xs text-ink-faint">{power.blurb}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </m.div>
          )}
        </div>

        <Footer />
      </m.div>
    </div>
  );
};
