/* The rules live here. This file works in a browser and in Node's test runner. */
(function (root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  else root.RescueRules = rules;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // LIVE-EDIT CORNER: change one thing, predict what happens, then try it!
  const CONFIG = Object.freeze({
    width: 1000,
    height: 620,
    playerSpeed: 220,
    playerRadius: 23,
    playerAnimal: 'reindeer', // Try 'bunny' or 'cat'.
    worldMood: 'sunny',     // Try 'moonlight'. The whole world changes!
    flying: false,         // Give everyone wings; they can fly over the pond.
    animalScale: 1,        // Try 1.6 for a land of gentle giants.
    reducedMotion: false,
    lowPower: false,
    obstacleStyle: 'pond',  // Try 'logs' or 'none'.
    snacksRequired: true,
    friendDistance: 58,
    home: { x: 155, y: 400, radius: 90 },
    friends: [
      { name: 'Bunny', animal: 'bunny', x: 275, y: 138 },
      { name: 'Duck', animal: 'duck', x: 802, y: 160 },
      { name: 'Fox', animal: 'fox', x: 814, y: 492 }
    ],
    snacks: [
      { x: 265, y: 290 }, { x: 422, y: 102 }, { x: 667, y: 118 },
      { x: 745, y: 426 }, { x: 500, y: 495 }
    ]
  });

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function makeObstacles(style) {
    if (style === 'none') return [];
    if (style === 'logs') return [
      { kind: 'log', x: 500, y: 275, w: 185, h: 55 },
      { kind: 'log', x: 620, y: 370, w: 160, h: 48 }
    ];
    return [
      { kind: 'pond', x: 538, y: 293, radius: 98 },
      { kind: 'tree', x: 910, y: 306, radius: 31 },
      { kind: 'tree', x: 360, y: 465, radius: 30 }
    ];
  }

  function createState(overrides = {}) {
    const config = { ...CONFIG, ...overrides };
    const player = { x: config.home.x, y: config.home.y + 35, facing: 1, moving: false };
    return {
      config, phase: 'ready', player,
      friends: config.friends.map((friend, id) => ({ ...friend, id, status: 'lost' })),
      snacks: config.snacks.map((snack, id) => ({ ...snack, id, collected: false })),
      obstacles: makeObstacles(config.obstacleStyle),
      pocket: 0, rescued: 0, elapsed: 0,
      trail: [{ x: player.x, y: player.y }],
      message: config.snacksRequired ? 'Find a star snack, then a friend!' : 'Meet a friend, then walk home!',
      messageTime: 5,
      events: [], effects: [], celebrationTime: 0, discoveries: []
    };
  }

  function collides(point, radius, obstacle) {
    if (obstacle.radius) return distance(point, obstacle) < radius + obstacle.radius;
    const near = { x: clamp(point.x, obstacle.x - obstacle.w / 2, obstacle.x + obstacle.w / 2),
      y: clamp(point.y, obstacle.y - obstacle.h / 2, obstacle.y + obstacle.h / 2) };
    return distance(point, near) < radius;
  }

  function movePlayer(state, dx, dy) {
    const p = state.player;
    const c = state.config;
    // Try each axis separately: children can slide along edges, never get stuck.
    const nextX = { x: clamp(p.x + dx, 37, c.width - 37), y: p.y };
    if (c.flying || !state.obstacles.some(o => collides(nextX, c.playerRadius, o))) p.x = nextX.x;
    const nextY = { x: p.x, y: clamp(p.y + dy, 48, c.height - 36) };
    if (c.flying || !state.obstacles.some(o => collides(nextY, c.playerRadius, o))) p.y = nextY.y;
  }

  function trailPoint(trail, behind) {
    let remaining = behind;
    for (let i = 0; i < trail.length - 1; i++) {
      const segment = distance(trail[i], trail[i + 1]);
      if (segment >= remaining && segment > 0) {
        const t = remaining / segment;
        return { x: trail[i].x + (trail[i + 1].x - trail[i].x) * t,
          y: trail[i].y + (trail[i + 1].y - trail[i].y) * t };
      }
      remaining -= segment;
    }
    return trail[trail.length - 1];
  }

  function say(state, message, event) {
    state.message = message;
    state.messageTime = 4;
    if (event) state.events.push(event);
  }

  function burst(state, kind, x, y, life = 1.2) {
    state.effects.push({ kind, x, y, age: 0, life, seed: state.elapsed });
    if (state.effects.length > 14) state.effects.shift();
  }

  function start(state) { state.phase = 'playing'; }
  function togglePause(state) {
    if (state.phase === 'playing') state.phase = 'paused';
    else if (state.phase === 'paused') state.phase = 'playing';
  }

  function update(state, input, dt) {
    state.events = [];
    const safeDt = clamp(dt, 0, 0.05); // A slow frame cannot teleport through a pond.
    if (state.phase === 'playing' || state.phase === 'won') {
      state.effects.forEach(effect => { effect.age += safeDt; });
      state.effects = state.effects.filter(effect => effect.age < effect.life);
    }
    if (state.phase === 'won') { state.celebrationTime += safeDt; return; }
    if (state.phase !== 'playing') return;
    state.elapsed += safeDt;
    state.messageTime = Math.max(0, state.messageTime - safeDt);
    let dx = Number(Boolean(input.right)) - Number(Boolean(input.left));
    let dy = Number(Boolean(input.down)) - Number(Boolean(input.up));
    const length = Math.hypot(dx, dy);
    if (length > 0) { dx /= length; dy /= length; }
    state.player.moving = length > 0;
    if (dx) state.player.facing = Math.sign(dx);
    movePlayer(state, dx * state.config.playerSpeed * safeDt, dy * state.config.playerSpeed * safeDt);

    if (distance(state.player, state.trail[0]) > 5) {
      state.trail.unshift({ x: state.player.x, y: state.player.y });
      if (state.trail.length > 200) state.trail.pop();
    }

    for (const snack of state.snacks) {
      if (!snack.collected && distance(state.player, snack) < 40) {
        snack.collected = true;
        state.pocket++;
        burst(state, 'star', snack.x, snack.y);
        say(state, state.config.snacksRequired ? 'A star snack! Find a friend to share it with.' : 'A star snack! A little bonus for exploring.', 'snack');
      }
    }

    for (const friend of state.friends) {
      if (friend.status !== 'lost' || distance(state.player, friend) >= 52) continue;
      if (state.config.snacksRequired && state.pocket === 0) {
        if (state.messageTime < 1) say(state, `${friend.name} would love a star snack!`);
        continue;
      }
      if (state.config.snacksRequired) state.pocket--;
      friend.status = 'following';
      friend.happyUntil = state.elapsed + 2;
      burst(state, 'hearts', friend.x, friend.y, 1.8);
      say(state, `${friend.name} is following! Go to the house.`, 'friend');
    }

    const followers = state.friends.filter(friend => friend.status === 'following');
    followers.forEach((friend, index) => {
      const target = trailPoint(state.trail, (index + 1) * state.config.friendDistance);
      const lerp = Math.min(1, safeDt * 12);
      friend.x += (target.x - friend.x) * lerp;
      friend.y += (target.y - friend.y) * lerp;
    });

    // Optional tiny discoveries. They never gate the rescue or add a task.
    for (const surprise of [{ name: 'butterfly', x: 83, y: 128 }, { name: 'shell', x: 920, y: 535 }]) {
      if (!state.discoveries.includes(surprise.name) && distance(state.player, surprise) < 58) {
        state.discoveries.push(surprise.name);
        burst(state, 'wonder', surprise.x, surprise.y, 3);
      }
    }

    if (distance(state.player, state.config.home) < state.config.home.radius - 24 && followers.length) {
      for (const friend of followers) {
        friend.status = 'home';
        state.rescued++;
        friend.x = state.config.home.x - 45 + (state.rescued - 1) * 45;
        friend.y = state.config.home.y + 40;
      }
      say(state, `${state.rescued} of ${state.friends.length} friends home. You're a kind helper!`, 'home');
      burst(state, 'home', state.config.home.x, state.config.home.y, 2.2);
      if (state.rescued === state.friends.length) {
        state.phase = 'won';
        state.celebrationTime = 0;
        say(state, 'Everyone is home!', 'win');
      }
    }
  }

  return { CONFIG, createState, start, togglePause, update, distance, collides, trailPoint, makeObstacles, burst };
});
