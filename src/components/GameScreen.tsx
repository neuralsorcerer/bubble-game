/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useEffect } from "react";
import { AnimatePresence, m } from "motion/react";
import { Pause, Play, Sparkles } from "lucide-react";
import { POWERS } from "@/game/config";
import type { Bubble, PopResult } from "@/game/types";
import type { GameSnapshot } from "@/game/useBubbleGame";
import BubbleGrid from "./BubbleGrid";
import { HudBottom, HudTop } from "./Hud";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface GameScreenProps {
  state: GameSnapshot;
  soundEnabled: boolean;
  onPop: (bubble: Bubble) => PopResult;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onExit: () => void;
}

/** Big centred call-out for a level-up or a power-up. */
const Banner = ({ banner }: { banner: NonNullable<GameSnapshot["banner"]> }) => {
  const power = banner.kind === "level" ? null : POWERS[banner.kind];
  const fill = power ? power.color : "var(--color-sun)";
  const ink = power ? power.ink : "#0b2447";

  return (
    <m.div
      key={banner.id}
      initial={{ opacity: 0, scale: 0.6, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.2, y: -20 }}
      transition={{ type: "spring", stiffness: 340, damping: 20 }}
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className="flex items-center gap-3 rounded-full border-[3px] border-white/80 px-6 py-3"
        style={{
          background: fill,
          color: ink,
          boxShadow: `0 6px 0 0 color-mix(in oklab, ${fill} 58%, #0b2447)`,
        }}
      >
        {power ? (
          <Icon name={power.icon} size={24} strokeWidth={2.8} />
        ) : (
          <Sparkles size={24} strokeWidth={2.8} />
        )}
        <div className="text-left leading-tight">
          <p className="font-display text-lg font-bold">
            {power ? power.label : "Level up!"}
          </p>
          <p className="text-[11px] font-bold opacity-80">
            {power ? power.blurb : "Bonus seconds added"}
          </p>
        </div>
      </div>
    </m.div>
  );
};

export const GameScreen = ({
  state,
  soundEnabled,
  onPop,
  onToggleSound,
  onTogglePause,
  onRestart,
  onExit,
}: GameScreenProps) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === "Escape") {
        event.preventDefault();
        onTogglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onTogglePause]);

  const paused = state.phase === "paused";

  return (
    <div className="flex h-[calc(var(--vh)*100)] w-full items-center justify-center p-0 sm:p-4">
      {/* The canvas: HUD wraps the board above and below. */}
      <div className="panel relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-none border-0 shadow-none sm:h-[calc(var(--vh)*92)] sm:max-w-5xl sm:rounded-[32px] sm:border-2 sm:shadow-[var(--drop)]">
        {/* Inert while paused, so the controls behind the overlay leave the
            tab order and the accessibility tree along with the board. */}
        <div className="flex min-h-0 flex-1 flex-col" inert={paused}>
          <HudTop state={state} />

          <div className="mx-3 min-h-0 flex-1 overflow-hidden rounded-3xl border-2 border-hairline bg-panel-sunk p-2.5 md:mx-5 md:p-4">
            <BubbleGrid
              bubbles={state.bubbles}
              interactive={!paused}
              onPop={onPop}
            />
          </div>

          <HudBottom
            state={state}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            onTogglePause={onTogglePause}
            onRestart={onRestart}
            onExit={onExit}
          />
        </div>

        <AnimatePresence>
          {state.banner && <Banner banner={state.banner} />}
        </AnimatePresence>

        <AnimatePresence>
          {paused && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: "auto" }}
              // Released as soon as it starts fading, so the first tap after
              // resuming lands on the board rather than the dying overlay.
              exit={{ opacity: 0, pointerEvents: "none" }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-panel/95"
            >
              <div className="panel flex h-20 w-20 items-center justify-center rounded-full">
                <Pause size={34} className="text-ink" strokeWidth={2.8} />
              </div>
              <div className="text-center">
                <h2 className="font-display text-3xl font-bold text-ink">
                  Paused
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Take your time — the clock is waiting.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button variant="play" size="lg" onClick={onTogglePause}>
                  <Play size={18} strokeWidth={3} fill="currentColor" />
                  Resume
                </Button>
                <Button variant="ghost" size="sm" onClick={onExit}>
                  Back to menu
                </Button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
