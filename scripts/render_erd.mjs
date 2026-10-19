#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const input = path.resolve(
  process.argv[2] || 'docs/architecture/schema.mmd'
);
const output = path.join(root, 'docs/architecture/erd.svg');

if (!fs.existsSync(input)) {
  console.error(`SYNTAX_ERROR: File not found: ${input}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(output), { recursive: true });

const mmdc = process.env.MERMAID_CLI || path.join(root, 'node_modules/.bin/mmdc');

const result = spawnSync(
  mmdc,
  ['-i', input, '-o', output, '-b', 'transparent'],
  { cwd: root, encoding: 'utf8' }
);

if (result.error || result.status !== 0) {
  console.error(
    'SYNTAX_ERROR:\n' +
    (result.stderr || result.stdout ||
      result.error?.message || 'Unknown compilation error')
  );
  process.exit(1);
}

console.log('SUCCESS');
console.log(output);
process.exit(0);
