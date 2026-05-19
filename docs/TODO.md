# Ghost Writer TODO and Project Map

_Last updated: 2026-05-19_

This file is the maintainer project map for Ghost Writer. It records the current public prototype state, completed work, important references, validation history, release gates, and next development direction.

GitHub issues remain the source of truth for active work. This file should help a returning maintainer understand the repo quickly; it should not replace issue tracking, PR review, or playtest notes.

## How to use this file

Use this file when you need to answer:

- What is currently playable?
- What work just landed?
- Which issues and PRs produced the current state?
- What checks have been run?
- What blocks a public prototype release?
- What should happen next?

Do not use this file for detailed bug reports, long design proposals, or implementation specs. Open or update GitHub issues for work that needs ownership.

## Current public status

Ghost Writer is a dependency-free horror-noir Canvas prototype with one complete playable case slice: **Mallory Vale**.

The repo is public, has GitHub Pages enabled for browser playtesting, uses MIT licensing, and has a public README focused on the playable prototype rather than internal project management.

The current build is close to a public prototype/playtest release. The remaining release-critical gate is **#33**, a real human/browser playtest of the Mallory Vale slice.

## Current playable slice

The Mallory Vale slice includes:

- typed command input
- clue inspection
- witness memory commands
- current-run journal entries
- semantic ghost commands
- True Name resolution
- misspelled-name ghost mutation behavior
- ribbon health and ghost pressure
- screen shake feedback
- generated Web Audio cues
- accessibility/status text updates
- lightweight smoke and helper tests
- optional browser-smoke verification

## Required Mallory Vale route

Preserve this flow unless a focused issue explicitly redesigns the first case:

1. Inspect the receipt.
2. Inspect Eddie Pike.
3. Type `REMEMBER`.
4. Type `ACCUSE`.
5. Type `OPEN`.
6. Type `MALLORY VALE`.

## Public-facing repo state

The public README should stay focused on:

- what the game is
- where to play it
- how to run it locally
- basic controls
- the current Mallory Vale route
- quick verification commands
- links into docs
- license

The root README should not carry large internal project maps, complete file trees, issue ledgers, or long maintainer process notes. Those belong here or in the specific docs under `docs/`.

## Completed foundation

### Prototype systems

- Mallory Vale investigation flow.
- Typed command input.
- Semantic command handling for words such as `BURN`, `BIND`, and `LIE`.
- Witness memory commands: `FORGET`, `REMEMBER`, and `ACCUSE`.
- Door gating through `OPEN`.
- True Name resolution through `MALLORY VALE`.
- Misspelled True Name mutation behavior.
- Ribbon health and pressure feedback.
- Screen shake feedback.
- Current-run clue journal.
- Generated Web Audio feedback.
- Accessibility/status text support.

### Intentional input behavior

Preserve these rules unless an input-redesign issue explicitly says otherwise:

- Arrow keys move only when the typed line is empty.
- Letter keys and spaces always type into the haunted typewriter.
- Enter inspects when the typed line is empty.
- Enter commits typed words or phrases when text exists.
- Escape clears typed text first.
- Escape restarts only when the typed line is already empty.
- F2 toggles Hardboiled Mode only on an empty line.
- Audio uses the on-screen Audio button.
- No letter-key shortcuts should interfere with typing.

### Verification and CI

- `npm run smoke` exists for fast repository checks.
- `npm test` exists for pure helper logic.
- `npm run smoke:browser` exists for optional browser verification.
- Browser smoke skips cleanly when no supported browser is available.
- Browser smoke also skips cleanly when Chromium DevTools bootstrap fails before connection.
- GitHub Actions CI runs smoke, tests, whitespace, syntax checks, and optional browser smoke.

### Documentation

Current docs include:

- `docs/guide.md` — player/setup guide.
- `docs/architecture.md` — implementation architecture map.
- `docs/CONTRIBUTING.md` — contributor workflow.
- `docs/MAINTAINER_WORKFLOW.md` — maintainer workflow.
- `docs/ISSUE_LABELS.md` — label taxonomy.
- `docs/roadmap.md` — current direction snapshot.
- `docs/rule_authoring.md` — content/rule authoring guide.
- `docs/suggestions.json` — future-facing structured content seeds.
- `docs/README.md` — docs index and per-file scope map.
- `docs/design.md` — design guide.
- `docs/playtest-notes.md` — validation/playtest notes.
- `docs/TODO.md` — this maintainer project map.

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

### Direct-to-main maintainer commits

- `8d24c90` — add docs index.
- `3706909` — refresh README project tree.
- `bb62b0b` — expand design guide.
- `08604f1` — refresh roadmap priorities.
- `7199d38` — expand material interaction seeds.
- `0d40fad` — expand TODO into project map.
- `12f9053` — add references to TODO project map.
- `a09213b` — replace license placeholder with MIT license.
- `a616f27` — align package license metadata.
- `b44f1a3` — align package-lock license metadata.
- `47502f6` — add README license note.
- `58bb1d6` — streamline public README.
- `8b66eb2` — align docs index with project map.
- `1c09429` — make TODO project map robust.
- `7e0e2ce` — restore the `Semantic` README smoke marker.

## Latest validation history

### Maintainer validation after pulling through `7199d38`

Commands run:

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

Observed results:

- `npm run smoke` passed with `Smoke test passed. The haunted typewriter clicks.`
- `npm test` passed with `Semantic rules and clue journal tests passed. The True Name holds.`
- `git diff --check` reported no whitespace problems.
- `node --check src/main.js` passed.
- `node --check src/audio-engine.js` passed.
- `node --check scripts/browser-smoke.mjs` passed.
- `npm run smoke:browser` skipped cleanly because Codespaces had no supported browser.
- `npm run dev` booted successfully with `Ghost Writer dev server: http://localhost:8000`.

### After the public-doc/license cleanup

The following docs/metadata-only commits landed after the latest local validation:

- MIT license cleanup.
- README license note.
- Public README streamlining.
- Docs index alignment.
- TODO/project-map strengthening.
- README smoke-marker restoration after `npm run smoke` reported `Missing expected snippet in README.md: Semantic`.

Run the verification set again after pulling latest `main`.

## Verification checklist

Core checks:

```bash
npm run smoke
npm test
git diff --check
```

Runtime/release checks:

```bash
node --check src/main.js
node --check src/audio-engine.js
node --check scripts/browser-smoke.mjs
npm run smoke:browser
```

Boot check:

```bash
npm run dev
```

A clean browser-smoke skip is acceptable in an environment without a supported system browser. It does not replace human browser playtesting.

## Release-candidate gate

### #33 — Public playtest request: Mallory Vale slice

Before calling this a public prototype/playtest release, run the game in a real browser and record results on #33 or in `docs/playtest-notes.md`.

Test the intended route:

1. Inspect receipt.
2. Inspect Eddie Pike.
3. Type `REMEMBER`.
4. Type `ACCUSE`.
5. Type `OPEN`.
6. Type `MALLORY VALE`.

Test important mistake paths:

- wrong words
- misspelled True Name
- early `OPEN`
- early `MALLORY VALE`
- out-of-range witness commands
- Hardboiled Mode
- audio toggle
- Escape clear/restart behavior
- movement and inspection after typing and clearing text

Record:

- browser and operating system
- whether the game launched
- whether the case was completed
- confusing feedback or onboarding gaps
- bugs or visual/audio discomfort
- whether controls, audio toggle, Hardboiled Mode, clue flow, and ending were clear

Open follow-up issues for confirmed bugs or major UX problems.

## Current open direction

### #33 — Human/browser playtest

Release-critical. This proves the current slice works for a real player in a browser.

### #27 — Second ghost encounter

Next design/content proof. It should use a different clue pattern from Mallory Vale and show that semantic combat can support more than one ghost structure.

Recommended constraints:

- connect it to Black Ribbon Press or a nearby noir location
- use a True Name discovery pattern different from Mallory's receipt/witness/door chain
- add at least one distinct behavior, weakness, or command interaction
- keep implementation small and no-dependency
- preserve the Mallory Vale route

### #29 — Second playable investigation scene

Next playable expansion. It should reuse existing systems before adding new ones.

Recommended constraints:

- keep the new area small
- add at least one inspectable object
- add at least one witness or witness-like memory gate
- add at least one ghost/clue interaction
- keep the project Canvas-first and dependency-free

## Material interaction seeds

`docs/suggestions.json` includes future-facing typed puzzle seeds:

- `REVEAL` on a paper ledger or receipt watermark.
- `ACCUSE` near a stained ink confession page.
- `SPLIT` on a scarred wooden threshold.
- `ERASE` on a false carbon-copy lead.
- `STAMP` on a Black Ribbon Press form.

These are not shipped gameplay yet. They are structured seeds for future issue work.

## Suggested public prototype labels

Possible release labels:

- `v0.1.0-prototype`
- `Ghost Writer Prototype 0.1 — Mallory Vale Slice`
- `Mallory Vale Public Playtest Build`

The current state is a playable prototype slice, not a full game.

## Repo hygiene

- Pull latest `main` before starting work.
- Keep each change scoped to one issue.
- Delete merged or superseded remote branches.
- Prune stale local branches during cleanup.
- Keep `README.md`, `docs/README.md`, `docs/roadmap.md`, and this file aligned after major changes.
- Keep project/process details in docs, not in the public README.
- Promote actionable work into GitHub issues instead of leaving it only in this file.

## Boundaries

Keep the project dependency-free, Canvas-first, and centered on semantic combat. Avoid frameworks, engines, build systems, browser packages, inventory systems, or major route changes unless a focused issue explicitly calls for them. Preserve the Mallory Vale route by default.
