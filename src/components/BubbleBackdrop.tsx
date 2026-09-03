/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Motion without noise: a handful of flat bubbles drifting up a quiet
 * gradient. Deliberately low contrast — the board has to win every time.
 */
const PARTICLES = [
  { left: 4, size: 90, delay: 0, duration: 26, color: "#38bdf8" },
  { left: 16, size: 38, delay: 6, duration: 19, color: "#facc15" },
  { left: 27, size: 120, delay: 12, duration: 32, color: "#4ade80" },
  { left: 38, size: 54, delay: 3, duration: 22, color: "#ff6b81" },
  { left: 49, size: 76, delay: 16, duration: 28, color: "#38bdf8" },
  { left: 61, size: 44, delay: 9, duration: 20, color: "#4ade80" },
  { left: 72, size: 104, delay: 20, duration: 34, color: "#ff6b81" },
  { left: 83, size: 34, delay: 2, duration: 18, color: "#facc15" },
  { left: 93, size: 68, delay: 13, duration: 25, color: "#38bdf8" },
];

export const BubbleBackdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
    {PARTICLES.map((particle, index) => (
      <span
        key={index}
        className="absolute bottom-[-20vh] rounded-full opacity-[0.16] dark:opacity-[0.12]"
        style={{
          left: `${particle.left}%`,
          width: particle.size,
          height: particle.size,
          background: particle.color,
          animation: `drift ${particle.duration}s linear ${particle.delay}s infinite`,
        }}
      />
    ))}

    <style>{`
      @keyframes drift {
        0%   { transform: translate3d(0, 0, 0) scale(0.8); }
        50%  { transform: translate3d(18px, -70vh, 0) scale(1); }
        100% { transform: translate3d(-10px, -140vh, 0) scale(0.85); }
      }
      @media (prefers-reduced-motion: reduce) {
        @keyframes drift { from, to { transform: translate3d(0, -60vh, 0); } }
      }
    `}</style>
  </div>
);
