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
}) => (
  <div className="flex flex-wrap justify-between items-center bg-green-700 text-white px-5 md:px-10 py-4">
    <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
      <h2 className="text-base md:text-xl font-medium">Hit</h2>
      <div className="bg-white text-green-700 font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded">
        {hitNumber}
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
      <h2 className="text-base md:text-xl font-medium">Timer</h2>
      <div className="bg-white text-green-700 font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded">
        {timer}
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
      <h2 className="text-base md:text-xl font-medium">Score</h2>
      <div className="bg-white text-green-700 font-semibold text-base md:text-xl px-3 py-1 md:px-4 md:py-2 rounded">
        {score}
      </div>
    </div>
    <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
      <button
        className="bg-white text-green-700 font-semibold text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded hover:bg-green-100 transition"
        onClick={exitGame}
      >
        Exit Game
      </button>
      <button
        className="bg-white text-green-700 font-semibold text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded hover:bg-green-100 transition"
        onClick={startGame}
      >
        Restart
      </button>
    </div>
  </div>
);

export default Header;
