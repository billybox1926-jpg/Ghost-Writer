# Ghost Writer Architecture (Current Prototype)

This document maps how the current Ghost Writer prototype is built today. It is intentionally implementation-focused and scoped to the live Mallory Vale slice.

## Scope and design boundaries

Ghost Writer is a plain browser project with no framework and no build step:

- No frameworks.
- No external game engine.
- No required browser automation dependency.
- No runtime package dependency for the game itself.
- Canvas-first rendering designed to stay lightweight and low-memory-friendly.
- Helper modules are kept pure where practical so they can be tested in Node.
- Runtime code avoids unnecessary per-frame allocation churn in hot paths.

The project favors a small set of focused ES modules under `src/` and dependency-free Node scripts under `scripts/`.

## Runtime flow (high-level)

At runtime, the game follows this order:

1. Browser loads `index.html` and module scripts.
2. `src/main.js` initializes the canvas scene, game state, and loop.
3. Per-frame updates advance movement, ghost pressure, combat feedback, particles, and camera shake.
4. Keyboard input is interpreted through input rules before mutating state.
5. Typed commands are committed and normalized, then routed to witness/door/ghost/True Name logic.
6. Case flow and clue journal are updated from concrete state transitions.
7. Ghost pressure and combat feedback (visual + audio cues) continue to run.
8. HUD text and accessibility status are refreshed from canonical state so they stay synchronized.

## Module map and responsibilities

### `src/main.js`

`main.js` is the orchestrator and render/update entry point.

- Owns DOM wiring (`canvas`, status panel, audio toggle hookup through `audio-engine`).
- Creates and mutates authoritative game state (`player`, `typed`, `ribbon`, `witness`, `ghost`, `casePhase`, clues, particles, shake).
- Defines inspectable world entities (receipt, typewriter, locked door, Eddie Pike) and case journal entries.
- Handles keyboard events and command commit behavior.
- Coordinates module helpers:
  - input normalization and shortcut eligibility from `input-rules.js`
  - semantic/witness/True Name rules from `semantic-rules.js`
  - phase progression from `case-flow.js`
  - clue lookup and discovery from `clue-journal.js`
  - shake state transitions from `screen-shake.js`
  - generated audio cues and pressure hum from `audio-engine.js`
- Runs the animation/update loop and all Canvas drawing passes.

### `src/semantic-rules.js`

Pure rule and tuning module for command semantics and pressure math.

- Shared helpers like `clamp` and name normalization.
- Ribbon loss tuning constants.
- Ghost command resolution (`BURN`, `BIND`, `LIE`) including gated behavior before the door is open.
- Proximity pressure classification + drain rate.
- True Name matching/misspelling evaluation.
- Witness command transitions (`FORGET`, `REMEMBER`, `ACCUSE`) with in-range validation.

### `src/input-rules.js`

Pure input interpretation helpers.

- Movement key recognition and movement-axis derivation.
- Modifier/composition safety guards.
- Printable character extraction and uppercase normalization.
- Empty-line shortcut gating.
- Typed buffer append and committed-word normalization/capping.

This allows `main.js` to keep event handlers readable while sharing testable edge-case behavior.

### `src/case-flow.js`

Pure case progression model for the first slice.

- Defines phase enum for beginning/investigation/door-ready/confrontation/ending lead.
- Computes current phase from discovered clues, witness memory state, door state, and ghost state.
- Provides objective text per phase.

### `src/clue-journal.js`

Pure clue selection/discovery utilities.

- Finds nearest inspectable within interaction range.
- Adds discovered clue IDs idempotently.
- Resolves discovered clue IDs back to clue records for rendering.

### `src/screen-shake.js`

Pure screen-shake state machine and tuning.

- Creates shake state object.
- Applies fresh or carryover impacts with caps.
- Updates shake offsets over time with damped oscillation.

Main loop code reads resulting offsets to jitter camera rendering without embedding shake math in `main.js`.

### `src/audio-engine.js`

Generated Web Audio feedback engine (no external assets).

- Defines cue registry and per-cue synth profiles.
- Creates/resumes `AudioContext` only after user gesture.
- Manages mute state and button text/ARIA synchronization.
- Plays short one-shot cues for typing, commit outcomes, ribbon damage, ghost actions, door open, and True Name banish.
- Runs continuous pressure hum whose intensity is driven from gameplay pressure state.

### `scripts/smoke-test.mjs`

Fast dependency-free repository smoke check.

- Verifies core files exist.
- Verifies key snippets exist in critical files.
- Exits nonzero on missing requirements.

### `scripts/test.mjs`

Node-based assertion suite for pure game logic.

- Tests input helpers, semantic rules, case flow, journal helpers, shake behavior, and audio helper logic.
- Exercises required command flows and edge cases with deterministic assertions.

### `scripts/browser-smoke.mjs`

Optional automated browser smoke test.

- Starts a tiny static server.
- Locates an installed browser; prefers Chromium-family tooling for CDP automation.
- Loads `index.html`, performs basic runtime checks and one keyboard interaction, inspects runtime errors/warnings, and captures a screenshot artifact.
- Skips cleanly when only unsupported/no browsers are present.

## Current Mallory Vale slice (required progression)

The playable route currently required by case flow is:

1. Inspect receipt.
2. Inspect Eddie Pike.
3. Type `REMEMBER` and commit.
4. Type `ACCUSE` and commit.
5. Type `OPEN` and commit.
6. Type `MALLORY VALE` and commit.

This sequence is reflected by phase objectives and witness/door/True Name gating in the existing rules and `main.js` command routing.

## Input model (current behavior)

Input handling is intentionally strict and context-aware:

- Arrow keys move only when the typed line is empty.
- Letters and spaces type into the haunted typewriter buffer.
- Enter inspects on an empty line; otherwise it commits typed text.
- Escape clears typed text first; Escape on an already-empty line restarts.
- F2 toggles Hardboiled Mode only when the typed line is empty.
- Audio is toggled via the on-screen button (not a letter shortcut).

## State ownership and synchronization

`main.js` owns canonical mutable runtime state. Helper modules calculate outcomes but do not own global runtime mutation.

Key synchronization rules used by the current prototype:

- Case phase is recomputed after relevant clue/witness/door/ghost changes.
- Journal output is derived from discovered clue IDs plus authored case entries.
- Pressure feedback derives from spatial relationship + ghost state flags.
- HUD labels and screen-reader status text are both updated from the same state snapshot, keeping accessibility status aligned with visible UI.

## How to extend safely

When adding to this prototype, keep changes incremental and data-driven:

- Prefer small pure helpers for new rule logic so it can be tested in `scripts/test.mjs`.
- Extend command/state behavior through tables and focused functions before adding branching inside the frame loop.
- Keep Canvas rendering lean (reuse arrays/state objects where possible; avoid avoidable per-frame temporary allocation churn).
- Add or update smoke/assertion coverage when behavior changes.
- Keep this doc aligned to current implementation; document future ideas elsewhere (for example roadmap/design docs) rather than presenting them as shipped systems.
