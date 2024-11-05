import React from "react";

interface BubbleGridProps {
  bubbles: number[];
  handleBubbleClick: (num: number) => void;
}

const BubbleGrid: React.FC<BubbleGridProps> = ({
  bubbles,
  handleBubbleClick,
}) => (
  <div className="flex-grow flex flex-wrap gap-2 p-3 md:p-5 overflow-auto justify-center">
    {bubbles.map((num, index) => (
      <div
        key={index}
        className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600 transform transition-all duration-200 hover:scale-110"
        onClick={() => handleBubbleClick(num)}
      >
        {num}
      </div>
    ))}
  </div>
);

export default BubbleGrid;
