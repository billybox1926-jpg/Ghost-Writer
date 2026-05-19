# Ghost Writer Player & Setup Guide

*Mallory Vale is waiting. This guide gets you from clone to first banish without digging through source code.*

## What this is (right now)

Ghost Writer is currently a **prototype slice**: one compact case flow in a single Canvas scene, built with plain HTML/CSS/JS and no gameplay runtime dependencies.

It is not the full game yet. Human browser playtest coverage is also tracked separately in issue #33.

## Quick setup and launch

1. Clone this repository (or open your existing local copy).
2. From the project root, run:

   ```bash
   npm run smoke
   npm test
   npm run dev
   ```

3. Open the local/forwarded URL printed by the dev server (typically `http://localhost:8000`).

If your environment forwards ports (Codespaces, remote containers, SSH tunnels), use that forwarded browser URL instead of localhost.

## Controls and input rules

The typewriter is strict by design.

- **Arrow keys** move the detective **only when the typed line is empty**.
- **Letters and spaces** type into the haunted typewriter buffer.
- **Enter** on an empty line inspects nearby objects/people.
- **Enter** with typed text commits the typed word or phrase.
- **Escape** clears typed text first; Escape on an already-empty line restarts the run.
- **F2** toggles Hardboiled Mode **only on an empty line**.
- **Backspace** erases text unless Hardboiled Mode is enabled.
- **Audio** is controlled with the on-screen **Audio** button.

## How to play the Mallory Vale slice

Follow this exact progression for the current case route:

1. Inspect the **receipt**.
2. Inspect **Eddie Pike**.
3. Type `REMEMBER` and press Enter.
4. Type `ACCUSE` and press Enter.
5. Type `OPEN` and press Enter.
6. Type `MALLORY VALE` and press Enter.

If inputs seem unresponsive, make sure you are not carrying extra typed characters (Esc clears the line).

## Core player concepts

- **Ribbon health**: Your typewriter ribbon is your survivability budget.
- **True Name**: The correct True Name ends the confrontation instantly.
- **Misspelled True Name mutation**: Near-miss naming can mutate/escalate ghost pressure instead of banishing.
- **Journal and clues**: Inspections feed discovered clue entries and case context.
- **Witness commands**: `FORGET`, `REMEMBER`, `ACCUSE` affect Eddie Pike when you are in range.
- **Door gating**: `OPEN` only matters after witness state progression.
- **Post-door semantic words**: once the door is open, `BURN`, `BIND`, and `LIE` become relevant tactical commands.
- **Hardboiled Mode**: no-backspace typing pressure; plan commands before committing.
- **Generated audio and ghost pressure**: audio cues and pressure hum reflect escalating danger; toggle with the Audio button.

## Browser smoke verification

For an optional browser-level check:

```bash
npm run smoke:browser
```

What to expect:

- If a supported Chromium-family browser is available, the script runs basic runtime checks and can output a screenshot artifact (`artifacts/browser-smoke.png`).
- If no supported browser exists in your environment, the script **skips cleanly** with a clear message (not a failure).

## Limits of this guide (intentional)

This guide is player/setup focused for the current prototype. It intentionally leaves deeper contributor topics for separate docs, such as:

- contributor workflow and code architecture details
- long-term roadmap and design expansion
- future rule/case authoring patterns

For implementation-level details, see `docs/architecture.md`.
