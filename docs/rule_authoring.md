# Ghost Writer Rule Authoring Guide

This guide is for contributors who want to expand authored content safely **without** rewriting the current prototype into a new engine.

Current baseline:
- one playable Mallory Vale case flow
- plain Canvas + vanilla JS
- no gameplay dependencies

Treat this file as a checklist for adding or revising structured content while preserving the current experience.

## Scope and non-goals

Use this guide when proposing documentation/data changes around:
- clues and journal entries
- witness command ideas
- semantic command rules
- encounter concepts and authored prompts

Do **not** use this guide as permission to add:
- new gameplay systems or runtime wiring
- packages, build tools, or workflow automation
- unreviewed scene overhauls

## 1) Clue definitions

When adding a clue definition:
- Keep clue names concrete and player-facing.
- Store one primary gameplay purpose per clue (avoid "kitchen sink" clues).
- Include the minimum data needed for journal display and command logic.
- Prefer additive entries over changing existing clue IDs.

Recommended pattern:
- stable clue key/ID
- concise title
- short noir description
- optional tags for future semantic matching

## 2) Journal entries

Journal text should help the player make a next decision, not retell the entire scene.

Guidelines:
- Keep each entry short (1-3 lines).
- Lead with actionable detail first.
- Use tense/person consistently inside a case.
- Preserve already-learned facts; append rather than rewrite unless fixing errors.

## 3) Witness command ideas

Witness command additions should stay explainable from on-screen context.

When drafting ideas:
- Start from existing verbs (`FORGET`, `REMEMBER`, `ACCUSE`) and branch carefully.
- Define preconditions (range, prior clues, witness state).
- Define outcome and failure feedback in plain language.
- Avoid adding command verbs that overlap heavily with existing ones.

## 4) Semantic command rules

Semantic command rules should remain lightweight and deterministic.

Design rules:
- Prefer explicit word lists and clear normalization rules.
- Keep synonym sets small and intentional.
- Document tie-break behavior when multiple rules could match.
- Fail closed: unknown input should produce readable feedback, not silent success.

## 5) True Name clue patterns

True Name content should preserve tension and avoid accidental giveaways.

Pattern guidance:
- Split name hints across multiple clue sources.
- Mix direct and indirect evidence (documents, witness lines, environmental hints).
- Ensure near-miss names can be recognized as mistakes without guessing randomness.
- Keep the final True Name path traceable in hindsight.

## 6) Ghost encounter concepts

Encounter concepts can expand mood and pressure, but should not imply shipped systems.

For each concept seed, document:
- trigger context
- player-readable warning or status text
- intended pressure change
- fail/resolve outcome summary

Keep concepts data-first and portable so runtime adoption can happen later.

## 7) Paper / ink / wood interaction ideas

Use paper/ink/wood themes to deepen investigation logic, not for crafting subsystems.

Good interaction seeds:
- paper reveals or conceals clue fragments
- ink marks encode or distort witness memory prompts
- wood surfaces retain traces, symbols, or damage clues

Avoid speculative mechanics that require inventory frameworks or physics systems.

## 8) Case-flow additions

Case-flow edits should preserve readability as a sequence of gates and reveals.

Checklist:
- Define entry condition for each step.
- Define expected player action.
- Define immediate feedback.
- Define resulting unlocked state.

Keep branches narrow unless there is a tested narrative reason for added complexity.

## 9) Accessibility and status text

Status and feedback text are gameplay-critical for readability.

When authoring text:
- Prefer short clauses over long sentences.
- Avoid ambiguous pronouns in critical warnings.
- Keep command failure messages specific.
- Ensure important state changes are visible in text, not audio-only.

## 10) Tests for pure helper logic

If structured data or helper rules change, add or update tests for pure logic where possible.

Focus on:
- normalization helpers
- command matching helpers
- clue/journal mapping helpers
- deterministic encounter selection helpers

Avoid tests that require new runtime systems. Keep test scope small and fast.

## 11) Noir copy: concise and readable

Noir tone should support gameplay comprehension.

Copy rules:
- one strong image per line beats dense metaphor stacks
- keep UI-critical lines plain first, flavorful second
- avoid all-caps except deliberate emphasis already established in UX
- trim filler adjectives that hide key clues

## 12) Avoiding feature creep

Before adding new structured suggestions, ask:
1. Does this clarify the current case flow?
2. Can this be represented as data/docs only right now?
3. Does this preserve no-dependency Canvas identity?

If any answer is no, defer it to roadmap discussion.

## 13) Preserve Mallory Vale flow by default

Unless a task explicitly requests redesign, preserve the current Mallory Vale progression and intent.

Safe changes:
- clarify existing clues
- tighten journal phrasing
- add future-facing suggestion seeds in docs/data

Unsafe changes (without explicit approval):
- replacing current command sequence
- changing gate order that affects the banish path
- reframing the case into a different narrative route
