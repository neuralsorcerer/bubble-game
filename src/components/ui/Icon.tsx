/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  CalendarDays,
  Clock,
  Feather,
  Flame,
  Gauge,
  Leaf,
  Snowflake,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Config files stay plain data by naming their icon; this is where a name
 * becomes a component.
 */
const ICONS = {
  calendar: CalendarDays,
  feather: Feather,
  gauge: Gauge,
  flame: Flame,
  zap: Zap,
  leaf: Leaf,
  star: Star,
  clock: Clock,
  snowflake: Snowflake,
  sparkles: Sparkles,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const Icon = ({
  name,
  className,
  size = 18,
  strokeWidth = 2.4,
}: {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const Glyph = ICONS[name];
  return <Glyph className={className} size={size} strokeWidth={strokeWidth} />;
};
