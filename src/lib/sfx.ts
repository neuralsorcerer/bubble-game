/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 *
 * A tiny Web Audio voice for the cues that have no sample: combo tones,
 * power-up chimes, level fanfares and the last-seconds tick. Everything is
 * synthesised, so it costs no download and stays perfectly in tune with the
 * combo counter.
 */

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

const context = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
};

/** Browsers hold audio hostage until a gesture; call this from the first tap. */
export const unlockAudio = () => {
  const audio = context();
  if (audio && audio.state === "suspended") void audio.resume();
};

interface ToneOptions {
  freq: number;
  duration?: number;
  type?: Wave;
  gain?: number;
  delay?: number;
  glideTo?: number;
}

const tone = ({
  freq,
  duration = 0.18,
  type = "sine",
  gain = 0.22,
  delay = 0,
  glideTo,
}: ToneOptions) => {
  const audio = context();
  if (!audio || !master) return;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const env = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, glideTo),
      start + duration
    );
  }

  // Quick attack, smooth tail — reads as "bouncy" rather than "beepy".
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env);
  env.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.03);
};

/** A pentatonic ladder keeps every combo tone consonant with the last. */
const PENTATONIC = [523.25, 587.33, 698.46, 783.99, 880, 1046.5, 1174.66, 1396.91];

export const sfx = {
  /** Rising note per combo step — the higher your streak, the brighter it sings. */
  combo(step: number) {
    const note = PENTATONIC[Math.min(step, PENTATONIC.length - 1)];
    tone({ freq: note, duration: 0.16, type: "triangle", gain: 0.16 });
    tone({
      freq: note * 2,
      duration: 0.1,
      type: "sine",
      gain: 0.06,
      delay: 0.01,
    });
  },

  power() {
    [0, 0.07, 0.14].forEach((delay, i) =>
      tone({
        freq: 659.25 * Math.pow(1.26, i),
        duration: 0.22,
        type: "triangle",
        gain: 0.16,
        delay,
      })
    );
  },

  levelUp() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      tone({
        freq,
        duration: 0.3,
        type: "triangle",
        gain: 0.17,
        delay: i * 0.08,
      })
    );
  },

  start() {
    tone({
      freq: 320,
      glideTo: 780,
      duration: 0.3,
      type: "sine",
      gain: 0.14,
    });
  },

  gameOver() {
    [660, 550, 440].forEach((freq, i) =>
      tone({
        freq,
        duration: 0.42,
        type: "sine",
        gain: 0.16,
        delay: i * 0.13,
      })
    );
  },

  tick() {
    tone({ freq: 1180, duration: 0.05, type: "square", gain: 0.05 });
  },

  freeze() {
    tone({
      freq: 1200,
      glideTo: 620,
      duration: 0.5,
      type: "sine",
      gain: 0.13,
    });
  },
};
