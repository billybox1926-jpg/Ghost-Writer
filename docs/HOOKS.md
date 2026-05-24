# Ghost-Writer Local Git Hooks

This repo supports an opt-in local pre-push hook that runs `npm run validate`
before every push. It is not installed automatically — you install it once after
cloning.

## Install the hook

From the repository root:

```bash
node scripts/install-hooks.mjs
```

This creates `.git/hooks/pre-push` that runs `npm run validate` before each push.
If validation fails, the push is blocked.

## Bypass for emergency pushes

```bash
git push --no-verify
```

The `--no-verify` flag skips the hook. Use it only when you intentionally need
to push without validation.

## Requirements

- Node.js must be available in your PATH.
- The hook runs `npm run validate` which calls `node scripts/validate.mjs`.
  Make sure `npm install` has been run at least once.
