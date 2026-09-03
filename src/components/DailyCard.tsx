/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { CalendarDays, Check, Flame, Play } from "lucide-react";
import { DIFFICULTIES } from "@/game/config";
import type { DailyChallenge } from "@/game/daily";
import { Button } from "@/components/ui/Button";
import type { DailyRecord } from "@/lib/storage";

interface DailyCardProps {
  challenge: DailyChallenge;
  record: DailyRecord;
  onPlay: () => void;
}

/**
 * The same board for everyone, every day. Replays are allowed — only your best
 * score for the day is kept, and the streak counts days played, not perfection.
 */
export const DailyCard = ({ challenge, record, onPlay }: DailyCardProps) => {
  const playedToday = record.day === challenge.day;
  const difficulty = DIFFICULTIES[challenge.difficulty];

  return (
    <div className="rounded-2xl border-2 border-[#a16207] bg-sun/95 p-3.5 text-navy shadow-[0_5px_0_0_#a16207]">
      <div className="flex items-center gap-2.5">
        <CalendarDays size={19} strokeWidth={2.8} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight">
            Daily Challenge
          </p>
          <p className="text-[11px] font-bold opacity-70">
            {challenge.label} · {difficulty.label}
            {challenge.math && " · Math day"} · same board for everyone
          </p>
        </div>
        {record.streak > 0 && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-navy/15 px-2.5 py-1 text-xs font-bold">
            <Flame size={13} strokeWidth={3} />
            {record.streak}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="sun"
          size="sm"
          className="flex-1 border-navy/70 bg-navy text-white shadow-[0_4px_0_0_rgba(11,36,71,0.55)] hover:brightness-125"
          onClick={onPlay}
        >
          {playedToday ? (
            <>
              <Play size={15} strokeWidth={3} fill="currentColor" />
              Play again
            </>
          ) : (
            <>
              <Play size={15} strokeWidth={3} fill="currentColor" />
              Play today's board
            </>
          )}
        </Button>
        {playedToday && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy/15 px-3 py-1.5 text-sm font-bold">
            <Check size={14} strokeWidth={3.2} />
            {record.score.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};
