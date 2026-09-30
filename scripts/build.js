const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'src', name), 'utf8');
const output = path.join(root, 'public');
fs.mkdirSync(output, { recursive: true });
require('esbuild').buildSync({ entryPoints: [path.join(root, 'src/scene.js')], bundle: true, minify: true, format: 'iife', target: 'es2020', outfile: path.join(output, 'scene.js'), legalComments: 'inline' });
for (const name of ['index.html', 'style.css', 'logic.js', 'draw.js', 'game.js', 'mobile-preview.html']) {
  fs.writeFileSync(path.join(output, name), source(name));
}
// A true single-file fallback: no fetch, modules, CDN, image, or font requests.
const offline = source('index.html')
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${source('style.css')}</style>`)
  .replace('<script src="logic.js"></script>', () => `<script>${source('logic.js')}</script>`)
  .replace('<script src="draw.js"></script>', () => `<script>${source('draw.js')}</script>`)
  .replace('<script src="scene.js"></script>', () => `<script>${fs.readFileSync(path.join(output, 'scene.js'), 'utf8')}</script>`)
  .replace('<script src="game.js"></script>', () => `<script>${source('game.js')}</script>`);
fs.writeFileSync(path.join(output, 'chopper-little-rescue-offline.html'), offline);
fs.copyFileSync(path.join(root, 'src/classroom-backup.html'), path.join(output, 'classroom-backup.html'));
console.log('Built public/ and self-contained chopper-little-rescue-offline.html');
