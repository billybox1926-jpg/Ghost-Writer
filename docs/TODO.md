# Ghost Writer TODO and Project Map

_Last updated: 2026-05-19_

This file is the maintainer map for Ghost Writer. GitHub issues remain the source of truth for active work; this file records the project state, reference links, validation notes, and next release gates.

## Current status

Ghost Writer is a dependency-free horror-noir Canvas prototype with one complete playable case slice: **Mallory Vale**.

The repo is close to a public prototype/playtest release. The remaining release-critical gate is **#33**, a real human/browser playtest of the Mallory Vale slice.

## Required Mallory Vale route

1. Inspect the receipt.
2. Inspect Eddie Pike.
3. Type `REMEMBER`.
4. Type `ACCUSE`.
5. Type `OPEN`.
6. Type `MALLORY VALE`.

Preserve this route unless a focused issue explicitly redesigns the first case.

## Completed foundation

- Playable Mallory Vale investigation flow.
- Typed input, clue inspection, witness memory commands, journal entries, semantic commands, True Name resolution, ribbon health, pressure, screen shake, generated audio cues, and accessibility/status text.
- Intentional input behavior for movement, typing, Enter, Escape, Backspace, F2, and the Audio button.
- `npm run smoke`, `npm test`, optional `npm run smoke:browser`, and lightweight GitHub Actions CI.
- Documentation set covering setup, architecture, contributing, maintainer workflow, issue labels, roadmap, rule authoring, structured suggestions, docs index, design guide, and this project map.

## Reference ledger

### Completed issues

- #35 — architecture documentation.
- #36 — player/setup guide.
- #37 — contributor, maintainer, and label workflow docs.
- #38 — roadmap and maintenance docs.
- #39 — rule-authoring and structured suggestion docs.
- #41 — lightweight CI workflow.
- #45 — browser-smoke bootstrap skip behavior.
- #49 — docs index and per-file scope map.
- #50 — expanded design guide.
- #51 — refreshed roadmap after docs/CI cleanup.
- #28 — typed paper/ink/wood material-interaction seeds.

### Merged PRs / completed Codex tasks

- #40 — architecture map.
- #42 — player/setup guide.
- #43 — CI workflow.
- #44 — initial roadmap and TODO.
- #46 — browser-smoke skip hardening.
- #47 — contributor and maintainer workflow docs.
- #48 — rule-authoring guide and structured suggestions.

### Direct-to-main commits

- `8d24c90` — add docs index.
- `3706909` — refresh README project tree.
- `bb62b0b` — expand design guide.
- `08604f1` — refresh roadmap priorities.
- `7199d38` — expand material interaction seeds.
- `0d40fad` — expand TODO into project map.

## Latest validation and boot notes

Latest maintainer validation after pulling through `7199d38`:

- `npm run smoke` passed with: `Smoke test passed. The haunted typewriter clicks.`
- `npm test` passed with: `Semantic rules and clue journal tests passed. The True Name holds.`
- `git diff --check` reported no whitespace problems.
- `node --check src/main.js` passed.
- `node --check src/audio-engine.js` passed.
- `node --check scripts/browser-smoke.mjs` passed.
- `npm run smoke:browser` skipped cleanly because Codespaces had no supported browser.
- `npm run dev` booted successfully with: `Ghost Writer dev server: http://localhost:8000`.

The browser-smoke skip is acceptable in a browserless environment. It does not replace #33.

## Release-candidate gate

### #33 — Public playtest request: Mallory Vale slice

Before calling this a public prototype/playtest release, run the game in a real browser and record results on #33 or in `docs/playtest-notes.md`.

Test the intended route and these important mistake paths:

- wrong words
- misspelled True Name
- early `OPEN`
- early `MALLORY VALE`
- out-of-range witness commands
- Hardboiled Mode
- audio toggle
- Escape clear/restart behavior
- movement and inspection after typing and clearing text

Open follow-up issues for confirmed bugs, confusing feedback, or onboarding gaps.

## Current open direction

- #33 — human/browser playtest. Release-critical.
- #27 — second ghost encounter. Next design/content proof.
- #29 — second playable investigation scene. Next playable expansion.

## Material interaction seeds

`docs/suggestions.json` now includes future-facing typed puzzle seeds:

- `REVEAL` on a paper ledger or receipt watermark.
- `ACCUSE` near a stained ink confession page.
- `SPLIT` on a scarred wooden threshold.
- `ERASE` on a false carbon-copy lead.
- `STAMP` on a Black Ribbon Press form.

These are not shipped gameplay yet. They are structured seeds for future issue work.

## Suggested public prototype labels

- `v0.1.0-prototype`
- `Ghost Writer Prototype 0.1 — Mallory Vale Slice`
- `Mallory Vale Public Playtest Build`

The current state is a playable prototype slice, not a full game.

## Recurring verification checklist

Core checks:

- `npm run smoke`
- `npm test`
- `git diff --check`

Runtime/release checks:

- `node --check src/main.js`
- `node --check src/audio-engine.js`
- `node --check scripts/browser-smoke.mjs`
- `npm run smoke:browser`

## Repo hygiene

- Pull latest `main` before starting work.
- Keep each change scoped to one issue.
- Delete merged or superseded remote branches.
- Prune stale local branches during cleanup.
- Keep `docs/README.md`, `docs/roadmap.md`, and this file aligned after major changes.
- Promote actionable work into GitHub issues instead of leaving it only in this file.

## Boundaries

Keep the project dependency-free, Canvas-first, and centered on semantic combat. Preserve the Mallory Vale route by default.
