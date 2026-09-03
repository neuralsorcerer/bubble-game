/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";

const MIN_SIZE = 34;
const MAX_SIZE = 132;
/**
 * The pop-in easing overshoots to about 1.07x before settling, so a grid
 * fitted flush to the edges gets the outermost bubbles' bounce clipped.
 * Holding a few pixels back costs almost no size and keeps it whole.
 */
const EDGE_ALLOWANCE = 12;

const gapFor = (size: number) => Math.max(6, size * 0.14);

const columnsFor = (size: number, width: number) =>
  Math.max(1, Math.floor((width + gapFor(size)) / (size + gapFor(size))));

const fits = (size: number, width: number, height: number, count: number) => {
  const gap = gapFor(size);
  const rows = Math.ceil(count / columnsFor(size, width));
  return rows * (size + gap) - gap <= height;
};

/** Largest bubble that still lets the whole board sit on screen at once. */
const bestSize = (width: number, height: number, count: number) => {
  if (count === 0) return MAX_SIZE;
  let low = MIN_SIZE;
  let high = MAX_SIZE;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (fits(mid, width, height, count)) low = mid;
    else high = mid - 1;
  }
  return fits(high, width, height, count) ? high : low;
};

/**
 * Sizes the bubbles to the space available so the field always fills the
 * board — big and chunky on a desktop, still complete on a phone, and never
 * a half-empty screen.
 */
export const useBoardFit = (count: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ size: 52, columns: 6 });

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    const width = box.width - EDGE_ALLOWANCE;
    const height = box.height - EDGE_ALLOWANCE;
    if (width < 20 || height < 20) return;
    const size = bestSize(width, height, count);
    setLayout({ size, columns: columnsFor(size, width) });
  }, [count]);

  useLayoutEffect(() => {
    measure();
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure]);

  return {
    ref,
    size: layout.size,
    // Arrow-key navigation needs to know the shape of the grid it is walking.
    columns: layout.columns,
    gap: gapFor(layout.size),
  };
};
