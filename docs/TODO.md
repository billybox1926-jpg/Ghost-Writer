# Ghost Writer TODO and Project Map

_Last updated: 2026-05-19_

This file is the quick maintainer map for Ghost Writer: what has happened, what is next, and what should not be lost between sessions.

GitHub issues remain the source of truth for active work. Use this file for orientation before choosing the next issue, preparing a prototype release, or handing the project to another contributor.

## Current status

Ghost Writer is a dependency-free horror-noir Canvas prototype with one complete playable case slice: **Mallory Vale**.

The current slice includes typed input, clue inspection, witness memory commands, a current-run journal, semantic ghost commands, True Name resolution, ribbon health, ghost pressure, screen shake, generated Web Audio cues, accessibility/status text, lightweight Node tests, and optional browser-smoke verification.

The repo is close to a public prototype/playtest release. The remaining release-critical gate is a real human/browser playtest of the Mallory Vale slice.

## Completed foundation

### Playable prototype

- Built the Mallory Vale investigation flow.
- Preserved the required route:
  1. Inspect the receipt.
  2. Inspect Eddie Pike.
  3. Type `REMEMBER`.
  4. Type `ACCUSE`.
  5. Type `OPEN`.
  6. Type `MALLORY VALE`.
- Added semantic command words such as `BURN`, `BIND`, and `LIE`.
- Added witness command handling for `FORGET`, `REMEMBER`, and `ACCUSE`.
- Added door gating and True Name resolution.
- Added ribbon damage, ghost pressure, ghost mutation behavior, and screen shake.
- Added generated audio feedback without external assets.
- Preserved the intentional input model for movement, typing, Enter, Escape, F2, Backspace, and the Audio button.

### Verification and CI

- Added `npm run smoke` for fast repository checks.
- Added `npm test` for pure helper logic.
- Added `npm run smoke:browser` for optional browser verification.
- Made browser smoke skip cleanly when no supported browser is available.
- Added lightweight GitHub Actions CI for smoke, tests, whitespace, syntax checks, and optional browser smoke.

### Documentation

- Added or refreshed:
  - `docs/guide.md`
  - `docs/architecture.md`
  - `docs/CONTRIBUTING.md`
  - `docs/MAINTAINER_WORKFLOW.md`
  - `docs/ISSUE_LABELS.md`
  - `docs/roadmap.md`
  - `docs/rule_authoring.md`
  - `docs/suggestions.json`
  - `docs/README.md`
  - `docs/design.md`
- Updated the root README so the project tree and docs links match the current repo.
- Expanded `docs/suggestions.json` with typed material-interaction seeds for paper, ink, and wood.
- Refreshed `docs/roadmap.md` so completed docs/CI work is no longer listed as active.

## Latest validated state

The latest maintainer validation after pulling through `7199d38` confirmed:

- `npm run smoke` passed.
- `npm test` passed.
- `git diff --check` reported no whitespace problems.
- `node --check src/main.js` passed.
- `node --check src/audio-engine.js` passed.
- `node --check scripts/browser-smoke.mjs` passed.
- `npm run smoke:browser` skipped cleanly in Codespaces because no supported browser was installed.
- `npm run dev` started successfully at `http://localhost:8000`.

## Release-candidate gate

### #33 — Human/browser Mallory Vale playtest

This is the main gate before calling the current state a public prototype/playtest release.

Run the normal verification set:

```bash
npm run smoke
npm test
git diff --check
node --check src/main.js
node --check src/audio-engine.js
node --check scripts/browser-smoke.mjs
npm run smoke:browser
npm run dev
```

Then open the local or forwarded browser URL and complete the intended route:

1. Inspect receipt.
2. Inspect Eddie Pike.
3. Type `REMEMBER`.
4. Type `ACCUSE`.
5. Type `OPEN`.
6. Type `MALLORY VALE`.

Also test key mistake paths:

- wrong words
- misspelled True Name
- early `OPEN`
- early `MALLORY VALE`
- out-of-range witness commands
- Hardboiled Mode
- audio toggle
- Escape clear/restart behavior
- movement and inspection after typing and clearing text

Record results in `docs/playtest-notes.md` or as a comment on #33. Open follow-up issues for confirmed bugs, confusing feedback, or onboarding gaps.

## Current open direction

### #33 — Public playtest request: Mallory Vale slice

Release-critical. The project needs direct human/browser feedback before the prototype release should be treated as validated.

### #27 — Prototype a second ghost encounter with a different clue pattern

Next content/design proof. This should show that semantic combat can support a ghost that is not just Mallory with a new name.

Good constraints:

- connect it to Black Ribbon Press or a nearby noir location
- use a different True Name clue pattern from Mallory
- give the ghost a distinct pressure behavior or weakness
- preserve the Mallory Vale route

### #29 — Create second playable investigation scene after Mallory Vale

Next playable expansion. This should reuse existing systems before adding new ones.

Good constraints:

- keep the new area small
- add at least one inspectable object
- add at least one witness or witness-like memory gate
- add at least one ghost/clue interaction
- keep the project no-dependency and Canvas-first

## Material interaction seeds

`docs/suggestions.json` now includes future-facing typed puzzle seeds:

- `REVEAL` on a paper ledger or receipt watermark.
- `ACCUSE` near a stained ink confession page.
- `SPLIT` on a scarred wooden threshold.
- `ERASE` on a false carbon-copy lead.
- `STAMP` on a Black Ribbon Press form.

These are not shipped gameplay yet. They are structured design seeds for future issue work.

## Suggested prototype release labels

Possible public prototype labels:

- `v0.1.0-prototype`
- `Ghost Writer Prototype 0.1 — Mallory Vale Slice`
- `Mallory Vale Public Playtest Build`

Do not describe the current state as a full game. It is a playable prototype slice.

## Recurring maintenance checklist

Before closing issue work when practical:

```bash
npm run smoke
npm test
git diff --check
```

When runtime, browser smoke, or release readiness is relevant:

```bash
node --check src/main.js
node --check src/audio-engine.js
node --check scripts/browser-smoke.mjs
npm run smoke:browser
```

A clean browser-smoke skip is acceptable in an environment without a supported system browser.

## Repo hygiene

- Pull latest `main` before starting work.
- Keep each change scoped to one issue.
- Delete merged or superseded remote branches.
- Prune stale local branches during cleanup.
- Keep `docs/README.md`, `docs/roadmap.md`, and this file aligned after major changes.
- Promote actionable work into GitHub issues instead of letting this file become a hidden tracker.

## Boundaries

Do not add frameworks, engines, build systems, browser packages, inventory systems, or major route changes unless a focused issue explicitly calls for them. Preserve the Mallory Vale route and the semantic-combat identity by default.
