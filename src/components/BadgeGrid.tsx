/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { ACHIEVEMENTS } from "@/game/achievements";
import type { AchievementId } from "@/game/types";
import { cn } from "@/lib/utils";

interface BadgeGridProps {
  earned: AchievementId[];
  /** Badges to call out as just-unlocked. */
  highlight?: AchievementId[];
}

export const BadgeGrid = ({ earned, highlight = [] }: BadgeGridProps) => (
  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {ACHIEVEMENTS.map((badge) => {
      const has = earned.includes(badge.id);
      const isNew = highlight.includes(badge.id);
      return (
        <li
          key={badge.id}
          className={cn(
            "flex items-start gap-2.5 rounded-2xl border-2 px-3 py-2.5",
            has
              ? "border-hairline bg-panel-sunk"
              : "border-dashed border-hairline bg-transparent opacity-55",
            isNew && "border-sun bg-sun/20 opacity-100"
          )}
        >
          <span
            className={cn("text-xl leading-none", !has && "grayscale")}
            aria-hidden
          >
            {badge.emoji}
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xs font-bold leading-tight text-ink">
              {badge.label}
            </span>
            {/* Locked badges still show the goal — that is the point of them. */}
            <span className="block text-[11px] leading-tight text-ink-faint">
              {badge.blurb}
            </span>
          </span>
        </li>
      );
    })}
  </ul>
);
