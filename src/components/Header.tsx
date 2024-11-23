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
  let bgColorClass = "bg-green-700";
  let textColorClass = "text-green-700";

  if (score > 30) {
    bgColorClass = "bg-pink-700";
    textColorClass = "text-pink-500";
  } else if (score > 20) {
    bgColorClass = "bg-purple-700";
    textColorClass = "text-purple-500";
  } else if (score > 10) {
    bgColorClass = "bg-teal-700";
    textColorClass = "text-teal-500";
  }

  return (
    <div
      className={`flex flex-wrap justify-between items-center ${bgColorClass} text-white px-5 md:px-10 py-4`}
    >
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-base md:text-xl font-medium">Hit</h2>
        <div
          className={`bg-white ${textColorClass} font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded`}
        >
          {hitNumber}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-base md:text-xl font-medium">Timer</h2>
        <div
          className={`bg-white ${textColorClass} font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded`}
        >
          {timer}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <h2 className="text-base md:text-xl font-medium">Score</h2>
        <div
          className={`bg-white ${textColorClass} font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded`}
        >
          {score}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <button
          className={`bg-white ${textColorClass} font-semibold text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded hover:bg-gray-100 transition`}
          onClick={exitGame}
        >
          Exit Game
        </button>
        <button
          className={`bg-white ${textColorClass} font-semibold text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded hover:bg-gray-100 transition`}
          onClick={startGame}
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default Header;
