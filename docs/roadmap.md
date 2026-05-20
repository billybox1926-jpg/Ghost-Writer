# Ghost Writer Roadmap

This roadmap summarizes the current direction for the prototype.

> **Source of truth:** GitHub issues are the authoritative list for active and scheduled work. This file is a planning snapshot, not a duplicate issue tracker.

## Completed foundation

- Core no-dependency browser prototype built with plain HTML, CSS, JavaScript, and Canvas rendering.
- First playable investigation slice for **Mallory Vale** with typing-led clue gathering, witness memory commands, door gating, semantic ghost commands, ribbon health, pressure, and True Name resolution.
- Generated Web Audio feedback for typing, command outcomes, ribbon damage, pressure, door opening, and Mallory banishment.
- Current-run journal and accessibility/status text support for key clue and state changes.
- Optional browser smoke coverage that skips cleanly when no supported browser is available.
- Lightweight local verification commands for smoke, test, whitespace, syntax, and optional browser-smoke checks.
- Paper, ink, and wood puzzle-interaction seeds documented for future implementation.
- Player/setup, architecture, contributor, maintainer, label, roadmap, TODO, rule-authoring, structured-suggestion, docs-index, and design-guide documentation established and aligned with the current prototype.

## Current active priorities

- **#33** — Run and document a true human/browser playtest of the Mallory Vale slice.
- **#27** — Prototype or design a second ghost encounter with a different clue pattern from Mallory Vale.
- **#29** — Create a second playable investigation scene after Mallory Vale using the existing lightweight systems.

## Near-term planned work

- Use human playtest findings to refine onboarding, clue readability, feedback timing, accessibility text, and browser feel.
- Promote the documented paper/ink/wood interaction seeds into scoped implementation issues only after playtest feedback clarifies what the first slice needs.
- Develop the second ghost and second scene incrementally so the Mallory Vale flow remains stable while the larger structure grows.
- Keep documentation, local smoke checks, and contributor guidance synchronized with shipped behavior as the prototype expands.

## Later / future ideas

- Broader case progression beyond the current slice, including additional witnesses and semantic puzzle variations.
- Expanded encounter archetypes with distinct pressure patterns, weaknesses, and True Name clue structures.
- Richer audiovisual polish that preserves the dependency-free browser identity.
- Optional challenge tuning beyond Hardboiled Mode if future playtests show a real need.
- Longer-form narrative continuity linking multiple investigations without sacrificing quick browser playability.
