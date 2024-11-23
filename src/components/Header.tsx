import React from "react";

interface HeaderProps {
  hitNumber: number;
  timer: number;
  score: number;
  exitGame: () => void;
  startGame: () => void;
}

const Header: React.FC<HeaderProps> = ({
  hitNumber,
  timer,
  score,
  exitGame,
  startGame,
}) => {
  let bgColor = "#2F855A";
  let textColor = "#2F855A";

  if (score > 1000) {
    bgColor = "#B83280";
    textColor = "#D53F8C";
  } else if (score > 500) {
    bgColor = "#6B46C1";
    textColor = "#9F7AEA";
  } else if (score > 250) {
    bgColor = "#2C7A7B";
    textColor = "#38B2AC";
  }

  return (
    <div
      className="flex flex-wrap justify-between items-center text-white px-5 md:px-10 py-4 transition-colors duration-500 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-base md:text-xl font-medium">Hit</h2>
        <div
          className="bg-white font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded transition-colors duration-500 ease-in-out"
          style={{ color: textColor }}
        >
          {hitNumber}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-base md:text-xl font-medium">Timer</h2>
        <div
          className="bg-white font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded transition-colors duration-500 ease-in-out"
          style={{ color: textColor }}
        >
          {timer}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-base md:text-xl font-medium">Score</h2>
        <div
          className="bg-white font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded transition-colors duration-500 ease-in-out"
          style={{ color: textColor }}
        >
          {score}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <button
          className="bg-white font-semibold text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded hover:bg-gray-100 transition-colors duration-500 ease-in-out"
          style={{ color: textColor }}
          onClick={exitGame}
        >
          Exit Game
        </button>
        <button
          className="bg-white font-semibold text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded hover:bg-gray-100 transition-colors duration-500 ease-in-out"
          style={{ color: textColor }}
          onClick={startGame}
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default Header;
