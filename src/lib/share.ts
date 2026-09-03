/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

export type ShareOutcome = "shared" | "copied" | "failed";

interface ShareInput {
  score: number;
  multiplier: number;
  accuracy: number;
  level: number;
  headline: string;
  /** Daily streak, when the run was a daily challenge. */
  streak?: number;
}

const SITE = "https://bubblegame.in/";

/** Whether the platform offers a native share sheet. */
export const canShare = () =>
  typeof navigator !== "undefined" && "share" in navigator;

export const shareText = ({
  score,
  multiplier,
  accuracy,
  level,
  headline,
  streak,
}: ShareInput) => {
  const lines = [
    `Bubble Game 🫧 ${headline}`,
    `${score.toLocaleString()} pts · ×${multiplier} combo · ${accuracy}% accuracy`,
    streak && streak > 1 ? `Level ${level} · ${streak}-day streak` : `Level ${level}`,
    SITE,
  ];
  return lines.join("\n");
};

/**
 * Hands the result to the system share sheet where there is one, and falls
 * back to the clipboard everywhere else.
 */
export const shareResult = async (input: ShareInput): Promise<ShareOutcome> => {
  const text = shareText(input);

  if (canShare()) {
    try {
      await navigator.share({ title: "Bubble Game", text });
      return "shared";
    } catch (error) {
      // A cancelled share is a normal outcome, not a failure to report.
      if (error instanceof DOMException && error.name === "AbortError") {
        return "failed";
      }
      // Anything else: fall through and try the clipboard instead.
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
};
