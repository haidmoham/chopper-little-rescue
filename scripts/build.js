const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const output = path.join(root, 'public');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'style.css', 'logic.js', 'draw.js', 'game.js', 'mobile-preview.html']) {
  fs.writeFileSync(path.join(output, name), source(name));
}
// A true single-file fallback: no fetch, modules, CDN, image, or font requests.
const offline = source('index.html')
  .replace('<link rel="stylesheet" href="style.css">', `<style>${source('style.css')}</style>`)
  .replace('<script src="logic.js"></script>', `<script>${source('logic.js')}</script>`)
  .replace('<script src="draw.js"></script>', `<script>${source('draw.js')}</script>`)
  .replace('<script src="game.js"></script>', `<script>${source('game.js')}</script>`);
fs.writeFileSync(path.join(output, 'chopper-little-rescue-offline.html'), offline);
console.log('Built public/ and self-contained chopper-little-rescue-offline.html');
