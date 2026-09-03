/**
 * Bubble Game
 * Copyright (c) Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  crashed: boolean;
}

/**
 * A friendly landing spot instead of a blank page. Saved scores live in
 * localStorage, so a reload costs the player nothing but the run in progress.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Bubble Game crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.crashed) return this.props.children;

    return (
      <div className="flex min-h-[calc(var(--vh)*100)] items-center justify-center p-6">
        <div className="panel max-w-sm rounded-[32px] p-7 text-center">
          <p className="text-5xl" aria-hidden>
            🫧
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">
            That one popped
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Something went wrong mid-game. Your scores and badges are safe — a
            reload picks things up again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 w-full rounded-full border-2 border-[#15803d] bg-grass-deep px-6 py-3 font-display text-base font-bold text-white shadow-[0_5px_0_0_#15803d] transition-transform duration-100 active:translate-y-[4px] active:shadow-none"
          >
            Reload the game
          </button>
        </div>
      </div>
    );
  }
}
