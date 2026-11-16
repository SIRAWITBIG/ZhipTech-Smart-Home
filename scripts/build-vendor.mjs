import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export async function prepareVendor() {
  const source = path.join(root, 'node_modules', 'three');
  const target = path.join(root, 'web', 'public', 'vendor', 'three');
  const pkg = JSON.parse(await readFile(path.join(source, 'package.json'), 'utf8'));
  const expected = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).dependencies.three;
  if (pkg.version !== expected) throw new Error(`Three.js version mismatch: expected ${expected}, installed ${pkg.version}. Run npm ci.`);
  await mkdir(target, { recursive: true });
  for (const name of ['three.module.js', 'three.core.js']) {
    await writeFile(path.join(target, name), await readFile(path.join(source, 'build', name)));
  }
  let controls = await readFile(path.join(source, 'examples', 'jsm', 'controls', 'OrbitControls.js'), 'utf8');
  if (!controls.includes("from 'three'")) throw new Error('Unexpected OrbitControls module import; inspect vendor update.');
  controls = controls.replace("from 'three'", "from './three.module.js'");
  await writeFile(path.join(target, 'OrbitControls.js'), controls);
  await writeFile(path.join(target, 'LICENSE.txt'), await readFile(path.join(source, 'LICENSE')));
  console.log(`Prepared local Three.js ${pkg.version}; no runtime CDN requests.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareVendor();
