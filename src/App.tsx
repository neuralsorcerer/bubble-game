import React, { useState, useEffect, useRef, useCallback } from "react";
import useSound from "use-sound";
import StartScreen from "./components/StartScreen";
import GameOverScreen from "./components/GameOverScreen";
import Header from "./components/Header";
import BubbleGrid from "./components/BubbleGrid";
import { Analytics } from "@vercel/analytics/react";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">(
    "start"
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [timer, setTimer] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [hitNumber, setHitNumber] = useState<number>(0);
  const [bubbles, setBubbles] = useState<number[]>([]);
  const [leaderboard, setLeaderboard] = useState<number[]>(() => {
    const stored = localStorage.getItem("leaderboard");
    return stored ? JSON.parse(stored) : [];
  });
  const [highScore, setHighScore] = useState<number>(
    leaderboard.length > 0 ? leaderboard[0] : 0
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem("soundEnabled");
    return stored ? JSON.parse(stored) : true;
  });
  const timerRef = useRef<number | null>(null);

  const [playCorrect] = useSound("/sounds/correct.mp3", {
    volume: 0.9,
    soundEnabled,
  });
  const [playIncorrect] = useSound("/sounds/incorrect.mp3", {
    volume: 0.9,
    soundEnabled,
  });

  const generateNewHit = useCallback(() => {
    const maxNumber =
      difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 100;
    const newHitNumber = Math.floor(Math.random() * maxNumber) + 1;
    setHitNumber(newHitNumber);
    return newHitNumber;
  }, [difficulty]);

  const generateBubbles = useCallback(
    (currentHitNumber: number) => {
      const bubbleCount =
        difficulty === "easy" ? 50 : difficulty === "medium" ? 55 : 60;

      const maxNumber =
        difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 100;

      const hitNumberPercentage =
        difficulty === "easy" ? 0.2 : difficulty === "medium" ? 0.1 : 0.05;

      const hitNumberCount = Math.floor(bubbleCount * hitNumberPercentage);

      const hitNumbersArray = Array(hitNumberCount).fill(currentHitNumber);

      const remainingCount = bubbleCount - hitNumberCount;

      const remainingNumbers = Array.from({ length: remainingCount }, () => {
        let num;
        do {
          num = Math.floor(Math.random() * maxNumber) + 1;
        } while (num === currentHitNumber);
        return num;
      });

      const combinedArray = [...hitNumbersArray, ...remainingNumbers];

      for (let i = combinedArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedArray[i], combinedArray[j]] = [
          combinedArray[j],
          combinedArray[i],
        ];
      }

      setBubbles(combinedArray);
    },
    [difficulty]
  );

  useEffect(() => {
    if (gameState === "playing") {
      const newHitNumber = generateNewHit();
      generateBubbles(newHitNumber);
      startTimer();
    }
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [gameState, generateNewHit, generateBubbles]);

  useEffect(() => {
    if (gameState === "playing" && score >= 2000 && !isDarkMode) {
      setIsDarkMode(true);
    }
  }, [score, isDarkMode, gameState]);

  const startGame = () => {
    setScore(0);
    setIsDarkMode(false);
    setTimer(difficulty === "easy" ? 60 : difficulty === "medium" ? 30 : 10);
    setGameState("playing");
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const updated = !prev;
      localStorage.setItem("soundEnabled", JSON.stringify(updated));
      return updated;
    });
  };

  const updateLeaderboard = useCallback((newScore: number) => {
    setLeaderboard((prev) => {
      const updated = [...prev, newScore].sort((a, b) => b - a).slice(0, 5);
      localStorage.setItem("leaderboard", JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    setHighScore(leaderboard[0] ?? 0);
  }, [leaderboard]);

  const endGame = useCallback(() => {
    updateLeaderboard(score);
    setGameState("gameover");
    if (timerRef.current !== null) clearInterval(timerRef.current);
  }, [updateLeaderboard, score]);

  const exitGame = () => {
    updateLeaderboard(score);
    setGameState("start");
    setScore(0);
    setIsDarkMode(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setTimer((prev) => {
        if (prev === 1 && timerRef.current !== null)
          clearInterval(timerRef.current);
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (timer === 0) {
      endGame();
    }
  }, [timer, endGame]);

  const handleBubbleClick = (num: number) => {
    if (num === hitNumber) {
      playCorrect();
      setScore((prevScore) => prevScore + 10);
      setTimer((prev) => prev + 2);
      const newHitNumber = generateNewHit();
      generateBubbles(newHitNumber);
    } else {
      playIncorrect();
      setScore((prev) => (prev >= 5 ? prev - 5 : 0));
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-green-200 to-blue-300"
      }`}
    >
      {gameState === "start" && (
        <StartScreen
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          startGame={startGame}
          highScore={highScore}
        />
      )}

      {gameState === "playing" && (
        <div
          className={`w-11/12 md:w-4/5 h-full md:h-4/5 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg overflow-hidden shadow-lg flex flex-col`}
        >
          <Header
            hitNumber={hitNumber}
            timer={timer}
            score={score}
            exitGame={exitGame}
            startGame={startGame}
            toggleSound={toggleSound}
            soundEnabled={soundEnabled}
          />
          <BubbleGrid
            bubbles={bubbles}
            handleBubbleClick={handleBubbleClick}
            score={score}
          />
        </div>
      )}

      {gameState === "gameover" && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          leaderboard={leaderboard}
          restartGame={() => setGameState("start")}
        />
      )}
      <Analytics />
    </div>
  );
};

export default App;
