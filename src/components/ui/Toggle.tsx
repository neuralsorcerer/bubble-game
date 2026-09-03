/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { cn } from "@/lib/utils";

interface ToggleProps {
  on: boolean;
  onChange: () => void;
  label: string;
}

/** A chunky on/off switch that reads as a physical thing you flip. */
export const Toggle = ({ on, onChange, label }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onChange}
    className={cn(
      "relative h-8 w-14 shrink-0 rounded-full border-2 transition-colors duration-150",
      on ? "border-[#15803d] bg-grass-deep" : "border-hairline bg-panel"
    )}
  >
    <span
      className={cn(
        "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-[left] duration-150",
        on ? "left-[26px]" : "left-[3px]"
      )}
    />
  </button>
);
