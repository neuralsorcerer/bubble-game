/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useEffect } from "react";

/**
 * Keeps `--vh` in sync with the real viewport so mobile browser chrome can
 * never clip the board the way raw `100vh` does.
 */
export const useViewportHeight = () => {
  useEffect(() => {
    const apply = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty(
        "--vh",
        `${height * 0.01}px`
      );
    };

    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    window.visualViewport?.addEventListener("resize", apply);

    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      window.visualViewport?.removeEventListener("resize", apply);
    };
  }, []);
};
