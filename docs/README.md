# Ghost Writer Documentation Index

This folder holds the project docs for the current Ghost Writer prototype. Use this index to understand where each kind of information belongs before adding or changing documentation.

The issue tracker remains the source of truth for active work. Docs should describe shipped behavior, stable process, or clearly labeled planning context without pretending future ideas are already playable.

## Quick routing guide

- New player or playtester? Start with `guide.md`.
- Contributor changing code or docs? Start with `CONTRIBUTING.md`, then check `architecture.md` if runtime behavior is involved.
- Maintainer reviewing issues, PRs, or repo process? Start with `MAINTAINER_WORKFLOW.md`, `ISSUE_LABELS.md`, and `TODO.md`.
- Designer proposing future systems or cases? Use `design.md`, `rule_authoring.md`, `suggestions.json`, and `roadmap.md` according to the scopes below.
- Recording human test results? Use `playtest-notes.md`.

## Document scopes

### `architecture.md`

Audience: contributors and maintainers changing or reviewing implementation details.

Purpose: map the current runtime structure, module responsibilities, state ownership, and safe extension boundaries.

Belongs here: shipped module behavior, current runtime flow, input/case-flow architecture, helper responsibilities, and implementation constraints that affect code changes.

Does not belong here: speculative future systems, broad design pitches, issue backlogs, or player walkthrough text.

Update when: source modules, runtime ownership, input behavior, case-flow routing, smoke tooling, or helper responsibilities change.

Authority: source-of-truth reference for the current code architecture, while source files remain authoritative for exact implementation.

### `guide.md`

Audience: players, playtesters, and contributors who need to launch and complete the current slice.

Purpose: explain setup, controls, and the current Mallory Vale route without requiring source-code reading.

Belongs here: launch steps, control behavior, player-facing concepts, browser smoke expectations, and the exact current walkthrough.

Does not belong here: maintainer workflow, deep module maps, future case concepts, or internal issue triage rules.

Update when: controls, launch commands, required progression, player-facing feedback, or browser smoke behavior changes.

Authority: source-of-truth player/setup guide for the playable prototype.

### `CONTRIBUTING.md`

Audience: contributors preparing issues, code changes, docs changes, or PRs.

Purpose: explain how to contribute safely while preserving the lightweight Canvas prototype and current gameplay unless a scoped issue says otherwise.

Belongs here: contribution principles, local setup, required checks, PR expectations, protected behavior, and `@codex` workflow guidance.

Does not belong here: maintainer-only branch cleanup policy, full architecture maps, design brainstorming, or live issue lists.

Update when: contribution workflow, required validation commands, protected behavior, or PR expectations change.

Authority: source-of-truth contributor process guide.

### `MAINTAINER_WORKFLOW.md`

Audience: maintainers reviewing issues, Codex tasks, contributor PRs, branch cleanup, and release posture.

Purpose: define maintainer-side hygiene for keeping the prototype stable, scoped, and dependency-light.

Belongs here: triage standards, review checklist, branch cleanup expectations, merge posture, and maintainer interpretation of protected behavior.

Does not belong here: player instructions, contributor onboarding basics already covered in `CONTRIBUTING.md`, or speculative design material.

Update when: maintainer review policy, issue hygiene rules, branch cleanup expectations, or merge requirements change.

Authority: source-of-truth maintainer process guide.

### `ISSUE_LABELS.md`

Audience: maintainers and contributors creating or triaging GitHub issues.

Purpose: document the intended meaning of issue labels so the tracker stays readable.

Belongs here: label definitions, label usage rules, and guidance for combining work-type/supporting labels.

Does not belong here: full issue templates, milestone plans, individual issue status, or automation scripts.

Update when: labels are added, renamed, retired, or given new intended meanings.

Authority: source-of-truth label taxonomy, but GitHub itself is authoritative for which labels currently exist on the repo.

### `roadmap.md`

Audience: maintainers, contributors, and interested playtesters who want the current direction.

Purpose: summarize completed foundation, active priorities, near-term work, and later ideas at a project-planning level.

Belongs here: high-level direction, issue-linked priorities, known next systems, and clearly marked future ideas.

Does not belong here: detailed implementation specs, exact acceptance criteria for active tasks, or shipped-behavior claims that are not true yet.

Update when: major priorities shift, key issues open/close, or planned work graduates into shipped behavior.

Authority: supporting planning snapshot; GitHub issues are authoritative for active scheduled work.

### `TODO.md`

Audience: maintainers and returning contributors who need a fast orientation snapshot.

Purpose: record a compact project map: current status, completed issue/PR references, latest validation notes, release gate, active direction, and repo hygiene reminders.

Belongs here: high-level project state, references to completed work, validation/boot notes, release-candidate reminders, and quick links to current active direction.

Does not belong here: detailed implementation specs, full issue discussions, long design proposals, bug reports that need ownership, or anything that should be tracked as a GitHub issue.

Update when: a major work batch lands, release gate status changes, validation results are updated, or the active direction changes.

Authority: supporting maintainer map only; GitHub issues remain authoritative for active work.

### `design.md`

Audience: designers, maintainers, and contributors discussing Ghost Writer's feel, pillars, and prototype vocabulary.

Purpose: capture design intent for the game's identity, core loop, semantic combat, and noir-horror constraints.

Belongs here: pillars, player fantasy, core loop, vocabulary rationale, encounter design principles, and tone constraints.

Does not belong here: exact current code architecture, player setup steps, issue status, or detailed implementation checklists.

Update when: design pillars, semantic-combat intent, vocabulary direction, or high-level prototype constraints change.

Authority: source-of-truth design intent reference, not a guarantee that every idea is currently implemented.

### `rule_authoring.md`

Audience: contributors proposing or editing structured content, clues, rules, journal text, witness commands, and encounter seeds.

Purpose: provide safe authoring guardrails for expanding content without turning the prototype into a different engine.

Belongs here: content authoring patterns, rule-data guidelines, True Name clue patterns, accessibility/status text guidance, and feature-creep checks.

Does not belong here: shipped runtime architecture, final narrative canon, full scene scripts, or broad roadmap scheduling.

Update when: authoring patterns, content data shapes, rule-writing expectations, or safe expansion boundaries change.

Authority: source-of-truth authoring guidance for content/rule proposals.

### `suggestions.json`

Audience: designers, maintainers, and contributors looking for structured future content seeds.

Purpose: hold lightweight, data-shaped suggestion seeds for paper/ink/wood interactions, ghost encounters, witness commands, and copy guidance.

Belongs here: concise suggestion objects that are clearly future-facing, deterministic, and compatible with the no-dependency prototype.

Does not belong here: shipped-feature claims, large prose design essays, runtime code, or concepts that require new frameworks/inventory systems.

Update when: suggestion seeds are added, retired, renamed, or promoted into implemented gameplay/docs.

Authority: supporting idea/reference data, not source-of-truth shipped behavior.

### `playtest-notes.md`

Audience: maintainers, playtesters, and contributors reviewing validation history and human/browser testing needs.

Purpose: record concise playtest environment notes, verification results, expected flows, mistake paths, and follow-up findings.

Belongs here: dated playtest passes, environment constraints, manual/browser observations, verification tables, and clear follow-up recommendations.

Does not belong here: permanent player guide content, broad roadmap planning, issue triage, or speculative mechanics unrelated to tested behavior.

Update when: a human/browser playtest is run, automated verification results materially change, or a prior playtest note needs correction.

Authority: supporting validation log; issue #33 and future playtest issues remain authoritative for active playtest work.

## Maintenance rules

Keep docs aligned with shipped behavior. When gameplay, controls, architecture, or workflows change, update the relevant doc in the same PR when practical.

Avoid duplicating whole sections between files. Link to the source-of-truth doc and summarize only what the reader needs in context.

Keep future-facing ideas labeled as future-facing. A player or new contributor should never have to guess whether a feature is playable now or only planned.
