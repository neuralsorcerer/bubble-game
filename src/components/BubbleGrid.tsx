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
  let bgColorClass = "bg-green-500";

  if (score > 1000) {
    bgColorClass = "bg-pink-500";
  } else if (score > 500) {
    bgColorClass = "bg-purple-500";
  } else if (score > 250) {
    bgColorClass = "bg-teal-500";
  }

  return (
    <div className="flex-grow flex flex-wrap gap-2 p-3 md:p-5 overflow-auto justify-center">
      {bubbles.map((num, index) => (
        <div
          key={index}
          className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 ${bgColorClass} text-white rounded-full cursor-pointer hover:brightness-110 transform transition-all duration-200 hover:scale-110`}
          onClick={() => handleBubbleClick(num)}
        >
          {num}
        </div>
      ))}
    </div>
  );
};

export default BubbleGrid;
