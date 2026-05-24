#!/usr/bin/env node
// scripts/install-hooks.mjs
// Installs a local pre-push git hook that runs `npm run validate` before push.
// Safe to run multiple times — overwrites any existing pre-push hook.

import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const hooksDir = join(repoRoot, '.git', 'hooks');
const hookPath = join(hooksDir, 'pre-push');

const hookContent = `#!/bin/sh
# Ghost-Writer pre-push hook
# Runs npm run validate before push. Blocks push on failure.
# Bypass with: git push --no-verify

cd "$(git rev-parse --show-toplevel)"

if ! command -v npm > /dev/null 2>&1; then
  echo "[pre-push] npm not found — skipping validation."
  exit 0
fi

echo "[pre-push] Running npm run validate..."
npm run validate
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "[pre-push] Validation failed (exit $EXIT_CODE). Push blocked."
  echo "[pre-push] Use --no-verify to bypass."
  exit $EXIT_CODE
fi

echo "[pre-push] Validation passed."
exit 0
`;

if (!existsSync(hooksDir)) {
  mkdirSync(hooksDir, { recursive: true });
}

writeFileSync(hookPath, hookContent, 'utf-8');
chmodSync(hookPath, 0o755);

console.log(`[install-hooks] Pre-push hook installed at ${hookPath}`);
console.log('[install-hooks] Run `git push --no-verify` to bypass if needed.');
