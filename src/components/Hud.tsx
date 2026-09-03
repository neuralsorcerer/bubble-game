/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  Flame,
  Ghost as GhostIcon,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Snowflake,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  HEAT_TIERS,
  MAX_MULTIPLIER,
  POPS_PER_LEVEL,
  STREAK_PER_STEP,
  URGENT_SECONDS,
} from "@/game/config";
import { formatClock } from "@/game/engine";
import type { GameSnapshot } from "@/game/useBubbleGame";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Short label, big number — readable at a glance mid-run. */
const Stat = ({
  label,
  value,
  accent,
  progress,
  progressColor = "var(--color-sky-deep)",
}: {
  label: string;
  value: string;
  accent?: string;
  progress?: number;
  progressColor?: string;
}) => (
  <div className="panel-sm relative flex flex-1 flex-col items-center overflow-hidden rounded-2xl px-3 py-1.5 leading-none sm:min-w-[84px] sm:flex-none">
    <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-faint">
      {label}
    </span>
    <span
      className="font-display text-lg font-bold tabular-nums md:text-xl"
      style={accent ? { color: accent } : undefined}
    >
      {value}
    </span>
    {progress !== undefined && (
      <span
        className="absolute bottom-0 left-0 h-[4px] transition-[width] duration-300"
        style={{ width: `${progress * 100}%`, background: progressColor }}
      />
    )}
  </div>
);

/**
 * The run's heat, shown plainly. A difficulty ramp the player cannot see reads
 * as the game cheating, so the tier and its progress are always on screen.
 */
const HeatChip = ({ heat, progress }: { heat: number; progress: number }) => {
  const tier = HEAT_TIERS[heat];
  return (
    <span
      className="relative flex items-center gap-1 overflow-hidden rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ background: `${tier.color}30`, color: tier.color }}
      title={`Heat ${heat + 1} of ${HEAT_TIERS.length}: hits buy ${Math.round(
        tier.timeScale * 100
      )}% of their usual seconds`}
    >
      <Flame size={11} strokeWidth={3} />
      {tier.label}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] transition-[width] duration-500"
        style={{ width: `${progress * 100}%`, background: tier.color }}
      />
    </span>
  );
};

/** Top of the canvas: what to hunt for, and how long you have. */
export const HudTop = ({ state }: { state: GameSnapshot }) => {
  const frozen = state.freezeMs > 0;
  const urgent = !frozen && state.secondsLeft <= URGENT_SECONDS;
  const fill = Math.max(0, Math.min(1, state.timeMs / state.capMs));

  return (
    <div className="flex shrink-0 items-center gap-3 px-3 pb-2 pt-3 md:gap-5 md:px-5 md:pt-4">
      <div className="flex shrink-0 items-center gap-3">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-sky bg-panel md:h-20 md:w-20",
            "shadow-[0_5px_0_0_var(--color-sky-deep)]",
            !urgent && "animate-heartbeat"
          )}
          aria-live="polite"
          aria-label={`Pop the number ${state.target}`}
        >
          <span className="font-display text-3xl font-bold leading-none text-ink md:text-4xl">
            {state.target}
          </span>
        </div>
        <span className="hidden text-xs font-bold uppercase leading-[1.35] tracking-[0.18em] text-ink-faint sm:block">
          Pop
          <br />
          this
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              "font-display text-2xl font-bold tabular-nums md:text-3xl",
              urgent && "animate-heartbeat text-bad"
            )}
            style={frozen ? { color: "var(--color-sky-deep)" } : undefined}
          >
            {formatClock(state.secondsLeft)}
            <span className="ml-0.5 text-sm font-bold text-ink-faint">s</span>
          </span>

          {frozen ? (
            <span className="flex items-center gap-1 rounded-full bg-sky/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-deep">
              <Snowflake size={11} strokeWidth={3} />
              Frozen
            </span>
          ) : (
            <HeatChip heat={state.heat} progress={state.heatProgress} />
          )}
        </div>

        <div className="h-3.5 overflow-hidden rounded-full border-2 border-hairline bg-panel-sunk">
          <div
            className="h-full rounded-full transition-[width,background-color] duration-150 ease-linear"
            style={{
              width: `${fill * 100}%`,
              backgroundColor: frozen
                ? "var(--color-sky)"
                : urgent
                  ? "var(--bad)"
                  : "var(--good)",
            }}
            role="progressbar"
            aria-label="Time remaining"
            aria-valuemin={0}
            aria-valuemax={Math.round(state.capMs / 1000)}
            aria-valuenow={Math.ceil(state.secondsLeft)}
          />
        </div>
      </div>
    </div>
  );
};

interface HudBottomProps {
  state: GameSnapshot;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onExit: () => void;
}

/**
 * How this run compares to your best one at the same point on the clock.
 * Green means you are ahead of your own ghost, red means it is beating you.
 */
const GhostChip = ({ delta }: { delta: number }) => {
  const ahead = delta >= 0;
  return (
    <span
      className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
      style={{
        background: ahead
          ? "color-mix(in oklab, var(--good) 18%, transparent)"
          : "color-mix(in oklab, var(--bad) 18%, transparent)",
        color: ahead ? "var(--good)" : "var(--bad)",
      }}
      title="How far ahead of your best run you are right now"
      aria-label={`${ahead ? "Ahead of" : "Behind"} your best run by ${Math.abs(delta)}`}
    >
      <GhostIcon size={13} strokeWidth={2.8} />
      {ahead ? "+" : "−"}
      {Math.abs(delta).toLocaleString()}
    </span>
  );
};

/** Bottom of the canvas: how you are doing, and the controls. */
export const HudBottom = ({
  state,
  soundEnabled,
  onToggleSound,
  onTogglePause,
  onRestart,
  onExit,
}: HudBottomProps) => (
  <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 px-3 pb-3 pt-2 md:px-5 md:pb-4">
    <div className="flex w-full items-stretch gap-2 sm:w-auto sm:flex-1">
      <Stat label="Score" value={state.score.toLocaleString()} />
      {state.ghostDelta !== null && (
        <div className="flex items-center">
          <GhostChip delta={state.ghostDelta} />
        </div>
      )}
      <Stat
        label="Combo"
        value={`×${state.multiplier}`}
        accent={
          state.multiplier >= 4
            ? "var(--color-coral-deep)"
            : state.multiplier > 1
              ? "var(--color-sun-deep)"
              : undefined
        }
        // How close the next multiplier step is — the heat meter.
        progress={
          state.multiplier >= MAX_MULTIPLIER
            ? 1
            : (state.streak % STREAK_PER_STEP) / STREAK_PER_STEP
        }
        progressColor="var(--color-coral)"
      />
      <Stat
        label="Level"
        value={String(state.level)}
        progress={(state.pops % POPS_PER_LEVEL) / POPS_PER_LEVEL}
      />
    </div>

    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        variant="soft"
        size="chip"
        onClick={onTogglePause}
        aria-label={state.phase === "paused" ? "Resume" : "Pause"}
      >
        {state.phase === "paused" ? <Play size={16} /> : <Pause size={16} />}
      </Button>
      <Button
        variant="soft"
        size="chip"
        onClick={onToggleSound}
        aria-pressed={soundEnabled}
        aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </Button>
      <Button
        variant="soft"
        size="chip"
        onClick={onRestart}
        aria-label="Restart run"
      >
        <RotateCcw size={16} />
      </Button>
      <Button
        variant="soft"
        size="chip"
        onClick={onExit}
        aria-label="Back to menu"
      >
        <LogOut size={16} />
      </Button>
    </div>
  </div>
);
