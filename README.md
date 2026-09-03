<h1 align="center">
Bubble Game
</h1>

<div align="center">

[![Vite](https://img.shields.io/badge/Vite+React+TypeScript-purple?logo=vite&logoColor=white)](https://vite.dev/)
[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/reactions-demo?name=Production)](https://bubblegame.in/)
[![License](https://img.shields.io/badge/License-MIT-3c60b1.svg?logo=opensourceinitiative&logoColor=white)](./LICENSE)

</div>

Bubble Game is a fast, cheerful reflex game for the browser. Find the target
number, pop every bubble that matches it, and keep the combo alive before the
clock runs out. Built with React, TypeScript and Vite, it plays instantly on a
phone or a desktop, one tap from the menu to the board.

## Features

- **Daily Challenge:** one seeded board a day, identical for every player on
  that date, with a streak that grows each day you show up. Replays are welcome,
  only your best score for the day is kept. Roughly every third day is a
  math day.
- **16 badges** to unlock, from your first pop to a seven-day daily streak.
  Locked badges show what they need, so there is always something to aim for.
- **Share your run** through the system share sheet, or copied to the clipboard
  where there isn't one.
- **Two ways to play:** **Rush** buys you seconds for every hit and costs you a
  little for a miss; **Chill** is a relaxed 90 seconds with no penalties at all.
- **Three difficulties:** Easy (1-12), Medium (1-40) and Hard (1-99), each with
  its own board size, target density and clock.
- **Combo multiplier:** every 4 hits in a row bumps the multiplier, up to x8.
- **Levels:** every 8 pops adds a level, bonus seconds and a livelier board.
- **Heat:** a run gets hotter the longer it lasts, through five visible tiers
  from Warm to Molten. Each tier buys you fewer seconds per hit, so a long run
  tightens towards an ending it cannot outrun.
- **Math mode:** flip one switch and every bubble wears a sum instead of a
  number, pop the ones that work out to the target. Easy adds and subtracts,
  Medium brings in times tables, Hard uses all four operations. It deals a
  smaller board with more time per hit, and pays better points for the effort.
- **Race your ghost:** your best run for each mode and difficulty is recorded
  second by second and replayed as a pace-setter. A chip beside your score
  shows whether you are ahead of your own best right now, and by how much.
- **Five power-up bubbles**, all of them rewards, none ever punish you:
  | Power-up | What it does |
  | --- | --- |
  | **Star Bonus** | A pile of bonus points, multiplier included |
  | **+6 Seconds** | Six more seconds on the clock |
  | **Time Freeze** | Stops the timer dead for 6 seconds |
  | **Rainbow** | Counts as a perfect hit, whatever the target is |
  | **Nova Blast** | Pops every matching bubble on the board at once |
- **Forgiving by design:** a wrong tap simply burns that decoy away, the board
  never scrambles under you, and the next scan gets a little easier.
- **Day & night themes** that follow your system setting and remember your choice.
- **Sound:** recorded pop samples layered with synthesised combo tones that rise
  with your streak, plus haptics where the device supports them.
- **Pause any time** with the button or `Esc`; the game also pauses itself when
  you switch tabs or click away to another window.
- **Local leaderboard and stats:** top scores with mode, difficulty and streak,
  a best-score-by-mode grid that keeps math runs on their own rows, and
  lifetime runs and pops. Scores from older
  versions are migrated automatically.
- **Settings you control:** sound, vibration, theme, and a one-tap reset that
  clears every scrap of saved progress.
- **Install it and play offline:** a web app manifest and service worker make
  the game installable to a home screen and fully playable with no connection.
- **Playable without a mouse:** the board is one tab stop, arrow keys move
  between bubbles, and Enter pops, no tabbing through seventy-odd buttons.
- **Fits any screen:** bubbles resize so the whole board is always visible at
  once, from a small phone to a wide desktop.
- **Accessible:** labelled controls, live regions for the target and clock,
  visible focus rings, keyboard board navigation, and full
  `prefers-reduced-motion` support.

## How to Play

1. **Take the Daily Challenge**, or pick a mode, Rush or Chill and a
   difficulty.
2. **Hit Play.** The number in the ring at the top-left is your target.
3. **Pop every bubble showing that number.** Each correct pop scores
   `base points x combo multiplier`, adds seconds and deals a fresh board.
4. **Grab the power-ups** when they appear. They are always worth taking.
5. **Keep going** until the clock hits zero, then chase your high score or
   the ghost of your own best run.

### Scoring at a glance

| Difficulty | Numbers | Base points | Start time | Time per hit | Miss penalty |
| --- | --- | --- | --- | --- | --- |
| Easy | 1-12 | 10 | 45s | +2.0s | -1.0s |
| Medium | 1-40 | 14 | 38s | +1.8s | -1.5s |
| Hard | 1-99 | 20 | 30s | +1.6s | -2.0s |

Chill mode replaces the clock with a flat 90 seconds and waives every penalty.
The Daily Challenge plays by Rush rules, on a difficulty that rotates with the
date.

### Math mode

Every bubble is built *from* the value it should equal, never parsed back the
other way, so a decoy can never accidentally work out to the target. Operand
sizes are capped per difficulty to keep labels short enough to read inside a
bubble, and when no operator fits a value the bubble simply shows the plain
number rather than leaving a board unwinnable. Math scores, bests and ghosts
are all kept on their own board, a mental-arithmetic run is not comparable to
a scanning one.

### Two ramps, pulling in different directions

| Ramp | Driven by | What it tightens |
| --- | --- | --- |
| **Level** | Pops (every 8) | The board: more bubbles, a thinner target |
| **Heat** | Seconds played | The clock: fewer seconds bought per hit |

They are kept deliberately separate. If both grew the board, a long run would
end up unreadable rather than tense; as it stands the board stays as legible at
Molten as it was at Warm, while the time economy is what closes in. Heat only
advances while you are actually playing, so pausing or a Time Freeze buys
genuine breathing room. Chill mode heats at half pace.

### Controls

| Action | Control |
| --- | --- |
| Move between bubbles | Arrow keys, `Home`, `End` |
| Pop the focused bubble | `Enter` or `Space` |
| Pause / resume | Pause button or `Esc` |
| Restart the run | Restart button |
| Back to the menu | Exit button |
| Mute / unmute | Speaker button |
| Stats & badges | Trophy button on the menu |
| Settings | Gear button on the menu |

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- npm (included with Node.js)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/neuralsorcerer/bubble-game.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd bubble-game
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

## Usage

### Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser to play.

### Build for Production

```bash
npm run build
```

The optimized build will be available in the `dist` folder.

### Lint

```bash
npm run lint
```

### Test

```bash
npm test         # one run
npm run test:watch
```

The suite covers the pure game logic, board fairness, seeded determinism,
scoring maths, achievement rules and daily-streak rollover and needs no DOM,
so it runs in milliseconds.

## Project Structure

```
src/
  game/        Rules, tuning and state. engine.ts, rng.ts, daily.ts,
               ghost.ts, math.ts and achievements.ts are pure, framework-free
               logic, each with a *.test.ts beside it
  hooks/       Theme, sound, viewport and board-fitting hooks
  lib/         Storage, Web Audio voices, confetti and share helpers
  components/  Screens, the HUD, the board and the UI primitives
public/
  sw.js        Service worker: network-first navigation, cache-first assets
  manifest.webmanifest
  og-card.png  The 1200x630 social share card
design/
  og-card.html Source for that card, edit and re-screenshot to change it
```

### The share card

Links to the game unfurl as a 1200x630 card built from the same flat bubble
art the game draws. Its source lives at `design/og-card.html`: open it in a
browser and screenshot the `.card` element at 1200x630 to regenerate
`public/og-card.png` after an edit. The tags point at an absolute URL and a
PNG deliberately, crawlers ignore relative paths, and most ignore SVGs
entirely.

### Performance

First paint ships ~130 kB gzipped of JavaScript. Three things keep it there:

- **Motion loads lazily.** `LazyMotion` with the `domAnimation` feature set and
  `m.*` components pulls in only the animation code the game actually uses.
  `strict` mode makes the full `motion.*` components a build-time error, so the
  heavy bundle cannot creep back in.
- **Confetti is deferred.** `canvas-confetti` is dynamically imported and
  warmed as a run starts, so it never delays the menu and the first burst is
  still instant.
- **React gets its own chunk.** It barely changes between deploys, so it stays
  valid in the service worker cache while the app chunk moves on.

### Offline and updates

The service worker keeps navigations **network-first**, so an online visitor
always gets the newest deploy and the cache is only ever a fallback. Build
output is content-hashed and served cache-first; sounds and icons use
stale-while-revalidate; anything off-origin (fonts, analytics) is left alone.

### How the Daily Challenge stays fair

The date seeds a `mulberry32` generator (`src/game/rng.ts`), and every board the
run deals comes from it. No server is involved: two devices on the same calendar
day derive the same seed and therefore the same sequence of boards. Cosmetic
randomness, the praise words that float up on a hit deliberately stays on
`Math.random` so it can never shift the seeded stream.

## License

This project is licensed under the [MIT License](LICENSE).
