import { mkdir, readFile, readdir, writeFile, unlink, lstat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareVendor } from './build-vendor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'web');
const lite = process.argv.includes('--lite');
const outputName = lite ? 'data' : 'dist';
const data = path.join(root, outputName);
const manifestPath = path.join(root, 'tmp', lite ? 'web-build-manifest.json' : 'web-production-manifest.json');
// Reserve room in the ESP32 filesystem for settings/assets and filesystem overhead.
const budget = lite ? 1_250_000 : 12_000_000;
const compressible = /\.(html|css|js|json|svg)$/i;
const entries = new Map();
function contained(candidate) {
  const relative = path.relative(data, candidate);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}
async function noSymlinks(target) {
  let current = target;
  while (current !== root) {
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing symlink in output path: ${current}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    current = path.dirname(current);
    if (!current.startsWith(root)) throw new Error('Output path escaped project root');
  }
}
async function collect(directory, destination = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    const target = path.posix.join(destination, entry.name);
    if (lite && (target === 'vendor/three' || /^src\/house-(engine|model)\.js$/.test(target))) continue;
    if (entry.isSymbolicLink()) throw new Error(`Build does not follow symlinks: ${source}`);
    if (entry.isDirectory()) await collect(source, target);
    else if (entry.isFile()) {
      if (entries.has(target)) throw new Error(`Duplicate build asset: ${target}`);
      entries.set(target, await readFile(source));
    }
  }
}
if (!lite) await prepareVendor();
let index = await readFile(path.join(web, 'index.html'), 'utf8');
if (lite) index = index.replace('<head>', '<head>\n  <script>window.HUB_LITE = true;</script>');
entries.set('index.html', Buffer.from(index));
await collect(path.join(web, 'src'), 'src');
try { await collect(path.join(web, 'public')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const [name, bytes] of [...entries]) if (compressible.test(name)) entries.set(`${name}.gz`, gzipSync(bytes, { level: 9, mtime: 0 }));
const total = [...entries.values()].reduce((sum, bytes) => sum + bytes.length, 0);
if (total > budget) throw new Error(`${lite ? 'LittleFS' : 'Production web'} budget exceeded: ${total} bytes > ${budget} bytes (includes raw + gzip)`);
let previous = [];
try {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.files) || !manifest.files.every((item) => typeof item === 'string' && contained(path.resolve(data, item)))) throw new Error('Invalid previous build manifest');
  previous = manifest.files;
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await noSymlinks(data);
await mkdir(data, { recursive: true });
// Delete only files listed by our own previous build, never recurse through data/.
for (const name of previous.filter((item) => !entries.has(item))) {
  const destination = path.resolve(data, name);
  if (!contained(destination)) throw new Error('Unsafe previous build path');
  await noSymlinks(destination);
  await unlink(destination).catch((error) => { if (error.code !== 'ENOENT') throw error; });
}
for (const [name, bytes] of entries) {
  const destination = path.resolve(data, name);
  if (!contained(destination)) throw new Error('Unsafe build path');
  await noSymlinks(destination);
  // An unknown existing file might be user-owned: stop rather than overwrite it.
  const exists = await lstat(destination).then(() => true).catch((error) => { if (error.code === 'ENOENT') return false; throw error; });
  if (exists && !previous.includes(name)) throw new Error(`Untracked file at build destination; preserve or move it first: ${destination}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}
await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify({ files: [...entries.keys()], totalBytes: total }, null, 2));
console.log(`Built ${lite ? 'ESP32 Lite' : '3D web'}: ${entries.size} assets into ${outputName}/: ${total.toLocaleString('en-US')} bytes / ${budget.toLocaleString('en-US')} byte budget (raw + gzip).`);
console.log('Build only. No firmware or filesystem upload was performed.');
