/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

const COLORS = [
  "#F87171",
  "#FBBF24",
  "#34D399",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
  "#2DD4BF",
  "#F59E0B",
];

interface ConfettiProps {
  show: boolean;
  pieces?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ show, pieces = 120 }) => {
  if (!show) return null;
  const items = Array.from({ length: pieces }, (_, i) => i);
  return (
    <div className="confetti-container">
      {items.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const duration = 2 + Math.random() * 1.2;
        const rotate = Math.random() * 360;
        const color = COLORS[i % COLORS.length];
        const size = 6 + Math.random() * 6;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              width: size,
              height: size * 1.6,
              animationDelay:
                `${delay}s` as React.CSSProperties["animationDelay"],
              animationDuration:
                `${duration}s, ${duration}s` as React.CSSProperties["animationDuration"],
              // pass initial rotation via CSS variable; composed in CSS transform
              // @ts-expect-error CSS custom properties
              "--base-rot": `${rotate}deg`,
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;
