/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { Crown } from "lucide-react";
import { DIFFICULTIES, MODES } from "@/game/config";
import type { ScoreEntry } from "@/game/types";
import { cn } from "@/lib/utils";

const MEDAL = ["#facc15", "#94a3b8", "#fb923c"];

const describe = (entry: ScoreEntry) => {
  const parts = [
    entry.mode ? MODES[entry.mode].label : null,
    entry.difficulty ? DIFFICULTIES[entry.difficulty].label : null,
    entry.math ? "Math" : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Earlier run";
};

interface LeaderboardProps {
  entries: ScoreEntry[];
  /** Timestamp of the run that just ended, so it can be picked out. */
  highlight?: number;
}

const Leaderboard = ({ entries, highlight }: LeaderboardProps) => (
  <div className="mt-6 text-left">
    <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-ink">
      <Crown size={17} className="text-sun-deep" strokeWidth={2.8} />
      Your top 5
    </h3>

    {entries.length === 0 ? (
      <p className="rounded-2xl border-2 border-hairline bg-panel-sunk px-4 py-3 text-sm text-ink-faint">
        No scores yet — this run will start the board.
      </p>
    ) : (
      <ol className="space-y-1.5">
        {entries.slice(0, 5).map((entry, index) => {
          const isCurrent = highlight !== undefined && entry.at === highlight;
          return (
            <li
              key={`${entry.at}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-2 transition-colors",
                isCurrent
                  ? "border-2 border-sky bg-sky/20"
                  : "border-2 border-hairline bg-panel-sunk"
              )}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold text-navy"
                style={{ background: MEDAL[index] ?? "var(--hairline)" }}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink-faint">
                {describe(entry)}
                {entry.streak > 0 && ` · ×${entry.streak} streak`}
              </span>
              <span className="font-display text-base font-bold tabular-nums text-ink">
                {entry.score.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ol>
    )}
  </div>
);

export default Leaderboard;
