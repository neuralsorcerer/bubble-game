/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { ACHIEVEMENTS } from "@/game/achievements";
import { DIFFICULTIES, DIFFICULTY_ORDER, MODES } from "@/game/config";
import type { AchievementId, Mode, ScoreEntry } from "@/game/types";
import { Sheet } from "@/components/ui/Sheet";
import { BadgeGrid } from "./BadgeGrid";
import { bestFor, type DailyRecord, type Totals } from "@/lib/storage";

interface StatsSheetProps {
  open: boolean;
  onClose: () => void;
  entries: ScoreEntry[];
  totals: Totals;
  daily: DailyRecord;
  badges: AchievementId[];
}

const Figure = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center rounded-2xl border-2 border-hairline bg-panel-sunk px-2 py-3">
    <span className="font-display text-xl font-bold text-ink">{value}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
      {label}
    </span>
  </div>
);

const SCORE_MODES: Mode[] = ["rush", "chill", "daily"];

interface ScoreRow {
  key: string;
  label: string;
  mode: Mode;
  math: boolean;
}

/**
 * Math runs are scored on their own board, so they get their own rows — but
 * only once the player has actually played one.
 */
const rowsFor = (entries: ScoreEntry[]): ScoreRow[] => {
  const plain = SCORE_MODES.map((mode) => ({
    key: mode,
    label: MODES[mode].label,
    mode,
    math: false,
  }));
  if (!entries.some((entry) => entry.math)) return plain;

  return [
    ...plain,
    ...SCORE_MODES.map((mode) => ({
      key: `${mode}-math`,
      label: `${MODES[mode].label} · Math`,
      mode,
      math: true,
    })),
  ];
};

export const StatsSheet = ({
  open,
  onClose,
  entries,
  totals,
  daily,
  badges,
}: StatsSheetProps) => (
  <Sheet open={open} title="Stats & badges" onClose={onClose}>
    <div className="grid grid-cols-4 gap-2">
      <Figure label="Runs" value={totals.games.toLocaleString()} />
      <Figure label="Pops" value={totals.pops.toLocaleString()} />
      <Figure label="Streak" value={String(totals.bestStreak)} />
      <Figure label="Badges" value={`${badges.length}/${ACHIEVEMENTS.length}`} />
    </div>

    {daily.bestStreak > 0 && (
      <p className="mt-3 rounded-2xl border-2 border-hairline bg-panel-sunk px-4 py-2.5 text-sm font-bold text-ink-soft">
        Daily challenge: {daily.streak}-day streak now, best of{" "}
        {daily.bestStreak}.
      </p>
    )}

    <h3 className="mb-2 mt-5 font-display text-base font-bold text-ink">
      Best score by mode
    </h3>
    {/* Left scrollable as a safety net, but with a visible scrollbar: a
        hidden one on a 320px screen made the last column undiscoverable. */}
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th className="text-left text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              Mode
            </th>
            {DIFFICULTY_ORDER.map((difficulty) => (
              <th
                key={difficulty}
                className="text-[10px] font-bold uppercase tracking-wider text-ink-faint"
              >
                {DIFFICULTIES[difficulty].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsFor(entries).map((row) => (
            <tr key={row.key}>
              <td className="whitespace-nowrap pr-2 font-display text-xs font-bold text-ink sm:text-sm">
                {row.label}
              </td>
              {DIFFICULTY_ORDER.map((difficulty) => {
                const best = bestFor(entries, difficulty, row.mode, row.math);
                return (
                  <td
                    key={difficulty}
                    className="rounded-xl bg-panel-sunk px-1 py-1.5 text-center font-display text-xs font-bold tabular-nums text-ink sm:text-sm"
                  >
                    {best > 0 ? best.toLocaleString() : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h3 className="mb-2 mt-5 font-display text-base font-bold text-ink">
      Badges
    </h3>
    <BadgeGrid earned={badges} />
  </Sheet>
);
