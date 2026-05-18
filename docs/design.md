# Ghost Writer Design Notes

## Pillars

1. Words are tools, weapons, and keys.
2. Investigation should matter more than reflexes.
3. The interface is diegetic: the typewriter is the HUD, spellbook, weapon, and confession booth.
4. Horror comes from uncertainty, not just damage.

## Player fantasy

The player is a murdered journalist whose only remaining body is language. Every command typed into the haunted typewriter is a small act of rebellion against death.

## Core loop

1. Explore a static noir location with the detective.
2. Read environmental clues tied to paper, ink, or wood.
3. Learn command words, names, motives, or contradictions.
4. Encounter a ghost, locked space, or false memory.
5. Type a word or True Name to alter the scene.
6. Pay for mistakes with ribbon health.

## Semantic combat

Combat is a knowledge check under pressure.

- Generic words create tactical effects.
- True Names instantly end encounters.
- Partial or misspelled True Names mutate ghosts.
- Hardboiled Mode removes backspace to make each keystroke feel dangerous.

## Prototype vocabulary

- `BURN`: damages or enrages a ghost.
- `BIND`: traps a ghost briefly.
- `LIE`: creates a false target.
- `OPEN`: forces a passage.
- `FORGET`: erases a witness memory.

## Current prototype ghost

Mallory Vale is the first test ghost. Her name is discovered on a receipt near the player path. This is intentionally obvious; later ghosts should require layered deduction.

## Constraints

This project should stay lightweight while the core feel is being discovered. Favor simple Canvas drawing, plain JavaScript, and small data tables before introducing asset pipelines or libraries.
