/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useCallback, useEffect, useState } from "react";
import { readRaw, THEME_KEY, writeRaw } from "@/lib/storage";

export type Theme = "light" | "dark";

const systemTheme = (): Theme =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const initialTheme = (): Theme => {
  const stored = readRaw(THEME_KEY);
  return stored === "light" || stored === "dark" ? stored : systemTheme();
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0a1a38" : "#eaf6ff");
    writeRaw(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    []
  );

  return { theme, toggleTheme };
};
