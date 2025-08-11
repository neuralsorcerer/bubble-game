/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

const Footer: React.FC = () => (
  <footer className="fixed bottom-[max(theme(spacing.3),env(safe-area-inset-bottom))] left-0 right-0 flex justify-center">
    <p className="text-xs md:text-sm text-gray-600 bg-white/60 backdrop-blur rounded-full px-3 py-1 border border-white/40 shadow-sm">
      Built with ❤️ by{" "}
      <a
        href="https://soumyadipsarkar.com"
        className="text-emerald-700 hover:underline"
        rel="noopener noreferrer"
        target="_blank"
      >
        Soumyadip Sarkar
      </a>
    </p>
  </footer>
);

export default Footer;
