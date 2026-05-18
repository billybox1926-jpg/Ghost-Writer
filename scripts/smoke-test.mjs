import { readFileSync, existsSync } from 'node:fs';

const requiredFiles = [
  'index.html',
  'src/main.js',
  'src/styles.css',
  'README.md',
  'docs/design.md',
  'docs/roadmap.md'
];

const requiredSnippets = [
  ['src/main.js', 'commitWord'],
  ['src/main.js', 'MALLORY VALE'],
  ['src/main.js', 'hardboiled'],
  ['index.html', 'canvas'],
  ['README.md', 'Semantic']
];

let failed = false;

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

for (const [file, snippet] of requiredSnippets) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  if (!text.includes(snippet)) {
    console.error(`Missing expected snippet in ${file}: ${snippet}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('Smoke test passed. The haunted typewriter clicks.');
