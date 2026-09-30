/* A dependency-free local server. Run npm run build before npm run dev. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const PUBLIC = path.resolve(__dirname, '../public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function resolvePublicPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  const requested = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const file = path.resolve(PUBLIC, `.${requested}`);
  if (!file.startsWith(`${PUBLIC}${path.sep}`)) throw new Error('Outside public directory');
  return file;
}

if (require.main === module) {
  const server = http.createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    try {
      const file = resolvePublicPath(request.url);
      const bytes = await fs.readFile(file);
      response.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Not found');
    }
  });
  server.listen(4173, '127.0.0.1', () => console.log('Little Rescue: http://localhost:4173 · Ctrl+C to stop'));
  server.on('error', error => { console.error(`Could not start the local preview: ${error.message}`); process.exitCode = 1; });
}
module.exports = { resolvePublicPath };
