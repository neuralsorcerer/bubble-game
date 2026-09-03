/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 *
 * The ghost: your best run, replayed as a pace-setter you race in real time.
 * A run records its score once per second played, and a later run compares
 * itself to that trace at the same point on the clock.
 */

import type { Difficulty, Mode } from "./types";

/** Score at each whole second of play. Index 0 is the first second. */
export type GhostTrace = number[];

export interface Ghost {
  score: number;
  samples: GhostTrace;
}

/** Long enough for any realistic run, short enough to keep storage tiny. */
export const MAX_TRACE_SECONDS = 600;

/** Math runs score differently, so they race their own ghost. */
export const ghostKey = (mode: Mode, difficulty: Difficulty, math = false) =>
  `${mode}:${difficulty}${math ? ":math" : ""}`;

/**
 * Writes the score into every second up to `playedSeconds`, so a trace has no
 * gaps even if the run is sampled irregularly.
 */
export const recordSample = (
  trace: GhostTrace,
  playedSeconds: number,
  score: number
) => {
  const second = Math.min(Math.floor(playedSeconds), MAX_TRACE_SECONDS - 1);
  if (second < 0) return;
  for (let i = trace.length; i <= second; i++) trace[i] = score;
  trace[second] = score;
};

/**
 * What the ghost had scored by this point. Past the end of its trace the ghost
 * is finished, so its final score stands — which is exactly the number a new
 * run needs to beat.
 */
export const ghostScoreAt = (ghost: Ghost, playedSeconds: number) => {
  if (ghost.samples.length === 0) return 0;
  const second = Math.floor(playedSeconds);
  return ghost.samples[Math.min(second, ghost.samples.length - 1)] ?? 0;
};

/** Keeps whichever run scored higher. */
export const betterGhost = (
  previous: Ghost | undefined,
  score: number,
  samples: GhostTrace
): Ghost | null => {
  if (previous && previous.score >= score) return null;
  return { score, samples: [...samples] };
};
