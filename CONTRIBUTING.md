# Contributing to Ghost Writer

Ghost Writer is a horror-noir browser game prototype built with plain HTML, CSS, JavaScript, and the Canvas API. No frameworks, no build step, no external asset pipeline.

**Full contributor guide:** [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Quick start

```bash
npm install
npm run dev
```

Run validation before pushing:

```bash
npm run smoke
npm test
git diff --check
```

## Project principles

- No frameworks. Plain HTML/CSS/JS plus Canvas rendering.
- No heavy dependencies. Keep tooling lightweight.
- Readability over cleverness in `src/main.js`.
- Semantic combat (word-based) is the core hook.

## Pull request checklist

- Run `npm run smoke`, `npm test`, and `git diff --check`.
- Keep PRs scoped to one issue.
- Preserve current gameplay behavior unless your issue explicitly changes it.
- Read [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for the `@codex` workflow and browser smoke expectations.
