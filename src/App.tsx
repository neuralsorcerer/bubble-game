/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { newlyEarned } from "@/game/achievements";
import { URGENT_SECONDS } from "@/game/config";
import { challengeFor } from "@/game/daily";
import { betterGhost, ghostKey } from "@/game/ghost";
import { dayKey } from "@/game/rng";
import type {
  AchievementId,
  Bubble,
  Difficulty,
  Mode,
  ScoreEntry,
} from "@/game/types";
import { useBubbleGame, type RunSummary } from "@/game/useBubbleGame";
import { useSfx } from "@/hooks/useSfx";
import { useTheme } from "@/hooks/useTheme";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { cheer, finale, sparkleAt, warmConfetti } from "@/lib/celebrate";
import {
  bestFor,
  bestScore,
  loadBadges,
  loadDaily,
  loadDifficulty,
  loadGhosts,
  loadHaptics,
  loadMath,
  loadMode,
  loadScores,
  loadSound,
  loadTotals,
  recordDaily,
  resetProgress as clearSavedProgress,
  saveBadges,
  saveDifficulty,
  saveGhosts,
  saveHaptics,
  saveMath,
  saveMode,
  saveScore,
  saveSound,
  saveTotals,
  type DailyRecord,
  type GhostStore,
  type Totals,
} from "@/lib/storage";
import { BubbleBackdrop } from "@/components/BubbleBackdrop";
import { GameOverScreen } from "@/components/GameOverScreen";
import { GameScreen } from "@/components/GameScreen";
import { SettingsSheet } from "@/components/SettingsSheet";
import { StartScreen } from "@/components/StartScreen";
import { StatsSheet } from "@/components/StatsSheet";
import { TopControls } from "@/components/TopControls";

const App = () => {
  useViewportHeight();
  const { theme, toggleTheme } = useTheme();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSound);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(loadHaptics);
  const [difficulty, setDifficulty] = useState<Difficulty>(loadDifficulty);
  const [mode, setMode] = useState<Mode>(loadMode);
  const [math, setMath] = useState<boolean>(loadMath);
  const [entries, setEntries] = useState<ScoreEntry[]>(loadScores);
  const [totals, setTotals] = useState<Totals>(loadTotals);
  const [daily, setDaily] = useState<DailyRecord>(loadDaily);
  const [badges, setBadges] = useState<AchievementId[]>(loadBadges);
  const [ghosts, setGhosts] = useState<GhostStore>(loadGhosts);

  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [finishedAt, setFinishedAt] = useState(0);
  const [wasBest, setWasBest] = useState(false);
  const [freshBadges, setFreshBadges] = useState<AchievementId[]>([]);

  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sfx = useSfx(soundEnabled, hapticsEnabled);

  // Today's challenge, refreshed if the session is left open past midnight.
  const [today, setToday] = useState(() => dayKey());
  const challenge = useMemo(() => challengeFor(new Date()), []);
  const activeChallenge = useMemo(
    () => (today === challenge.day ? challenge : challengeFor(new Date())),
    [today, challenge]
  );

  useEffect(() => {
    const id = window.setInterval(() => setToday(dayKey()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Latest values for callbacks that must stay referentially stable.
  const stateRef = useRef({ entries, totals, daily, badges, ghosts });
  useEffect(() => {
    stateRef.current = { entries, totals, daily, badges, ghosts };
  }, [entries, totals, daily, badges, ghosts]);

  useEffect(() => saveDifficulty(difficulty), [difficulty]);
  useEffect(() => saveMode(mode), [mode]);
  useEffect(() => saveSound(soundEnabled), [soundEnabled]);
  useEffect(() => saveHaptics(hapticsEnabled), [hapticsEnabled]);
  useEffect(() => saveMath(math), [math]);

  const handleFinish = useCallback(
    (run: RunSummary) => {
      const at = Date.now();
      const current = stateRef.current;
      const isBest = run.score > bestScore(current.entries);

      const entry: ScoreEntry = {
        score: run.score,
        difficulty: run.difficulty,
        mode: run.mode,
        level: run.level,
        streak: run.bestStreak,
        math: run.math,
        at,
      };
      setEntries(saveScore(entry, current.entries));

      const nextTotals: Totals = {
        games: current.totals.games + 1,
        pops: current.totals.pops + run.pops,
        bestStreak: Math.max(current.totals.bestStreak, run.bestStreak),
      };
      setTotals(nextTotals);
      saveTotals(nextTotals);

      // A daily run extends the streak; everything else leaves it alone.
      const nextDaily = run.day
        ? recordDaily(current.daily, run.day, run.score)
        : current.daily;
      if (run.day) setDaily(nextDaily);

      const unlocked = newlyEarned(
        {
          ...run,
          totals: nextTotals,
          dailyStreak: nextDaily.streak,
        },
        current.badges
      );
      if (unlocked.length > 0) {
        const nextBadges = [...current.badges, ...unlocked];
        setBadges(nextBadges);
        saveBadges(nextBadges);
      }

      // The run only becomes the new ghost if it actually beat the old one.
      const key = ghostKey(run.mode, run.difficulty, run.math);
      const promoted = betterGhost(
        current.ghosts[key],
        run.score,
        run.trace
      );
      if (promoted) {
        const nextGhosts = { ...current.ghosts, [key]: promoted };
        setGhosts(nextGhosts);
        saveGhosts(nextGhosts);
      }

      setSummary(run);
      setFinishedAt(at);
      setWasBest(isBest);
      setFreshBadges(unlocked);

      sfx.gameOver();
      finale(isBest || unlocked.length > 0);
    },
    [sfx]
  );

  const game = useBubbleGame({ difficulty, mode, onFinish: handleFinish });
  const { start, reset, pop, togglePause, state } = game;

  const startGame = useCallback(() => {
    sfx.start();
    warmConfetti();
    start({
      difficulty,
      mode,
      math,
      ghost: ghosts[ghostKey(mode, difficulty, math)],
    });
  }, [sfx, start, difficulty, mode, math, ghosts]);

  const startDaily = useCallback(() => {
    sfx.start();
    warmConfetti();
    start({
      difficulty: activeChallenge.difficulty,
      mode: "daily",
      seed: activeChallenge.seed,
      day: activeChallenge.day,
      math: activeChallenge.math,
      ghost: ghosts[
        ghostKey("daily", activeChallenge.difficulty, activeChallenge.math)
      ],
    });
  }, [sfx, start, activeChallenge, ghosts]);

  /** Replays whatever kind of run just ended, daily boards included. */
  const replay = useCallback(() => {
    if (summary?.day) startDaily();
    else startGame();
  }, [summary, startDaily, startGame]);

  const exitToMenu = useCallback(() => {
    reset(difficulty, mode);
    setSummary(null);
    setFreshBadges([]);
  }, [reset, difficulty, mode]);

  const resetProgress = useCallback(() => {
    clearSavedProgress();
    setEntries([]);
    setTotals({ games: 0, pops: 0, bestStreak: 0 });
    setDaily({ day: "", score: 0, streak: 0, bestStreak: 0 });
    setBadges([]);
    setGhosts({});
    setSummary(null);
    setFreshBadges([]);
  }, []);

  /** Every tap goes through here so sound and confetti stay off the game logic. */
  const handlePop = useCallback(
    (bubble: Bubble) => {
      const result = pop(bubble);

      if (result.tone === "hit") sfx.hit(result.multiplier);
      else if (result.tone === "miss" && result.label) sfx.miss();
      else if (result.tone === "power") {
        if (result.power === "freeze") sfx.freeze();
        else sfx.power();
        if (result.power === "star" || result.power === "nova") {
          sparkleAt(0.5, 0.45);
        }
      }

      if (result.leveledUp) {
        sfx.levelUp();
        cheer();
      }

      return result;
    },
    [pop, sfx]
  );

  // Heartbeat tick over the final seconds.
  const wholeSeconds = Math.ceil(state.secondsLeft);
  const playing = state.phase === "playing";
  useEffect(() => {
    if (playing && wholeSeconds > 0 && wholeSeconds <= URGENT_SECONDS) {
      sfx.tick();
    }
  }, [wholeSeconds, playing, sfx]);

  const overall = bestScore(entries);
  const onMenu = state.phase === "idle" || state.phase === "over";

  return (
    // `strict` keeps the heavyweight `motion.*` components out of the bundle;
    // only the `m.*` ones the game actually uses are loaded.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="relative min-h-[calc(var(--vh)*100)] w-full">
          <BubbleBackdrop />

          <main className="relative z-10 flex min-h-[calc(var(--vh)*100)] w-full items-center justify-center">
            {state.phase === "idle" && (
              <StartScreen
                difficulty={difficulty}
                mode={mode}
                best={bestFor(entries, difficulty, mode, math)}
                bestOverall={overall}
                totals={totals}
                challenge={activeChallenge}
                daily={daily}
                badgeCount={badges.length}
                math={math}
                onDifficulty={setDifficulty}
                onMode={setMode}
                onMath={setMath}
                onPlay={startGame}
                onPlayDaily={startDaily}
              />
            )}

            {(state.phase === "playing" || state.phase === "paused") && (
              <GameScreen
                state={state}
                soundEnabled={soundEnabled}
                onPop={handlePop}
                onToggleSound={() => setSoundEnabled((on) => !on)}
                onTogglePause={togglePause}
                onRestart={replay}
                onExit={exitToMenu}
              />
            )}

            {state.phase === "over" && summary && (
              <GameOverScreen
                summary={summary}
                entries={entries}
                highlight={finishedAt}
                isBest={wasBest}
                bestOverall={overall}
                earnedBadges={freshBadges}
                dailyStreak={daily.streak}
                onReplay={replay}
                onMenu={exitToMenu}
              />
            )}
          </main>

          {onMenu && (
            <TopControls
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((on) => !on)}
              onOpenStats={() => setStatsOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          )}

          <StatsSheet
            open={statsOpen}
            onClose={() => setStatsOpen(false)}
            entries={entries}
            totals={totals}
            daily={daily}
            badges={badges}
          />

          <SettingsSheet
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((on) => !on)}
            hapticsEnabled={hapticsEnabled}
            onToggleHaptics={() => setHapticsEnabled((on) => !on)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onReset={resetProgress}
          />

          <Analytics />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
};

export default App;
