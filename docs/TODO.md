# Lightweight Maintenance TODO

This file is intentionally small. It is **not** a second issue tracker.

## Recurring upkeep reminders

- Prune merged/stale local and remote branches during regular repo housekeeping.
- Keep docs in sync with shipped behavior whenever gameplay, controls, or workflows change.
- Run baseline verification before or during PR prep:
  - `npm run smoke`
  - `npm test`
  - `git diff --check`
- Check `npm run smoke:browser` status and record whether it **passed** or **skipped** in the PR notes.
- After true human/browser playtests, append concise outcomes and follow-ups to `docs/playtest-notes.md` (issue #33 tracking remains primary).
