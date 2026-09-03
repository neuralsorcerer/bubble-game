/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Chunky arcade buttons: a solid slab sitting on a hard shadow that it
 * presses down into. No gradients, no glass — just weight you can feel.
 */
const button = cva(
  "relative inline-flex items-center justify-center gap-2 rounded-full font-display font-bold select-none " +
    "border-2 transition-[transform,box-shadow,background-color] duration-100 ease-out " +
    "active:translate-y-[4px] active:shadow-none disabled:opacity-45 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        /** The one big "go" button — green, because green means go. */
        play: "bg-grass-deep border-[#15803d] text-white shadow-[0_5px_0_0_#15803d] hover:bg-grass",
        sky: "bg-sky-deep border-[#0369a1] text-white shadow-[0_5px_0_0_#0369a1] hover:bg-sky",
        sun: "bg-sun border-[#a16207] text-navy shadow-[0_5px_0_0_#a16207] hover:bg-sun-deep",
        danger:
          "bg-bad border-[#b91c1c] text-white shadow-[0_5px_0_0_#b91c1c] hover:brightness-110",
        soft: "bg-panel-sunk border-hairline text-ink shadow-[0_4px_0_0_var(--hairline)] hover:brightness-[0.98] dark:hover:brightness-110",
        panel:
          "bg-panel border-hairline text-ink shadow-[var(--drop-sm)] hover:brightness-[0.98] dark:hover:brightness-110",
        ghost:
          "border-transparent text-ink-soft shadow-none active:translate-y-0 hover:bg-panel-sunk hover:text-ink",
      },
      size: {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2.5",
        lg: "text-base md:text-lg px-6 py-3.5",
        icon: "h-11 w-11 p-0",
        chip: "h-9 w-9 p-0",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "soft", size: "md", block: false },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { children?: ReactNode };

export const Button = ({
  className,
  variant,
  size,
  block,
  type = "button",
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(button({ variant, size, block }), className)}
    {...props}
  />
);
