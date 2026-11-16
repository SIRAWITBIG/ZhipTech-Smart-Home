import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, stat, realpath } from 'node:fs/promises';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const production = process.argv.includes('--production');
const webRoot = path.join(projectRoot, production ? 'dist' : 'web');
const port = Number(process.env.PORT || 5173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be 1024–65535');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
const publicRoot = production ? webRoot : path.join(webRoot, 'public');

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

const server = http.createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.startsWith('/api/')) {
      response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: { code: 'NOT_CONNECTED', message: 'Development server has no ESP32. Use Simulation or an ESP32 API address.' } }));
      return;
    }
    if (pathname.includes('\0')) throw new Error('Invalid path');
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    let filename = path.resolve(webRoot, relative);
    if (!isInside(webRoot, filename)) throw new Error('Invalid path');
    try {
      if (!(await stat(filename)).isFile()) throw new Error('Not a file');
    } catch {
      filename = path.resolve(publicRoot, relative);
      if (!isInside(publicRoot, filename) || !(await stat(filename)).isFile()) throw new Error('Not found');
    }
    if (!isInside(webRoot, await realpath(filename))) throw new Error('Invalid symlink target');
    const content = await readFile(filename);
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename).toLowerCase()] || 'application/octet-stream', 'Content-Length': content.length });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`ZhipTech - Smart Home: http://127.0.0.1:${port}`);
  console.log('Serving local assets on loopback. Simulation runs locally; no cloud or ESP32 proxy.');
});
server.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
