/* Browser-shell contract checks in a small DOM stub; these aren't visual QA. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const R = require('../src/logic.js');

function boot() {
  const make = (id, tagName = 'BUTTON') => ({
    id, tagName, hidden: false, disabled: false, textContent: '', dataset: {}, listeners: {},
    classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, setPointerCapture() {},
    focus() {}, addEventListener(type, listener) { this.listeners[type] = listener; },
    fire(type, fields = {}) { this.listeners[type]?.({ target: this, preventDefault() {}, ...fields }); }
  });
  const ids = ['world', 'stage', 'snack-count', 'home-count', 'friend-dots', 'message', 'overlay', 'welcome', 'pause-card', 'win-card', 'win-first-line', 'pause', 'resume', 'play-again', 'teacher', 'start', 'restart', 'sound', 'workshop', 'animal', 'obstacles', 'snacks-required', 'reset-defaults'];
  const elements = Object.fromEntries(ids.map(id => [id, make(id)]));
  let width = 1000;
  elements.world.getBoundingClientRect = () => ({ width });
  elements.world.getContext = () => ({ setTransform() {} });
  const arrows = ['up', 'left', 'down', 'right'].map(direction => {
    const el = make(direction); el.dataset.direction = direction; return el;
  });
  const document = make('document', 'DOCUMENT');
  document.getElementById = id => elements[id]; document.querySelectorAll = () => arrows;
  const window = make('window', 'WINDOW'); window.RescueRules = R; window.RescueArt = { draw() {} };
  const frames = [];
  const context = { window, document, performance: { now: () => 0 }, requestAnimationFrame: frame => frames.push(frame), console };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/game.js'), 'utf8'), context);
  const frame = now => frames.shift()(now);
  return { window, document, elements, arrows, frame, resize: value => { width = value; window.fire('resize'); }, snapshot: () => window.RescueGame.snapshot() };
}

test('browser shell starts muted and wires start, pause, resume, restart', () => {
  const app = boot(); assert.equal(app.window.RescueGame.soundEnabled(), false);
  assert.equal(app.snapshot().phase, 'ready');
  app.elements.start.fire('click'); assert.equal(app.snapshot().phase, 'playing');
  app.elements.pause.fire('click'); assert.equal(app.snapshot().phase, 'paused');
  app.elements.resume.fire('click'); assert.equal(app.snapshot().phase, 'playing');
  app.elements.restart.fire('click'); assert.equal(app.snapshot().rescued, 0);
});
test('keyboard moves, blur pauses and clears held input, resize keeps logical position', () => {
  const app = boot(); app.elements.start.fire('click'); app.frame(1000);
  app.document.fire('keydown', { key: 'ArrowRight' }); app.frame(1050);
  const movedX = 155 + 11 + 220 / 60;
  assert.ok(Math.abs(app.snapshot().player.x - movedX) < 0.001);
  app.window.fire('blur'); assert.equal(app.snapshot().phase, 'paused');
  assert.equal(Object.keys(app.window.RescueGame.inputSnapshot()).length, 0);
  app.elements.resume.fire('click'); app.frame(1100); assert.ok(Math.abs(app.snapshot().player.x - movedX) < 0.001);
  app.resize(500); assert.equal(app.elements.world.width, 500); assert.equal(app.elements.world.height, 310);
  assert.ok(Math.abs(app.snapshot().player.x - movedX) < 0.001);
});
test('pointer control moves and releases on cancel/lost capture', () => {
  const app = boot(); app.elements.start.fire('click'); app.frame(1000);
  const right = app.arrows.find(arrow => arrow.dataset.direction === 'right');
  right.fire('pointerdown', { pointerId: 1 }); app.frame(1050);
  const movedX = 155 + 11 + 220 / 60;
  assert.ok(Math.abs(app.snapshot().player.x - movedX) < 0.001);
  right.fire('pointercancel'); app.frame(1100); assert.ok(Math.abs(app.snapshot().player.x - movedX) < 0.001);
  right.fire('pointerdown', { pointerId: 2 }); right.fire('lostpointercapture'); app.frame(1150);
  assert.ok(Math.abs(app.snapshot().player.x - (movedX + 220 / 60)) < 0.001);
});
test('workshop submits settings, reset restores originals, editing does not move', () => {
  const app = boot(); app.elements.start.fire('click');
  app.elements.animal.value = 'cat'; app.elements.obstacles.value = 'none'; app.elements['snacks-required'].checked = false;
  app.elements.workshop.fire('submit');
  assert.equal(app.snapshot().config.playerAnimal, 'cat'); assert.equal(app.snapshot().obstacles.length, 0);
  app.elements['reset-defaults'].fire('click'); assert.equal(app.snapshot().config.playerAnimal, 'reindeer');
  app.document.fire('keydown', { key: 'w', target: { tagName: 'SELECT' } });
  assert.equal(Object.keys(app.window.RescueGame.inputSnapshot()).length, 0);
});
test('offline build is one file with no runtime asset references', () => {
  const html = fs.readFileSync(path.join(__dirname, '../public/chopper-little-rescue-offline.html'), 'utf8');
  assert.equal(/<script[^>]+src=/.test(html), false);
  assert.equal(/<link[^>]+rel="stylesheet"/.test(html), false);
  assert.equal(/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(html), false);
  assert.equal(/url\(\s*['"]?https?:/.test(html), false);
  assert.equal(html.includes('window.RescueGame'), true);
});
