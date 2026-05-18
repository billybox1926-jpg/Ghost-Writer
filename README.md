# Ghost Writer

A horror-tinged retro adventure prototype about a deceased journalist haunting a typewriter, using words as weapons to uncover their own murder.

The goal is to keep the project light enough to run anywhere: no build step, no framework, no external assets, and no dependencies. Open `index.html` directly, or run the tiny local server included in `scripts/`.

## Concept

You are the ghost of a murdered 1940s journalist. Your soul is trapped inside a haunted typewriter carried by a hardboiled detective who does not yet know you are there. You can interact with paper, ink, and wood, and you reshape the world by typing the right words at the right moment.

Combat is semantic. Words like `BURN`, `BIND`, and `LIE` affect ghosts differently. Each ghost also has a hidden True Name scattered through environmental clues. Type a True Name correctly to banish the ghost instantly. Misspell it, and the ribbon frays.

Audio feedback is generated in-browser with the Web Audio API only. It starts or resumes after player input or the Audio button, never during page load, and it can be muted at any time.

## Current prototype

The first version is a tiny HTML5 Canvas scene with:

- real-time typing input
- ribbon health
- hardboiled no-backspace mode
- Semantic command words
- True Name ghost banishment
- misspelled True Name ghost mutation
- inspectable paper/ink/wood clues
- prototype witness memory commands: `FORGET`, `REMEMBER`, and `ACCUSE`
- current-run journal entries for discovered clues
- a noir city presentation layer
- lightweight generated Web Audio feedback for typewriter taps, command outcomes, ribbon damage, ghost pressure, and Mallory banishment

## Run locally

Option 1: open `index.html` in a browser.

Option 2: use the included server:

```bash
npm run dev
```

Then visit `http://localhost:8000`.

## Smoke test

```bash
npm run smoke
```

The smoke test checks that the core files exist and contain the expected prototype hooks. It is intentionally dependency-free and fast, and it does not launch a browser.

## Manual browser smoke test

Use this checklist when you want visual confirmation of the Canvas prototype without adding project dependencies:

1. Start the included static server:

   ```bash
   npm run dev
   ```

2. Visit `http://localhost:8000/index.html` in a browser.
3. Confirm the noir title card, controls help, and `Ghost Writer prototype canvas` appear.
4. Click or tab to the canvas, press `A`, and confirm the HUD/status reflects one typed letter without a console error.
5. Press `Backspace`, `E`, arrow keys or WASD, and `Esc` to confirm the page remains responsive.

An optional automated browser check is also available:

```bash
npm run smoke:browser
```

`npm run smoke:browser` uses only built-in Node APIs plus an already-installed Chromium-family browser (`chromium`, `chromium-browser`, or `google-chrome`) when one is available. It looks for `firefox` too, but skips cleanly because this dependency-free script uses Chrome DevTools Protocol for page checks. When no supported browser tooling is available, it exits successfully with a clear skipped message. When Chromium-family tooling is available, it loads `index.html`, verifies the canvas and immediate runtime state, sends one keyboard interaction, checks for immediate browser errors, and writes `artifacts/browser-smoke.png`.

## Controls

- Arrow keys or WASD: move the detective
- Letter keys: type into the haunted typewriter
- Enter: commit the typed word, or inspect if the typewriter line is empty and you are near a clue
- E: inspect a nearby clue when the typewriter line is empty
- `FORGET`, `REMEMBER`, `ACCUSE`: change Eddie Pike's witness memory when close enough
- `BURN`, `BIND`, `LIE`: after the alley door opens, BURN hurts and enrages Mallory, BIND briefly pins her down, and LIE sends her after a decoy
- Backspace: erase one character, unless Hardboiled Mode is enabled
- F2: toggle Hardboiled Mode
- M while the typed line is empty, or the Audio button below the canvas: toggle subtle generated audio feedback
- Esc: restart the prototype

## Project shape

```text
.
├── docs/
│   ├── design.md
│   └── roadmap.md
├── scripts/
│   ├── browser-smoke.mjs
│   ├── dev-server.mjs
│   └── smoke-test.mjs
├── src/
│   ├── audio-engine.js
│   ├── case-flow.js
│   ├── clue-journal.js
│   ├── input-rules.js
│   ├── main.js
│   ├── screen-shake.js
│   ├── semantic-rules.js
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

## Design target

Ghost Writer should feel like Shadowgate and Deja Vu wandered into a haunted 16-bit noir arcade cabinet. The screen should invite investigation first, panic second, and dread always.
