const { test } = require('node:test');
const assert = require('node:assert/strict');
const R = require('../src/logic.js');
const play = options => { const s = R.createState(options); R.start(s); return s; };
const tick = (s, input = {}, count = 1) => { for (let i = 0; i < count; i++) R.update(s, input, 1 / 60); };

test('starts safe, quiet, and deterministic without modifying CONFIG', () => {
  const a = R.createState(), b = R.createState();
  assert.deepEqual(a, b);
  assert.equal(a.phase, 'ready'); assert.equal(a.pocket, 0); assert.equal(a.rescued, 0);
  a.friends[0].x = 99;
  assert.equal(R.CONFIG.friends[0].x, 275);
});
test('ready and paused rounds do not move; resume does', () => {
  const s = R.createState(); const x = s.player.x;
  tick(s, { right: true }, 60); assert.equal(s.player.x, x);
  R.start(s); R.togglePause(s); tick(s, { right: true }, 60); assert.equal(s.player.x, x);
  R.togglePause(s); tick(s, { right: true }, 10); assert.ok(s.player.x > x);
});
test('movement is normalized diagonally and opposing keys cancel', () => {
  const straight = play({ obstacleStyle: 'none' }), diagonal = play({ obstacleStyle: 'none' });
  const origin = { ...straight.player };
  tick(straight, { right: true }, 10); tick(diagonal, { right: true, up: true }, 10);
  assert.ok(Math.abs(R.distance(straight.player, origin) - R.distance(diagonal.player, origin)) < 0.0001);
  const x = straight.player.x; tick(straight, { left: true, right: true }); assert.equal(straight.player.x, x);
});
test('slow frames are capped and the island boundary is solid', () => {
  const s = play({ obstacleStyle: 'none' }); const x = s.player.x;
  R.update(s, { right: true }, 99); assert.equal(s.player.x - x, 11);
  tick(s, { left: true }, 500); assert.equal(s.player.x, 37);
  tick(s, { up: true }, 500); assert.equal(s.player.y, 48);
});
test('pond and log collisions stop entry but permit sliding', () => {
  const s = play(); s.player = { x: 400, y: 293, facing: 1 };
  tick(s, { right: true }, 120); assert.ok(s.player.x <= 417.001);
  const x = s.player.x; tick(s, { right: true, down: true }, 60); assert.ok(s.player.y > 293); assert.ok(s.player.x >= x);
  const log = R.makeObstacles('logs')[0];
  assert.equal(R.collides({ x: log.x, y: log.y }, 23, log), true);
  assert.equal(R.collides({ x: log.x, y: log.y + 60 }, 23, log), false);
});
test('snack can only be collected once', () => {
  const s = play(); Object.assign(s.player, s.snacks[0]); tick(s);
  assert.equal(s.pocket, 1); assert.equal(s.snacks[0].collected, true); assert.deepEqual(s.events, ['snack']);
  tick(s, {}, 10); assert.equal(s.pocket, 1);
});
test('a friend requires one snack and then follows the saved path', () => {
  const s = play(); Object.assign(s.player, s.friends[0]); tick(s);
  assert.equal(s.friends[0].status, 'lost');
  s.pocket = 1; tick(s); assert.equal(s.friends[0].status, 'following'); assert.equal(s.pocket, 0);
  const old = { ...s.friends[0] }; tick(s, { right: true }, 30);
  assert.ok(R.distance(old, s.friends[0]) > 0);
});
test('home deposits followers once, and all three friends trigger a win', () => {
  const s = play();
  for (let i = 0; i < s.friends.length; i++) {
    s.pocket = 1; Object.assign(s.player, s.friends[i]); tick(s);
    assert.equal(s.friends[i].status, 'following');
    Object.assign(s.player, s.config.home); tick(s);
    assert.equal(s.rescued, i + 1); assert.equal(s.friends[i].status, 'home');
  }
  assert.equal(s.phase, 'won'); assert.ok(s.events.includes('win'));
  tick(s, { right: true }, 10); assert.equal(s.rescued, 3); assert.equal(s.phase, 'won');
});
test('workshop overrides preserve the original and can remove snack rule', () => {
  const s = play({ playerAnimal: 'cat', obstacleStyle: 'none', snacksRequired: false });
  assert.equal(s.obstacles.length, 0); assert.equal(s.config.playerAnimal, 'cat');
  assert.equal(s.message, 'Meet a friend, then walk home!');
  Object.assign(s.player, s.friends[0]); tick(s); assert.equal(s.friends[0].status, 'following'); assert.equal(s.pocket, 0);
  assert.equal(R.CONFIG.snacksRequired, true); assert.equal(R.CONFIG.playerAnimal, 'reindeer');
});
test('trail interpolates around bends, including a short trail', () => {
  assert.deepEqual(R.trailPoint([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }], 150), { x: 100, y: 50 });
  assert.deepEqual(R.trailPoint([{ x: 7, y: 8 }], 150), { x: 7, y: 8 });
});

test('a complete three-friend route is reachable by movement, with no teleporting', () => {
  const s = play();
  function walkTo(x, y) {
    let frames = 0;
    while (R.distance(s.player, { x, y }) > 5 && s.phase === 'playing' && frames++ < 600) {
      const dx = x - s.player.x, dy = y - s.player.y;
      tick(s, { right: dx > 3, left: dx < -3, down: dy > 3, up: dy < -3 });
    }
    assert.ok(frames < 600, `clear route to ${x},${y}`);
  }
  // Bunny: the nearby snack, then home.
  walkTo(265, 435); walkTo(265, 290); walkTo(275, 138);
  assert.equal(s.friends[0].status, 'following');
  walkTo(155, 138); walkTo(155, 435); assert.equal(s.rescued, 1);
  // Duck: take the north side of the pond.
  walkTo(155, 102); walkTo(422, 102); walkTo(667, 118); walkTo(802, 160);
  assert.equal(s.friends[1].status, 'following');
  walkTo(667, 118); walkTo(155, 102); walkTo(155, 435); assert.equal(s.rescued, 2);
  // Fox: go around the tree on the south side.
  walkTo(155, 550); walkTo(500, 550); walkTo(500, 495); walkTo(814, 492);
  assert.equal(s.friends[2].status, 'following');
  walkTo(814, 550); walkTo(155, 550); walkTo(155, 435);
  assert.equal(s.rescued, 3); assert.equal(s.phase, 'won');
});
