/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import BubbleButton from "./Bubble";
import { POWERS } from "@/game/config";
import type { Bubble, PopResult } from "@/game/types";
import { useBoardFit } from "@/hooks/useBoardFit";

interface Floater {
  id: number;
  x: number;
  y: number;
  points: number;
  label: string;
  color: string;
}

/** Colour-coded outcomes: good is green, bad is red. */
const TONE_COLOR: Record<PopResult["tone"], string> = {
  hit: "var(--good)",
  miss: "var(--bad)",
  power: "var(--color-coral-deep)",
  level: "var(--color-sun-deep)",
};

interface BubbleGridProps {
  bubbles: Bubble[];
  interactive: boolean;
  onPop: (bubble: Bubble) => PopResult;
}

/**
 * The board. Owns its own eye candy — bubble sizing and the floating score
 * chips — plus arrow-key navigation, so the game is playable without a mouse
 * and without tabbing through seventy-odd bubbles.
 */
const BubbleGrid = ({ bubbles, interactive, onPop }: BubbleGridProps) => {
  const { ref, size, columns, gap } = useBoardFit(bubbles.length);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const floaterId = useRef(0);
  const timers = useRef<number[]>([]);
  /** Set once the player reaches for the keyboard, so focus is worth restoring. */
  const usingKeys = useRef(false);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  // Derived rather than stored, so a rebuilt board never leaves a stale index.
  const activeIndex = useMemo(() => {
    const chosen = bubbles[focusIndex];
    if (chosen && !chosen.dead) return focusIndex;
    return Math.max(
      0,
      bubbles.findIndex((bubble) => !bubble.dead)
    );
  }, [bubbles, focusIndex]);

  const focusBubble = useCallback(
    (index: number) => {
      ref.current
        ?.querySelector<HTMLButtonElement>(`[data-bubble="${index}"]`)
        ?.focus();
    },
    [ref]
  );

  // A pop replaces the board and takes the focused element with it. Put focus
  // back on the board so keyboard play can carry on uninterrupted.
  useEffect(() => {
    if (!usingKeys.current || !interactive) return;
    const active = document.activeElement;
    if (active && active !== document.body && ref.current?.contains(active)) {
      return;
    }
    focusBubble(activeIndex);
  }, [bubbles, activeIndex, focusBubble, interactive, ref]);

  const handlePop = useCallback(
    (bubble: Bubble, event: MouseEvent<HTMLButtonElement>) => {
      const result = onPop(bubble);
      if (!result.label && result.points === 0) return;

      const board = ref.current?.getBoundingClientRect();
      const target = event.currentTarget.getBoundingClientRect();
      const x = target.left + target.width / 2 - (board?.left ?? 0);
      const y = target.top - (board?.top ?? 0);

      const id = ++floaterId.current;
      const color = result.power
        ? POWERS[result.power].color
        : TONE_COLOR[result.tone];

      setFloaters((current) => [
        ...current.slice(-6),
        { id, x, y, points: result.points, label: result.label, color },
      ]);

      timers.current.push(
        window.setTimeout(
          () =>
            setFloaters((current) => current.filter((item) => item.id !== id)),
          900
        )
      );
    },
    [onPop, ref]
  );

  /** Walks from `from` in `step`s until it lands on a bubble still in play. */
  const nextLive = useCallback(
    (from: number, step: number) => {
      for (let i = from; i >= 0 && i < bubbles.length; i += step) {
        if (!bubbles[i].dead) return i;
      }
      return -1;
    },
    [bubbles]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const moves: Record<string, number> = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowDown: columns,
        ArrowUp: -columns,
      };

      const step = moves[event.key];
      let next: number;
      if (step !== undefined) {
        next = nextLive(activeIndex + step, Math.sign(step));
      } else if (event.key === "Home") {
        next = nextLive(0, 1);
      } else if (event.key === "End") {
        next = nextLive(bubbles.length - 1, -1);
      } else {
        return;
      }

      event.preventDefault();
      usingKeys.current = true;
      if (next < 0) return;
      setFocusIndex(next);
      focusBubble(next);
    },
    [activeIndex, bubbles.length, columns, focusBubble, nextLive]
  );

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-auto no-scrollbar"
      onKeyDown={onKeyDown}
      onPointerDown={() => {
        usingKeys.current = false;
      }}
    >
      <div
        role="grid"
        aria-label="Bubble board"
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(auto-fit, ${size}px)`,
          gap,
          justifyContent: "center",
          alignContent: "center",
          pointerEvents: interactive ? "auto" : "none",
        }}
      >
        {bubbles.map((bubble, index) => (
          <BubbleButton
            key={bubble.id}
            bubble={bubble}
            index={index}
            size={size}
            // One tab stop for the whole board; arrows move within it.
            tabbable={index === activeIndex}
            onPop={handlePop}
          />
        ))}
      </div>

      {floaters.map((floater) => (
        <span
          key={floater.id}
          className="floater flex flex-col items-center text-center"
          style={{ left: floater.x, top: floater.y, color: floater.color }}
        >
          {floater.points > 0 && (
            <span className="text-2xl md:text-3xl">+{floater.points}</span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wide">
            {floater.label}
          </span>
        </span>
      ))}
    </div>
  );
};

export default memo(BubbleGrid);
