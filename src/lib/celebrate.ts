/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

// canvas-confetti's types are a CommonJS `export =`, but Vite resolves the
// package's ESM build, whose default export is the function itself.
type Confetti = typeof import("canvas-confetti");

/**
 * Confetti is only ever needed once a run is under way, so it is fetched on
 * demand rather than shipped in the first paint. `warmConfetti` pulls it in as
 * a game starts, which keeps the very first burst instant.
 */
let pending: Promise<Confetti> | null = null;

const load = () => {
  pending ??= import("canvas-confetti").then(
    (module) => (module as unknown as { default: Confetti }).default
  );
  return pending;
};

export const warmConfetti = () => {
  void load().catch(() => {
    // Celebrations are decoration; failing to load one is not worth surfacing.
  });
};

/** Particles stay inside the four play colours, plus white sparks. */
const CANDY = ["#38bdf8", "#facc15", "#ff6b81", "#4ade80", "#ffffff"];

const calm = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const fire = (run: (confetti: Confetti) => void) => {
  if (calm()) return;
  void load().then(run).catch(() => {});
};

/** A small pop of colour at a point on screen (values are 0–1 of viewport). */
export const sparkleAt = (x: number, y: number, colors: string[] = CANDY) =>
  fire((confetti) => {
    void confetti({
      particleCount: 26,
      spread: 62,
      startVelocity: 26,
      scalar: 0.75,
      ticks: 90,
      gravity: 0.9,
      origin: { x, y },
      colors,
      disableForReducedMotion: true,
    });
  });

/** Level-up: two quick side cannons. */
export const cheer = () =>
  fire((confetti) => {
    [0.15, 0.85].forEach((x, i) =>
      void confetti({
        particleCount: 48,
        angle: i === 0 ? 60 : 120,
        spread: 66,
        startVelocity: 42,
        origin: { x, y: 0.72 },
        colors: CANDY,
        disableForReducedMotion: true,
      })
    );
  });

/** End of run: a warm, unhurried shower rather than a firehose. */
export const finale = (intense = false) =>
  fire((confetti) => {
    const end = Date.now() + (intense ? 1600 : 900);

    const frame = () => {
      void confetti({
        particleCount: intense ? 5 : 3,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: CANDY,
        disableForReducedMotion: true,
      });
      void confetti({
        particleCount: intense ? 5 : 3,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: CANDY,
        disableForReducedMotion: true,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  });
