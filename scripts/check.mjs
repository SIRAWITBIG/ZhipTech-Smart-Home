import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(filename));
    else if (/\.(m?js)$/.test(entry.name)) files.push(filename);
  }
  return files;
}
let count = 0;
for (const directory of ['scripts', 'web/src', 'web/tests']) {
  for (const filename of await collect(path.join(root, directory)).catch((error) => error.code === 'ENOENT' ? [] : Promise.reject(error))) {
    const result = spawnSync(process.execPath, ['--check', filename], { encoding: 'utf8' });
    if (result.status !== 0) { process.stderr.write(result.stderr || result.error?.message || 'Syntax check failed'); process.exit(1); }
    count++;
  }
}
console.log(`JavaScript syntax check passed: ${count} files. This is not ESLint or a semantic type check.`);
