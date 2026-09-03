/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CLOCK_BONUS,
  DIFFICULTIES,
  FREEZE_SECONDS,
  LEVEL_TIME_BONUS,
  MODES,
  POWERS,
  STAR_MULTIPLE,
} from "./config";
import {
  basePointsFor,
  buildField,
  capTimeFor,
  clamp,
  heatFor,
  heatProgress,
  levelForPops,
  multiplierFor,
  pickTarget,
  praiseFor,
  startTimeFor,
  timeBonusFor,
} from "./engine";
import {
  ghostScoreAt,
  recordSample,
  type Ghost,
  type GhostTrace,
} from "./ghost";
import { seededRng, type Rng } from "./rng";
import type {
  Bubble,
  Difficulty,
  Mode,
  PopResult,
  PowerKind,
  RunStats,
} from "./types";

export type Phase = "idle" | "playing" | "paused" | "over";

export interface Banner {
  kind: PowerKind | "level";
  id: number;
}

interface CoreState {
  phase: Phase;
  difficulty: Difficulty;
  mode: Mode;
  /** Boards come from here, so a seeded run replays exactly. */
  rng: Rng;
  /** The daily challenge's date, when this run is one. */
  day: string | null;
  /** Bubbles wear sums instead of numbers. */
  math: boolean;
  target: number;
  bubbles: Bubble[];
  score: number;
  streak: number;
  bestStreak: number;
  pops: number;
  misses: number;
  powers: number;
  level: number;
  timeMs: number;
  capMs: number;
  freezeMs: number;
  /** Milliseconds actually played: paused and frozen time do not count. */
  playedMs: number;
  maxHeat: number;
  /** This run's score once per second, kept as the next ghost. */
  trace: GhostTrace;
  /** The best previous run for this mode and difficulty, if there is one. */
  ghost: Ghost | null;
  banner: Banner | null;
  bannerSeq: number;
}

export interface GameSnapshot extends Omit<CoreState, "rng"> {
  secondsLeft: number;
  multiplier: number;
  heat: number;
  heatProgress: number;
  /** Score minus the ghost's at this point, or null when there is no ghost. */
  ghostDelta: number | null;
}

export interface RunSummary extends RunStats {
  score: number;
  difficulty: Difficulty;
  mode: Mode;
  /** Set only for a daily challenge, so the caller can record the streak. */
  day: string | null;
  math: boolean;
  /** This run's per-second scores, offered up as the next ghost. */
  trace: GhostTrace;
  /** The ghost's final score, when one was being raced. */
  ghostScore: number | null;
}

/** Everything a run needs to begin; omit `seed` for ordinary random play. */
export interface StartOptions {
  difficulty: Difficulty;
  mode: Mode;
  seed?: number;
  day?: string;
  math?: boolean;
  ghost?: Ghost | null;
}

/** How long a level-up or power-up call-out stays on screen. */
const BANNER_MS = 1500;

const makeCore = (
  difficulty: Difficulty,
  mode: Mode,
  rng: Rng = Math.random,
  day: string | null = null,
  ghost: Ghost | null = null,
  math = false
): CoreState => ({
  phase: "idle",
  difficulty,
  mode,
  rng,
  day,
  math,
  target: 0,
  bubbles: [],
  score: 0,
  streak: 0,
  bestStreak: 0,
  pops: 0,
  misses: 0,
  powers: 0,
  level: 1,
  timeMs: startTimeFor(difficulty, mode, math) * 1000,
  capMs: capTimeFor(difficulty, mode, math) * 1000,
  freezeMs: 0,
  playedMs: 0,
  maxHeat: 0,
  trace: [],
  ghost,
  banner: null,
  bannerSeq: 0,
});

/** The run's current heat tier, derived from seconds actually played. */
const heatOf = (core: CoreState) =>
  heatFor(core.playedMs / 1000, core.mode);

const toSnapshot = (core: CoreState): GameSnapshot => {
  const { rng, ...rest } = core;
  void rng;
  return {
    ...rest,
    secondsLeft: core.timeMs / 1000,
    multiplier: multiplierFor(core.streak),
    heat: heatOf(core),
    heatProgress: heatProgress(core.playedMs / 1000, core.mode),
    ghostDelta: core.ghost
      ? core.score - ghostScoreAt(core.ghost, core.playedMs / 1000)
      : null,
  };
};

const IDLE_RESULT: PopResult = {
  tone: "miss",
  label: "",
  points: 0,
  multiplier: 1,
};

/** Marks one bubble spent, leaving every other object identity untouched. */
const kill = (bubbles: Bubble[], id: number) =>
  bubbles.map((bubble) =>
    bubble.id === id ? { ...bubble, dead: true } : bubble
  );

const raiseBanner = (core: CoreState, kind: Banner["kind"]) => {
  core.bannerSeq += 1;
  core.banner = { kind, id: core.bannerSeq };
};

/** Rebuilds the board around a brand new target. */
const refresh = (core: CoreState) => {
  core.target = pickTarget(core.rng, core.difficulty, core.target);
  core.bubbles = buildField({
    rng: core.rng,
    target: core.target,
    difficulty: core.difficulty,
    mode: core.mode,
    level: core.level,
    heat: heatOf(core),
    math: core.math,
  });
};

/** Shared scoring path for a real hit and for the rainbow / nova power-ups. */
const scoreHit = (core: CoreState, hits: number): PopResult => {
  core.streak += hits;
  core.bestStreak = Math.max(core.bestStreak, core.streak);

  const multiplier = multiplierFor(core.streak);
  const points = basePointsFor(core.difficulty, core.math) * multiplier * hits;
  core.score += points;
  core.pops += hits;

  // Each heat tier buys fewer seconds per hit than the last.
  core.timeMs = clamp(
    core.timeMs +
      timeBonusFor(core.difficulty, heatOf(core), core.math) *
        Math.min(hits, 3) *
        1000,
    0,
    core.capMs
  );

  const level = levelForPops(core.pops);
  const leveledUp = level > core.level;
  if (leveledUp) {
    core.level = level;
    core.timeMs = clamp(core.timeMs + LEVEL_TIME_BONUS * 1000, 0, core.capMs);
    raiseBanner(core, "level");
  }

  refresh(core);

  return {
    tone: "hit",
    label: praiseFor(multiplier),
    points,
    multiplier,
    leveledUp,
  };
};

const applyPower = (core: CoreState, kind: PowerKind): PopResult => {
  const multiplier = multiplierFor(core.streak);
  core.powers += 1;
  raiseBanner(core, kind);

  switch (kind) {
    case "star": {
      const points =
        basePointsFor(core.difficulty, core.math) * STAR_MULTIPLE * multiplier;
      core.score += points;
      return {
        tone: "power",
        label: POWERS.star.label,
        points,
        multiplier,
        power: kind,
      };
    }
    case "clock": {
      core.timeMs = clamp(core.timeMs + CLOCK_BONUS * 1000, 0, core.capMs);
      return {
        tone: "power",
        label: `+${CLOCK_BONUS}s`,
        points: 0,
        multiplier,
        power: kind,
      };
    }
    case "freeze": {
      core.freezeMs = FREEZE_SECONDS * 1000;
      return {
        tone: "power",
        label: "Frozen!",
        points: 0,
        multiplier,
        power: kind,
      };
    }
    case "rainbow": {
      const result = scoreHit(core, 1);
      return { ...result, tone: "power", label: "Rainbow!", power: kind };
    }
    case "nova": {
      const matches = core.bubbles.filter(
        (bubble) =>
          !bubble.dead && bubble.power === null && bubble.value === core.target
      ).length;
      const hits = Math.max(1, matches);
      const result = scoreHit(core, hits);
      return {
        ...result,
        tone: "power",
        label: `Nova ×${hits}`,
        power: kind,
      };
    }
  }
};

interface Options {
  difficulty: Difficulty;
  mode: Mode;
  onFinish: (summary: RunSummary) => void;
}

/**
 * Owns a single run. State lives in a ref so a burst of taps inside one frame
 * is always scored against the true board, and a snapshot is published for
 * rendering after every change.
 */
export const useBubbleGame = ({ difficulty, mode, onFinish }: Options) => {
  const [initialCore] = useState(() => makeCore(difficulty, mode));
  const coreRef = useRef<CoreState>(initialCore);
  const lastStartRef = useRef<StartOptions>({ difficulty, mode });
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() =>
    toSnapshot(initialCore)
  );
  const bannerTimer = useRef<number | null>(null);

  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);

  const publish = useCallback(() => {
    setSnapshot(toSnapshot(coreRef.current));
  }, []);

  const clearBannerLater = useCallback(() => {
    if (bannerTimer.current !== null) window.clearTimeout(bannerTimer.current);
    bannerTimer.current = window.setTimeout(() => {
      bannerTimer.current = null;
      coreRef.current.banner = null;
      publish();
    }, BANNER_MS);
  }, [publish]);

  useEffect(
    () => () => {
      if (bannerTimer.current !== null) window.clearTimeout(bannerTimer.current);
    },
    []
  );

  const finish = useCallback(() => {
    const core = coreRef.current;
    if (core.phase === "over") return;
    core.phase = "over";
    core.timeMs = 0;
    core.banner = null;
    publish();
    finishRef.current({
      score: core.score,
      difficulty: core.difficulty,
      mode: core.mode,
      day: core.day,
      pops: core.pops,
      misses: core.misses,
      bestStreak: core.bestStreak,
      powers: core.powers,
      level: core.level,
      maxHeat: core.maxHeat,
      math: core.math,
      trace: core.trace,
      ghostScore: core.ghost?.score ?? null,
    });
  }, [publish]);

  const start = useCallback(
    (options: StartOptions) => {
      const {
        difficulty: next,
        mode: nextMode,
        seed,
        day,
        math,
        ghost,
      } = options;
      lastStartRef.current = options;
      const rng = seed === undefined ? Math.random : seededRng(seed);
      const core = makeCore(
        next,
        nextMode,
        rng,
        day ?? null,
        ghost ?? null,
        math ?? false
      );
      core.phase = "playing";
      core.target = pickTarget(rng, next, 0);
      core.bubbles = buildField({
        rng,
        target: core.target,
        difficulty: next,
        mode: nextMode,
        level: 1,
        math: core.math,
        // The opening board stays clean so the first tap is never wasted.
        allowPowers: false,
      });
      coreRef.current = core;
      publish();
    },
    [publish]
  );

  /** Rebuilds the current run from its original options, including daily seeds. */
  const restart = useCallback(() => start(lastStartRef.current), [start]);

  const reset = useCallback(
    (nextDifficulty: Difficulty, nextMode: Mode) => {
      coreRef.current = makeCore(nextDifficulty, nextMode);
      publish();
    },
    [publish]
  );

  const setPaused = useCallback(
    (paused: boolean) => {
      const core = coreRef.current;
      if (paused && core.phase === "playing") core.phase = "paused";
      else if (!paused && core.phase === "paused") core.phase = "playing";
      else return;
      publish();
    },
    [publish]
  );

  const togglePause = useCallback(() => {
    const { phase } = coreRef.current;
    if (phase === "playing") setPaused(true);
    else if (phase === "paused") setPaused(false);
  }, [setPaused]);

  const pop = useCallback(
    (bubble: Bubble): PopResult => {
      const core = coreRef.current;
      if (core.phase !== "playing") return IDLE_RESULT;

      const live = core.bubbles.find(
        (candidate) => candidate.id === bubble.id && !candidate.dead
      );
      if (!live) return IDLE_RESULT;

      const bannerBefore = core.bannerSeq;
      let result: PopResult;

      if (live.power) {
        const boardBefore = core.bubbles;
        result = applyPower(core, live.power);
        // Powers that rebuilt the board already dropped this bubble.
        if (core.bubbles === boardBefore) {
          core.bubbles = kill(core.bubbles, live.id);
        }
      } else if (live.value === core.target) {
        result = scoreHit(core, 1);
      } else {
        const config = DIFFICULTIES[core.difficulty];
        core.misses += 1;
        if (MODES[core.mode].punishing) {
          core.streak = 0;
          core.timeMs = Math.max(0, core.timeMs - config.missTime * 1000);
        }
        // A wrong tap burns that decoy out instead of scrambling the board:
        // nothing reflows, and the next scan is fractionally easier.
        core.bubbles = kill(core.bubbles, live.id);
        result = { tone: "miss", label: "Oops", points: 0, multiplier: 1 };
      }

      recordSample(core.trace, core.playedMs / 1000, core.score);
      publish();
      if (core.bannerSeq !== bannerBefore) clearBannerLater();
      if (core.timeMs <= 0) finish();
      return result;
    },
    [clearBannerLater, finish, publish]
  );

  // The clock. Driven by wall time so a throttled tab can never hand out free
  // seconds, and paused outright when the player looks away.
  useEffect(() => {
    if (snapshot.phase !== "playing") return;

    let last = performance.now();
    const id = window.setInterval(() => {
      const core = coreRef.current;
      if (core.phase !== "playing") return;

      const now = performance.now();
      const delta = now - last;
      last = now;

      if (core.freezeMs > 0) {
        // A freeze holds the heat too, so it is a real breather.
        core.freezeMs = Math.max(0, core.freezeMs - delta);
      } else {
        core.timeMs = Math.max(0, core.timeMs - delta);
        core.playedMs += delta;
        core.maxHeat = Math.max(core.maxHeat, heatOf(core));
        recordSample(core.trace, core.playedMs / 1000, core.score);
      }

      if (core.timeMs <= 0) finish();
      else publish();
    }, 100);

    return () => window.clearInterval(id);
  }, [snapshot.phase, finish, publish]);

  // Look away and the clock waits for you. `blur` catches switching windows,
  // which `visibilitychange` on its own does not.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setPaused(true);
    };
    const onBlur = () => setPaused(true);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [setPaused]);

  return {
    state: snapshot,
    start,
    restart,
    reset,
    pop,
    setPaused,
    togglePause,
    finish,
  };
};
