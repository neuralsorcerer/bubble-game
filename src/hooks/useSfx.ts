/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useEffect, useMemo, useRef } from "react";
import useSound from "use-sound";
import { sfx, unlockAudio } from "@/lib/sfx";

const vibrate = (enabled: boolean, pattern: number | number[]) => {
  if (!enabled) return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw when vibration is disallowed; feedback is optional.
  }
};

/**
 * One place for every bit of feedback the game gives back: the recorded
 * samples for hit/miss, synthesised tones for combos and power-ups, and
 * haptics where the device offers them.
 */
export const useSfx = (enabled: boolean, haptics = true) => {
  const [playCorrect] = useSound("/sounds/correct.mp3", {
    volume: 0.7,
    soundEnabled: enabled,
    interrupt: true,
  });
  const [playIncorrect] = useSound("/sounds/incorrect.mp3", {
    volume: 0.45,
    soundEnabled: enabled,
    interrupt: true,
  });

  const correctRef = useRef(playCorrect);
  const incorrectRef = useRef(playIncorrect);
  const enabledRef = useRef(enabled);
  const hapticsRef = useRef(haptics);

  useEffect(() => {
    correctRef.current = playCorrect;
    incorrectRef.current = playIncorrect;
    enabledRef.current = enabled;
    hapticsRef.current = haptics;
  }, [playCorrect, playIncorrect, enabled, haptics]);

  return useMemo(
    () => ({
      unlock: unlockAudio,

      hit(multiplier: number) {
        vibrate(hapticsRef.current, 18);
        if (!enabledRef.current) return;
        // Samples get a touch brighter as the combo climbs.
        correctRef.current({
          playbackRate: Math.min(1 + (multiplier - 1) * 0.06, 1.5),
        });
        if (multiplier > 1) sfx.combo(multiplier - 1);
      },

      miss() {
        vibrate(hapticsRef.current, [0, 40, 30, 40]);
        if (!enabledRef.current) return;
        incorrectRef.current();
      },

      power() {
        vibrate(hapticsRef.current, [0, 25, 25, 45]);
        if (enabledRef.current) sfx.power();
      },

      freeze() {
        vibrate(hapticsRef.current, [0, 25, 25, 45]);
        if (enabledRef.current) sfx.freeze();
      },

      levelUp() {
        vibrate(hapticsRef.current, [0, 30, 40, 30, 40, 60]);
        if (enabledRef.current) sfx.levelUp();
      },

      start() {
        vibrate(hapticsRef.current, 20);
        unlockAudio();
        if (enabledRef.current) sfx.start();
      },

      gameOver() {
        vibrate(hapticsRef.current, [0, 70, 50, 70, 50, 110]);
        if (enabledRef.current) sfx.gameOver();
      },

      tick() {
        if (enabledRef.current) sfx.tick();
      },
    }),
    []
  );
};

export type Sfx = ReturnType<typeof useSfx>;
