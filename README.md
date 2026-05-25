# Ghost Writer

![No framework](https://img.shields.io/badge/framework-none-2f2f46)
![Canvas](https://img.shields.io/badge/rendering-HTML5%20Canvas-5b2f46)
![Dependencies](https://img.shields.io/badge/runtime%20dependencies-none-2f4636)
![Status](https://img.shields.io/badge/status-prototype-704214)

**🔗 [Play in browser](https://billybox1926-jpg.github.io/Ghost-Writer/)**

A horror-noir browser game prototype where a murdered journalist haunts a typewriter and fights ghosts with words.

## What it is

Ghost Writer is a lightweight retro adventure prototype built with plain HTML, CSS, JavaScript, and the Canvas API. There is no framework, no build step, no external asset pipeline, and no runtime dependency stack.

You are the ghost of a murdered 1940s journalist. Your soul is trapped inside a haunted typewriter carried by a hardboiled detective. You investigate paper, ink, wood, witnesses, and ghosts by typing the right words at the right moment.

Semantic combat is the core hook: words like `BURN`, `BIND`, and `LIE` affect ghosts differently, while a correct True Name can end an encounter outright.

## Current prototype

The current build is the Mallory Vale slice: one compact investigation scene designed to prove the typed-command, clue, witness, and True Name loop.

It includes:

- typed command input
- clue inspection
- witness memory commands
- current-run journal entries
- ribbon health and ghost pressure
- Semantic command words
- True Name banishment
- misspelled-name ghost mutation behavior
- generated Web Audio feedback
- accessibility/status text updates

This is a playable prototype slice, not a full game release.

## Play locally

Open `index.html` directly in a browser, or use the included local server:

```bash
npm run dev
```

Then visit:

```text
http://localhost:8000
```

## Basic controls

- Arrow keys move the detective only when the typed line is empty.
- Letter keys and spaces type into the haunted typewriter.
- Enter inspects when the typed line is empty.
- Enter commits a typed word or phrase when text exists.
- Escape clears typed text first, then restarts only if the line is already empty.
- F2 toggles Hardboiled Mode only when the typed line is empty.
- The Audio button toggles generated audio feedback.

## Mallory Vale route

The intended current route is:

1. Inspect the receipt.
2. Inspect Eddie Pike.
3. Type `REMEMBER`.
4. Type `ACCUSE`.
5. Type `OPEN`.
6. Type `MALLORY VALE`.

## Verification

For a quick local check:

```bash
npm run smoke
npm test
git diff --check
```

The optional browser smoke check is environment-dependent and skips cleanly when no supported browser exists:

```bash
npm run smoke:browser
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## Documentation

- Player/setup guide: `docs/guide.md`
- Documentation index and project map: `docs/README.md`
- Contributor guide: `docs/CONTRIBUTING.md`

## License

Ghost Writer is released under the MIT License. See `LICENSE.md` for details.