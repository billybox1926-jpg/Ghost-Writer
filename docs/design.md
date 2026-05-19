# Ghost Writer Design Guide

Ghost Writer is a lightweight horror-noir adventure prototype about a murdered journalist whose remaining voice lives inside a haunted typewriter. The project is intentionally small: plain HTML, CSS, JavaScript, Canvas rendering, generated browser audio, and no external gameplay dependencies.

This document defines what the prototype is trying to be, what it is not trying to be, and how future scenes should grow without losing the current semantic-combat identity.

## Current shipped prototype vs. future direction

The current playable slice is the Mallory Vale investigation. It includes clue inspection, witness memory commands, a locked door gate, semantic ghost commands, ribbon health, ghost pressure, True Name resolution, generated audio cues, and accessibility/status text.

Future sections in this document describe design direction only. They should not be read as already shipped unless the feature is also present in the current code and player guide.

## Design pillars

### Words are tools, weapons, and keys

The player acts by typing. A word can reveal a memory, force a door, wound a ghost, lure a threat, or finish an encounter. The design should keep language central instead of turning typed commands into decorative hotkeys.

### Investigation matters more than reflexes

Ghost Writer should reward reading the scene, noticing contradictions, and understanding names. Pressure exists, but the ideal win feels earned through deduction rather than twitch skill.

### The typewriter is the interface

The typewriter is not just a text box. It is the player's body, HUD, weapon, spellbook, and confession booth. Typed input should feel diegetic whenever practical.

### Horror comes from uncertainty

Damage matters, but dread should come from not knowing which word is safe, whether a name is complete, or what the witness is hiding. The game should avoid loud clutter when a single uneasy line will do.

### Lightweight craft over systems bloat

The project should feel handcrafted and portable. Prefer small data tables, plain functions, and readable Canvas drawing over engines, asset pipelines, or generalized frameworks.

## Non-goals

Ghost Writer is not trying to become a physics sandbox, inventory-heavy RPG, action combat game, visual novel engine, or framework showcase.

Avoid adding systems that require large dependencies, online services, complex build tooling, or asset-heavy workflows. A future scene should deepen the word-and-clue loop, not bury it under machinery.

## Player fantasy

The player is a murdered journalist whose only remaining body is language. Each command typed into the haunted typewriter is a small act of resistance against death, silence, and official lies.

The detective carries the typewriter through the scene, but the player is the ghost inside it. That split creates the fantasy: you cannot point a gun, pick a lock by hand, or speak normally. You can only haunt the page until the truth moves.

## Core loop

The intended loop is simple:

1. Explore a compact noir location with the detective.
2. Inspect environmental clues tied to paper, ink, wood, people, or thresholds.
3. Learn command words, names, motives, or contradictions.
4. Use typed words to alter a witness, object, locked space, or ghost state.
5. Face pressure from a ghost or failing situation.
6. Commit a decisive word or True Name.
7. Record the result in the journal and move toward the next mystery.

Each future scene should be understandable as a chain of readable gates and reveals. Branching is welcome only when it sharpens the mystery without making the command grammar feel random.

## Semantic combat identity

Semantic combat is a knowledge check under pressure. The player is not choosing from a visible ability bar; they are remembering, deducing, and risking typed language.

Generic command words should create tactical effects. In the current prototype, `BURN`, `BIND`, and `LIE` become meaningful once Mallory's door is open. They are useful but imperfect: they buy time, redirect danger, or provoke consequences.

True Names are different. A correct True Name should feel like finding the one nail that holds the coffin shut. It ends the encounter because the player understood the case, not because they reduced a health bar to zero.

Unknown words should fail clearly. Failure can cost ribbon or increase pressure, but the feedback should teach the player what kind of mistake happened.

## True Name rules and mutation philosophy

A True Name is the highest-stakes answer in an encounter. It should be traceable from clues and satisfying in hindsight.

For the current Mallory Vale slice, the True Name is intentionally direct: the player can discover `MALLORY VALE` from an early receipt and later use it after the confrontation gate opens. This teaches the grammar before later cases become more layered.

Near-miss names are dangerous. A misspelled or partial-but-too-close attempt can mutate or enrage a ghost because the player has touched the right wound incorrectly. This should feel fair: the game may punish sloppy certainty, but it should not punish honest exploration with opaque randomness.

Future True Name designs should:

- split evidence across multiple readable clues
- include at least one grounding clue that confirms spelling
- make near-misses feel legible after the fact
- avoid requiring outside knowledge
- avoid names that are hard to type for the wrong reasons

## Ribbon health and pressure

Ribbon health is the player's survivability budget. It represents fraying control over the typewriter and the ghost's ability to keep influencing the living world.

Pressure is the encounter's breath on the player's neck. It should rise from proximity, failed commands, misspellings, or ghost state changes. Pressure should be visible through text and motion first, with audio used as reinforcement rather than the only signal.

Ribbon loss should usually teach. A wrong word, early gated command, out-of-range witness command, or misspelled True Name should produce specific feedback. The player should understand why the ribbon frayed and what to try reading next.

Hard punishment without explanation is off-tone. The game can be cruel, but it should be a fair kind of haunted.

## Clue and journal design

Clues are not collectibles for completionism. They are evidence that changes what the player understands and what commands feel possible.

A good clue does at least one of these things:

- reveals a name, phrase, contradiction, or command
- changes the meaning of a witness statement
- explains why a typed word should work
- warns about a danger or failure state
- gives the player confidence about spelling or sequence

Journal entries should be concise and actionable. The journal should help the player make the next decision, not retell the whole scene in heavy prose.

Future clue writing should keep one primary gameplay purpose per clue. Flavor is welcome, but the clue's practical meaning should not be buried six metaphors deep.

## Paper, ink, and wood interaction philosophy

Paper, ink, and wood are the first material language of Ghost Writer. They should deepen investigation without becoming inventory crafting.

Paper can hide names, receipts, letters, forms, obituaries, redactions, or lies made official.

Ink can bleed, overwrite, expose pressure, distort memories, or mark a word as dangerous.

Wood can hold thresholds, scars, doors, desks, floorboards, coffins, typewriter cases, and old impact marks.

The design goal is tactile clue logic: the world remembers what people tried to erase. Future interactions should be deterministic, readable, and small enough to explain through inspection/status text.

Avoid turning these materials into generic resource systems. The player should not be collecting three inks to craft a key. The player should be reading stains like testimony.

## Witness command design

Witnesses are living locks. They do not simply hand over exposition; they resist, misremember, bargain, and break.

The current prototype uses Eddie Pike to teach this idea. When the player is close enough, `FORGET`, `REMEMBER`, and `ACCUSE` can shift his state. The important path is `REMEMBER`, then `ACCUSE`, which eventually makes `OPEN` meaningful.

Witness commands should have clear preconditions:

- the detective is close enough
- the witness has a current memory state
- the player has enough clue context to understand the command
- the result changes the case rather than just printing flavor

Future witnesses can be subtler than Eddie, but early feedback should stay readable. A player should be able to tell whether a command failed because of range, state, missing evidence, or wrong wording.

## Prototype vocabulary

Current vocabulary includes:

- `BURN`: damages or enrages a ghost after the confrontation gate opens.
- `BIND`: briefly restrains a ghost after the confrontation gate opens.
- `LIE`: creates a false target after the confrontation gate opens.
- `OPEN`: forces the locked alley passage after Eddie is cornered.
- `FORGET`: pushes Eddie toward a false or erased memory state.
- `REMEMBER`: restores Eddie toward a more truthful memory state.
- `ACCUSE`: pressures Eddie into revealing the practical clue needed to continue.
- `MALLORY VALE`: resolves the current encounter when used at the correct point.

New vocabulary should earn its place. Prefer words with strong verbs, clear tone, and distinct effects. Avoid synonyms that do the same job unless the design intentionally supports multiple accepted words.

## Hardboiled Mode purpose

Hardboiled Mode removes Backspace as a safety net. It turns typing into commitment.

The mode should feel like a challenge layer, not the default way to understand the game. It works best after the player already knows the command grammar and wants more pressure.

Future design should preserve the input rule: F2 toggles Hardboiled Mode only when the typed line is empty, and letter keys should never become shortcuts that interfere with typing.

## Audio and visual tone goals

The visual target is a haunted 16-bit noir arcade cabinet: readable silhouettes, hard shadows, grimy atmosphere, and strong feedback without heavy assets.

Audio should stay subtle and generated in-browser. Typewriter taps, command outcomes, ribbon damage, pressure hum, and banishment cues should support the player's understanding of state changes.

Audio must not be required for play. Every important change should also be visible through text, HUD state, animation, or status updates.

The tone should be sharp rather than wordy. One strong image beats a paragraph of fog.

## Accessibility and readability expectations

Accessibility is part of the design, not polish to bolt on later.

Important state changes should be reflected in synchronized visible text and screen-reader status text. Input behavior should remain predictable: arrows move only on an empty line, letters type, Enter inspects or commits depending on the typed line, Escape clears before restart, and audio uses the on-screen button.

Readable feedback matters more than clever phrasing. The player should know:

- what changed
- whether a command worked
- why a command failed when possible
- what immediate danger increased
- what clue or action might matter next

Noir style should never obscure critical instructions.

## Current Mallory Vale case design

The Mallory Vale slice is the teaching case. It is intentionally compact and direct.

The intended current route is:

1. Inspect the receipt.
2. Inspect Eddie Pike.
3. Type `REMEMBER`.
4. Type `ACCUSE`.
5. Type `OPEN`.
6. Type `MALLORY VALE`.

This flow teaches the core grammar: inspect evidence, alter witness memory, unlock a threshold, then use a True Name. It also demonstrates that some words are gated by case state. `OPEN` is not magic everywhere; it matters when the confession has made the door meaningful.

Mallory's identity is easier to discover than later ghosts should be. Her job is to teach the rules under pressure, not to be the final exam.

Do not break or bypass this progression unless a future issue explicitly redesigns the first case.

## Boundaries for future scenes and ghosts

Future scenes should expand depth before breadth. A second investigation should add stronger clue logic, more interesting paper/ink/wood interactions, and a distinct ghost pressure pattern without requiring a new engine.

Good future additions include:

- layered True Name deduction
- one or two new command verbs with distinct effects
- a witness whose state changes the meaning of a clue
- environmental material clues that alter what the player believes
- ghost behavior that pressures typing without becoming action combat

Risky additions include:

- large inventories
- crafting systems
- random puzzle solutions
- hidden timers with unclear feedback
- dialogue trees that replace typed command identity
- asset-heavy scenes that make the project hard to run or maintain

Each new ghost should have a readable wound: a reason certain words work, a reason their name matters, and a mistake path that feels like the player touched the truth incorrectly.

## Writing style for in-game text

Keep lines concise, atmospheric, and useful.

Lead with the actionable truth, then add mood. For example, a status line should tell the player the door is still locked before describing how the brass keyhole sweats.

Avoid exposition dumps. Let documents, witness reactions, and command feedback carry the mystery in small cuts.

## Design maintenance

Update this document when the design intent changes, when a shipped system changes the core loop, or when a future scene establishes a reusable pattern.

Do not use this file as an issue tracker. Active work belongs in GitHub issues. This guide should explain the shape of the haunted house, not list every nail still needed in the floorboards.
