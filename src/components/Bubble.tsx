/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { memo, type MouseEvent } from "react";
import { BUBBLE_SKINS, POWERS } from "@/game/config";
import type { Bubble } from "@/game/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const SPOKEN: Record<string, string> = {
  "+": " plus ",
  "−": " minus ",
  "×": " times ",
  "÷": " divided by ",
};

/** "7+5" reads as gibberish to a screen reader; "7 plus 5" does not. */
const spoken = (label: string) =>
  label.replace(/[+−×÷]/g, (op) => SPOKEN[op] ?? op);

/** Type size as a fraction of the bubble, by how much label there is. */
const labelScale = (length: number) => {
  if (length <= 1) return 0.46;
  if (length === 2) return 0.4;
  if (length === 3) return 0.32;
  if (length === 4) return 0.26;
  return 0.22;
};

interface BubbleButtonProps {
  bubble: Bubble;
  index: number;
  size: number;
  /** The board keeps a single tab stop; arrow keys move between bubbles. */
  tabbable: boolean;
  onPop: (bubble: Bubble, event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Flat-shaded arcade art: one solid colour, a hard darker band along the
 * bottom for weight, a crisp white highlight, and a chunky navy drop.
 */
const BubbleButton = ({
  bubble,
  index,
  size,
  tabbable,
  onPop,
}: BubbleButtonProps) => {
  const power = bubble.power ? POWERS[bubble.power] : null;
  const skin = BUBBLE_SKINS[bubble.skin];
  const fill = power ? power.color : skin.fill;
  const ink = power ? power.ink : skin.ink;
  const box = { width: size, height: size };

  if (bubble.dead) {
    return (
      <span
        aria-hidden
        className="rounded-full border-[3px] border-dashed border-hairline opacity-70"
        style={box}
      />
    );
  }

  const rim = Math.max(3, Math.round(size * 0.09));

  return (
    <button
      type="button"
      onClick={(event) => onPop(bubble, event)}
      data-bubble={index}
      tabIndex={tabbable ? 0 : -1}
      aria-label={
        power ? `${power.label} bubble` : `Bubble ${spoken(bubble.label)}`
      }
      className={cn(
        "group relative flex items-center justify-center rounded-full",
        "transition-transform duration-100 ease-out hover:-translate-y-0.5 active:translate-y-1 active:scale-95",
        power && "animate-heartbeat"
      )}
      style={{
        ...box,
        color: ink,
        background: fill,
        boxShadow: [
          `inset 0 -${rim}px 0 0 color-mix(in oklab, ${fill} 76%, #0b2447)`,
          `0 ${Math.round(size * 0.06)}px 0 0 color-mix(in oklab, ${fill} 55%, #0b2447)`,
        ].join(","),
        animation: "var(--animate-pop-in)",
        animationDelay: `${Math.min(index, 26) * 8}ms`,
      }}
    >
      {/* Hard-edged highlight — flat art never blurs. */}
      <span
        className="pointer-events-none absolute rounded-full bg-white/60"
        style={{
          left: "20%",
          top: "13%",
          width: "26%",
          height: "20%",
          transform: "rotate(-20deg)",
        }}
      />

      {power ? (
        <>
          <span
            className="pointer-events-none absolute -inset-[3px] rounded-full border-[3px] border-white/70"
            aria-hidden
          />
          <Icon
            name={power.icon}
            size={Math.round(size * 0.44)}
            strokeWidth={2.8}
            className="relative"
          />
        </>
      ) : (
        <span
          className="relative select-none whitespace-nowrap font-display font-bold leading-none"
          style={{
            // A sum needs more room than a digit, so the type shrinks to fit.
            fontSize: Math.round(size * labelScale(bubble.label.length)),
            marginTop: -rim * 0.4,
          }}
        >
          {bubble.label}
        </span>
      )}
    </button>
  );
};

export default memo(BubbleButton);
