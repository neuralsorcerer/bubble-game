/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

const Footer = () => (
  <footer className="mt-6 pb-2 text-center">
    <p className="text-xs text-ink-faint md:text-sm">
      Built with 💛 by{" "}
      <a
        href="https://soumyadipsarkar.com"
        // Padded to a comfortable tap target rather than a 14px sliver.
        className="inline-block py-2 font-bold text-sky-deep underline-offset-4 hover:underline"
        rel="noopener noreferrer"
        target="_blank"
      >
        Soumyadip Sarkar
      </a>
    </p>
  </footer>
);

export default Footer;
