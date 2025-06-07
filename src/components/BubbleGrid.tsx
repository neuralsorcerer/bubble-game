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

  return (
    <div className="flex-grow grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 p-3 md:p-5 overflow-auto justify-center">
      {bubbles.map((num, index) => (
        <div
          key={index}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white rounded-full shadow-md cursor-pointer hover:brightness-110 transform hover:scale-110 transition duration-300 ease-in-out"
          onClick={() => handleBubbleClick(num)}
          style={{ backgroundColor: bubbleColor }}
        >
          {num}
        </div>
      ))}
    </div>
  );
};

export default BubbleGrid;
