# Contributing to Ghost Writer

Ghost Writer is intentionally small and dependency-light. This guide explains how to contribute safely without changing shipped gameplay behavior unless your issue explicitly requires it.

## Project principles

- **No frameworks.** The prototype is plain HTML/CSS/JavaScript plus Canvas rendering.
- **No heavy dependencies.** Keep automation and tooling lightweight and fast.
- **Readability over cleverness.** `src/main.js` should remain understandable for contributors reviewing gameplay flow.
- **Prefer pure helpers.** Add pure functions and targeted tests when practical.
- **Avoid per-frame allocation churn.** Keep hot-loop code allocation-light.

## Local setup

1. Clone the repository.
2. Ensure a current Node.js runtime is available.
3. Install dependencies:

```bash
npm install
```

4. Run the local prototype server:

```bash
npm run dev
```

5. Open the local URL printed by the dev server in your browser.

## Required verification before opening a PR

Run all required checks:

```bash
npm run smoke
npm test
git diff --check
```

Run syntax checks relevant to core runtime and smoke tooling:

```bash
node --check src/main.js
node --check src/audio-engine.js
node --check scripts/browser-smoke.mjs
```

## Optional browser smoke behavior

Run the optional browser smoke script when possible:

```bash
npm run smoke:browser
```

Expected outcomes:

- **Pass:** when a supported Chromium-family browser is installed.
- **Clean skip:** when no supported browser executable is available in the environment.

Both outcomes are acceptable as long as the command exits successfully and your PR notes whether it passed or skipped.

## Protected current gameplay behavior

Unless your issue is explicitly about gameplay changes, preserve the current input and case flow behavior:

- Current keyboard/input model and command entry rules.
- The existing Mallory Vale progression and outcome flow.

If your task is docs-only, avoid gameplay files entirely.

## Issue-driven workflow (source of truth)

Use GitHub issues as the source of truth for planned work:

1. Pick one focused issue.
2. Confirm scope, constraints, and acceptance criteria in that issue.
3. Implement only what the issue asks.
4. Run required validation commands.
5. Open a PR and link the issue.
6. Keep discussion and updates on the issue/PR thread.
7. Close the issue with a short summary after merge.

## `@codex` issue comment workflow

When using `@codex` for implementation support:

1. Comment on **one focused issue** with concrete scope and constraints.
2. Wait for the Codex summary/plan.
3. Open the Codex task.
4. Click **Create PR** when Codex finishes.
5. Review the generated PR carefully before merge.
6. Close the issue with a summary of what shipped.

## PR review expectations

- Keep PRs scoped to the issue.
- Describe what changed and what was intentionally not changed.
- Include required validation command results.
- Call out whether `npm run smoke:browser` passed or skipped.
- Request follow-up issues instead of broadening scope mid-PR.
