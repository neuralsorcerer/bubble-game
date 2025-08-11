/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import useSound from "use-sound";
import StartScreen from "./components/StartScreen";
import GameOverScreen from "./components/GameOverScreen";
import Header from "./components/Header";
import BubbleGrid from "./components/BubbleGrid";
import { Analytics } from "@vercel/analytics/react";
import Confetti from "./components/Confetti";

const App: React.FC = () => {
  useEffect(() => {
    const setVh = () => {
      if (typeof window === "undefined") return;
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  const [gameState, setGameState] = useState<"start" | "playing" | "gameover">(
    "start"
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    () => {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("difficulty")
          : null;
      if (stored === "easy" || stored === "medium" || stored === "hard")
        return stored;
      return "easy";
    }
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
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem("soundEnabled");
    return stored ? JSON.parse(stored) : true;
  });
  const timerRef = useRef<number | null>(null);
  const confettiTimeoutRef = useRef<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState<number>(0);

  const [playCorrect] = useSound("/sounds/correct.mp3", {
    volume: 0.9,
    soundEnabled,
  });
  const [playIncorrect] = useSound("/sounds/incorrect.mp3", {
    volume: 0.9,
    soundEnabled,
  });

  useEffect(() => {
    try {
      localStorage.setItem("difficulty", difficulty);
    } catch {
      // ignore persistence errors
    }
  }, [difficulty]);

  const getTimerCap = useCallback(() => {
    return difficulty === "easy" ? 90 : difficulty === "medium" ? 60 : 30;
  }, [difficulty]);
  const clampTime = useCallback(
    (t: number) => Math.max(0, Math.min(t, getTimerCap())),
    [getTimerCap]
  );
  const getMultiplier = (s: number) => Math.min(1 + Math.floor(s / 5), 5);
  const getBasePoints = useCallback(() => {
    return difficulty === "easy" ? 10 : difficulty === "medium" ? 12 : 15;
  }, [difficulty]);

  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  };

  const generateNewHit = useCallback(() => {
    const maxNumber =
      difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 100;
    let newHitNumber = Math.floor(Math.random() * maxNumber) + 1;
    if (maxNumber > 1) {
      while (newHitNumber === hitNumber) {
        newHitNumber = Math.floor(Math.random() * maxNumber) + 1;
      }
    }
    setHitNumber(newHitNumber);
    return newHitNumber;
  }, [difficulty, hitNumber]);

  const generateBubbles = useCallback(
    (currentHitNumber: number) => {
      const bubbleCount =
        difficulty === "easy" ? 50 : difficulty === "medium" ? 55 : 60;

      const maxNumber =
        difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 100;

      const basePct =
        difficulty === "easy" ? 0.2 : difficulty === "medium" ? 0.1 : 0.05;
      const reduction = Math.min(
        basePct * 0.75,
        Math.floor(score / 100) * 0.02
      );
      const hitNumberPercentage = Math.max(0.04, basePct - reduction);

      const hitNumberCount = Math.max(
        1,
        Math.floor(bubbleCount * hitNumberPercentage)
      );

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
    [difficulty, score]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      if (confettiTimeoutRef.current !== null)
        window.clearTimeout(confettiTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        if (gameState === "playing" && timer > 0 && timerRef.current === null) {
          startTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [gameState, timer]);

  const startTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current !== null) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (confettiTimeoutRef.current !== null) {
      window.clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    setShowConfetti(false);
    setScore(0);
    setStreak(0);
    const initial =
      difficulty === "easy" ? 60 : difficulty === "medium" ? 30 : 10;
    setTimer(initial);
    const newHit = generateNewHit();
    generateBubbles(newHit);
    setGameState("playing");
    startTimer();
    vibrate(20);
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
    setShowConfetti(true);
    vibrate([0, 80, 40, 80, 40, 80]);
    confettiTimeoutRef.current = window.setTimeout(() => {
      setShowConfetti(false);
    }, 2800);
  }, [updateLeaderboard, score]);

  const exitGame = () => {
    updateLeaderboard(score);
    setGameState("start");
    setScore(0);
    setStreak(0);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (confettiTimeoutRef.current !== null) {
      window.clearTimeout(confettiTimeoutRef.current);
      confettiTimeoutRef.current = null;
    }
    setShowConfetti(false);
  };

  useEffect(() => {
    if (timer === 0 && gameState === "playing") {
      endGame();
    }
  }, [timer, endGame, gameState]);

  const handleBubbleClick = (num: number) => {
    if (num === hitNumber) {
      playCorrect();
      vibrate(30);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const multiplier = getMultiplier(newStreak);
      const basePoints = getBasePoints();
      setScore((prevScore) => prevScore + basePoints * multiplier);
      setTimer((prev) => clampTime(prev + 2));
      const newHitNumber = generateNewHit();
      generateBubbles(newHitNumber);
    } else {
      playIncorrect();
      vibrate([0, 60, 40, 60]);
      setStreak(0);
      setScore((prev) => (prev >= 5 ? prev - 5 : 0));
      setTimer((prev) => clampTime(prev - 1));
      generateBubbles(hitNumber);
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center min-h-[calc(var(--vh)*100)] bg-emerald-50`}
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
          className={`w-full sm:w-11/12 md:w-4/5 lg:max-w-5xl h-full sm:h-[calc(var(--vh)*90)] rounded-none sm:rounded-2xl overflow-hidden flex flex-col min-h-0 border bg-white/70 border-white/30 backdrop-blur`}
        >
          <Header
            hitNumber={hitNumber}
            timer={timer}
            score={score}
            exitGame={exitGame}
            startGame={startGame}
            toggleSound={toggleSound}
            soundEnabled={soundEnabled}
            streak={streak}
            multiplier={getMultiplier(streak)}
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
          restartGame={startGame}
          goToStart={() => {
            if (confettiTimeoutRef.current !== null) {
              window.clearTimeout(confettiTimeoutRef.current);
              confettiTimeoutRef.current = null;
            }
            setShowConfetti(false);
            setScore(0);
            setGameState("start");
          }}
        />
      )}

      <Confetti show={showConfetti} />
      <Analytics />
    </div>
  );
};

export default App;
