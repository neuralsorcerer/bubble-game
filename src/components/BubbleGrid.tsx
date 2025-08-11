/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

interface BubbleGridProps {
  bubbles: number[];
  handleBubbleClick: (num: number) => void;
  score: number;
}

const BubbleGrid: React.FC<BubbleGridProps> = ({
  bubbles,
  handleBubbleClick,
  score,
}) => {
  let bubbleColor = "#38A169";

  if (score > 1000) {
    bubbleColor = "#D53F8C";
  } else if (score > 500) {
    bubbleColor = "#9F7AEA";
  } else if (score > 250) {
    bubbleColor = "#38B2AC";
  }

  const [clicked, setClicked] = React.useState<Set<number>>(new Set());
  React.useEffect(() => {
    setClicked(new Set());
  }, [bubbles]);

  const onPop = (
    e: React.MouseEvent<HTMLButtonElement>,
    num: number,
    index: number
  ) => {
    if (clicked.has(index)) return;
    setClicked((prev) => new Set(prev).add(index));

    const el = e.currentTarget;
    el.classList.remove("bubble-pop");
    void el.offsetWidth;
    el.classList.add("bubble-pop");
    handleBubbleClick(num);
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto p-3 md:p-5">
      <div className="auto-grid justify-items-center content-start">
        {bubbles.map((num, index) => {
          const isDisabled = clicked.has(index);
          return (
            <button
              key={`${num}-${index}`}
              type="button"
              className={`relative flex items-center justify-center aspect-square w-12 sm:w-14 md:w-16 lg:w-16 text-white rounded-full shadow-md transition duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 group active:scale-95 ${
                isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={(e) => onPop(e, num, index)}
              style={{ backgroundColor: bubbleColor }}
              aria-label={`Bubble ${num}`}
              aria-disabled={isDisabled}
              disabled={isDisabled}
            >
              <span className="pointer-events-none absolute -top-1 left-1 w-3 h-3 rounded-full bg-white/60 blur-[1px]" />
              <span
                className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `0 0 20px 4px ${bubbleColor}55`,
                }}
              />
              <span className="text-sm sm:text-base md:text-lg font-semibold select-none">
                {num}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BubbleGrid;
