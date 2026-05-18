# Ghost Writer

A horror-tinged retro adventure prototype about a deceased journalist haunting a typewriter, using words as weapons to uncover their own murder.

The goal is to keep the project light enough to run anywhere: no build step, no framework, no external assets, and no dependencies. Open `index.html` directly, or run the tiny local server included in `scripts/`.

## Concept

You are the ghost of a murdered 1940s journalist. Your soul is trapped inside a haunted typewriter carried by a hardboiled detective who does not yet know you are there. You can interact with paper, ink, and wood, and you reshape the world by typing the right words at the right moment.

Combat is semantic. Words like `BURN`, `BIND`, and `LIE` affect ghosts differently. Each ghost also has a hidden True Name scattered through environmental clues. Type a True Name correctly to banish the ghost instantly. Misspell it, and the ribbon frays.

## Current prototype

The first version is a tiny HTML5 Canvas scene with:

- real-time typing input
- ribbon health
- hardboiled no-backspace mode
- semantic command words
- True Name ghost banishment
- paper/ink/wood clue interactions
- a noir city presentation layer

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

The smoke test checks that the core files exist and contain the expected prototype hooks.

## Controls

- Arrow keys or WASD: move the detective
- Letter keys: type into the haunted typewriter
- Enter: commit the typed word
- Backspace: erase one character, unless Hardboiled Mode is enabled
- H: toggle Hardboiled Mode
- R: restart the prototype

## Project shape

```text
.
├── docs/
│   ├── design.md
│   └── roadmap.md
├── scripts/
│   ├── dev-server.mjs
│   └── smoke-test.mjs
├── src/
│   ├── main.js
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

## Design target

Ghost Writer should feel like Shadowgate and Deja Vu wandered into a haunted 16-bit noir arcade cabinet. The screen should invite investigation first, panic second, and dread always.
