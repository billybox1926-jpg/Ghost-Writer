# Mallory Vale playtest notes

_Date:_ 2026-05-18  
_Scope:_ Current dependency-free Mallory Vale slice in plain HTML/CSS/JS. This pass intentionally did not add new gameplay content, scenes, ghosts, or puzzle systems.

## Harbor of Ink Playtest (Issue #56)

Playtesting for Harbor of Ink is currently pending. This requires a full end-to-end verification of the three-case flow (Mallory Vale → Black Ribbon Press → Harbor of Ink) including mistake paths: early `NORA QUILL`, early `CONFESS`, early `UNTIE/FERRY`, wrong words, Hardboiled Mode, audio, and restart.

## Environment status

- Attempted to pull latest `main` before testing, but this checkout has no configured `origin` remote, so the pull could not be performed.
- Automated Node-based verification was run locally.
- A real interactive browser/manual playtest could not be completed in this environment because no system browser is installed. The dependency-free browser smoke command skipped cleanly with: `Browser smoke skipped: no system browser found; looked for chromium, chromium-browser, google-chrome, firefox.`

## Automated verification results

| Check | Result | Notes |
| --- | --- | --- |
| `npm run smoke` | Passed | Core prototype files and expected hooks are present. npm printed `Unknown env config "http-proxy"`, but the command exited successfully. |
| `npm test` | Passed | Semantic rules, clue journal behavior, input shortcut handling, witness commands, ghost commands, case phases, and helper utilities passed. npm printed `Unknown env config "http-proxy"`, but the command exited successfully. |
| `git diff --check` | Passed | No whitespace errors were reported. |
| `node --check src/main.js` | Passed | Syntax check passed. |
| `node --check src/audio-engine.js` | Passed | Syntax check passed. |
| `node --check scripts/browser-smoke.mjs` | Passed | Syntax check passed. |
| `npm run smoke:browser` | Skipped | No Chromium-family or Firefox browser executable was available in the environment. The skip exited successfully. |

## Expected successful case flow

The current intended Mallory Vale flow, based on static review plus automated semantic/input coverage, is:

1. Start near the typewriter with ribbon at 100%, Eddie Pike guarded, and the objective asking the player to inspect the receipt and witness before Mallory closes in.
2. Move with arrow keys while the typed line is empty.
3. Stand near the rain-blurred receipt and press empty-line `Enter` to inspect it. This records the receipt clue and reveals Mallory Vale's True Name to the run journal.
4. Stand near Eddie Pike and press empty-line `Enter` to inspect him. This records the witness clue and points the player toward `FORGET`, `REMEMBER`, and `ACCUSE`.
5. Type `REMEMBER` near Eddie. Expected result: Eddie becomes truthful, the witness clue is discovered if needed, and the case phase remains in investigation.
6. Type `ACCUSE` near Eddie. Expected result: Eddie becomes cornered and gives up the `OPEN` command.
7. Type `OPEN`. Expected result: the locked alley door opens, the `door-open` journal entry is recorded, and the case advances to confrontation.
8. Type `MALLORY VALE`. Expected result: the True Name is accepted, Mallory is banished, pressure audio stops, the `ending-lead` journal entry is recorded, and the objective points toward Black Ribbon Press.

## Mistake-path checklist

These paths are covered by source review and/or automated tests, but still need a human browser pass for feel, visuals, timing, and accessibility.

| Path | Current expected behavior | Verification status |
| --- | --- | --- |
| Wrong words | Unrecognized committed words are rejected, play the reject cue, and reduce ribbon by the wrong-word amount. | Static review; related ribbon helpers covered by `npm test`. |
| Misspelled True Name | Close misspellings such as `MALLORY VANE` or `MALLORY VALEX` mutate/enrage Mallory and damage ribbon; incomplete prefixes such as `MALLORY V` do not count as misspellings. | Covered by `npm test`; browser feel not verified. |
| Early `OPEN` | `OPEN` before Eddie is cornered is blocked, explains that Eddie still owns the confession, and costs gated-word ribbon damage. | Static review; needs browser confirmation. |
| Early `MALLORY VALE` | The exact True Name before the door opens is blocked, tells the player to `ACCUSE` Eddie then `OPEN` the door, and costs gated-word ribbon damage. | Static review; needs browser confirmation. |
| Out-of-range witness commands | `FORGET`, `REMEMBER`, and `ACCUSE` require proximity to Eddie; out-of-range attempts return blocked feedback and ribbon loss. | Covered by `npm test`; browser positioning/feedback not verified. |
| Hardboiled Mode | Empty-line `F2` toggles Hardboiled Mode. Backspace is blocked while enabled and causes a small ribbon penalty. | Static review; helper input behavior covered by `npm test`; browser feel not verified. |
| Audio toggle button | The page exposes an `Audio: On` button, audio resumes from user gestures, and the audio engine has mute-toggle helper coverage. | Static review plus `npm test`; real Web Audio behavior not verified due missing browser. |
| Restart / clear typed line | `Escape` clears a non-empty typed line; empty-line `Escape` restarts the prototype and clears movement state. | Static review; needs browser confirmation. |
| Movement and inspection after shortcut-key fix | Letter keys remain command input, arrow keys move only on an empty typed line, and empty-line `Enter` remains eligible for contextual inspection. | Covered by `npm test`; real canvas movement/inspection not verified. |
| Post-door ghost commands | `BURN`, `BIND`, and `LIE` are gated until the door opens; after the door opens they provide recoil/enrage, bind, and lure behaviors respectively. | Covered by `npm test`; browser timing/feel not verified. |

## Human browser playtest checklist

Run this checklist in a local environment with a browser installed:

1. Run `npm run dev`.
2. Open `http://localhost:8000/index.html`.
3. Confirm the title card, controls help, canvas, HUD/status updates, and current-run journal are visible/readable.
4. Complete the successful flow: inspect receipt, inspect Eddie, type `REMEMBER`, type `ACCUSE`, type `OPEN`, and banish Mallory with `MALLORY VALE`.
5. Confirm the player can complete the case without reading source code or this report.
6. Try each mistake path listed above and record whether feedback is understandable, recoverable, and visible long enough to read.
7. Toggle Hardboiled Mode with empty-line `F2`; verify Backspace behavior both on and off.
8. Click the audio toggle button; verify Web Audio starts/stops only after user interaction and remains comfortable.
9. Use `Escape` to clear typed text, then empty-line `Escape` to restart; verify state resets cleanly.
10. Move around after typing and clearing letters to ensure shortcut-key behavior does not swallow command letters or movement keys.
11. If Chromium is installed, run `npm run smoke:browser` and confirm whether `artifacts/browser-smoke.png` is generated.

## Recommended follow-up issues

1. **Run a true human/browser Mallory Vale playtest.** The current environment could not provide an installed browser, so visuals, audio, canvas focus, movement feel, and end-to-end player comprehension still need direct validation.
2. **Add a lightweight scripted state-flow check if future scope allows.** The Node tests cover rules and helpers, but the integrated `commitWord`/canvas state path is still only statically reviewed unless a browser is present.
3. **Consider onboarding notes only after human feedback.** The current text appears to explain the `ACCUSE` → `OPEN` → True Name gate, but whether players discover the flow naturally remains unverified.
