import React, { useState, useEffect, useRef } from "react";
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
  const [highScore, setHighScore] = useState<number>(
    parseInt(localStorage.getItem("highScore") || "0")
  );
  const timerRef = useRef<number | null>(null);

  const [playCorrect] = useSound("/sounds/correct.mp3", { volume: 0.5 });
  const [playIncorrect] = useSound("/sounds/incorrect.mp3", { volume: 0.5 });

  useEffect(() => {
    if (gameState === "playing") {
      generateNewHit();
      generateBubbles();
      startTimer();
    }
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (timer === 0) {
      endGame();
    }
  }, [timer]);

  const startGame = () => {
    setScore(0);
    setTimer(difficulty === "easy" ? 60 : difficulty === "medium" ? 45 : 30);
    setGameState("playing");
  };

  const endGame = () => {
    setGameState("gameover");
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score.toString());
    }
    if (timerRef.current !== null) clearInterval(timerRef.current);
  };

  const exitGame = () => {
    setGameState("start");
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const generateNewHit = () => {
    setHitNumber(Math.floor(Math.random() * 10));
  };

  const generateBubbles = () => {
    const bubbleCount =
      difficulty === "easy" ? 100 : difficulty === "medium" ? 168 : 200;
    const nums = Array.from({ length: bubbleCount }, () =>
      Math.floor(Math.random() * 10)
    );
    setBubbles(nums);
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

  const handleBubbleClick = (num: number) => {
    if (num === hitNumber) {
      playCorrect();
      setScore(score + 10);
      setTimer((prev) => prev + 2);
      generateNewHit();
      generateBubbles();
    } else {
      playIncorrect();
      setScore((prev) => (prev >= 5 ? prev - 5 : 0));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-blue-300">
      {gameState === "start" && (
        <StartScreen
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          startGame={startGame}
          highScore={highScore}
        />
      )}

      {gameState === "playing" && (
        <div className="w-11/12 md:w-4/5 h-full md:h-4/5 bg-white rounded-lg overflow-hidden shadow-lg flex flex-col">
          <Header
            hitNumber={hitNumber}
            timer={timer}
            score={score}
            exitGame={exitGame}
            startGame={startGame}
          />
          <BubbleGrid bubbles={bubbles} handleBubbleClick={handleBubbleClick} />
        </div>
      )}

      {gameState === "gameover" && (
        <GameOverScreen
          score={score}
          highScore={highScore}
          restartGame={() => setGameState("start")}
        />
      )}
      <Analytics />
    </div>
  );
};

export default App;
