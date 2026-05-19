# Maintainer Workflow

This document defines the maintainer-side process for reviewing and integrating Ghost Writer changes while keeping the prototype stable and lightweight.

## Maintainer goals

- Keep issue tracker scope accurate and current.
- Preserve shipped gameplay behavior unless a gameplay issue explicitly targets a change.
- Keep the repository dependency-light and framework-free.
- Prefer small, reviewable PRs with explicit verification evidence.

## Triage and issue hygiene

- Treat GitHub issues as the source of truth for planned work.
- Keep issue descriptions concrete: scope, non-goals, validation, acceptance criteria.
- Split large requests into focused follow-up issues.
- Use labels from `docs/ISSUE_LABELS.md` consistently.

## Reviewing contributor and Codex PRs

For every PR, confirm:

1. Scope matches linked issue.
2. Required checks were run and reported:
   - `npm run smoke`
   - `npm test`
   - `git diff --check`
3. Relevant syntax checks were run and reported:
   - `node --check src/main.js`
   - `node --check src/audio-engine.js`
   - `node --check scripts/browser-smoke.mjs`
4. `npm run smoke:browser` result is reported as **passed** or **skipped**.
5. No unapproved dependency/framework creep.
6. No accidental gameplay-flow changes for docs/maintenance-only issues.

## Protected behavior for non-gameplay issues

For docs, CI, maintenance, and similar issues, reviewers should reject or request changes if PRs unintentionally alter:

- Input model behavior.
- The current Mallory Vale narrative/progression flow.
- Core runtime gameplay semantics not called for by the issue.

## Branch and PR management

- Prefer issue-specific branches and short-lived PRs.
- Merge only after required checks and review comments are resolved.
- After merge, ensure the linked issue is closed with a summary.

## Branch cleanup expectations

Codex-assisted and contributor branches can accumulate quickly. Maintain branch hygiene:

- Delete merged GitHub branches promptly.
- Prune stale local branches regularly.
- Close superseded or abandoned PRs with a short reason.
- Keep active PR count manageable so reviewers can prioritize critical fixes.

## Safe release posture for a prototype

- Do not document speculative systems as already shipped.
- Keep documentation aligned to current behavior, not roadmap intent.
- If behavior changes, require corresponding docs/test updates in the same PR where practical.
