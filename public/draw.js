/* All the art is drawn with code. No images, fonts, or network requests. */
(function (root) {
  'use strict';
  const C = { ink: '#294957', sand: '#f7dfa3', grass: '#d3e5af', ocean: '#b1dce4',
    blue: '#287d93', yellow: '#ffdc72', lilac: '#b6a0d6', cream: '#fffaf0' };
  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rounded(ctx, x, y, w, h, r, fill, stroke, line = 3) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); }
  }
  function ellipse(ctx, x, y, rx, ry, fill, stroke, line = 3) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); }
  }
  function text(ctx, value, x, y, size = 14, color = C.ink, weight = 800) {
    ctx.font = `${weight} ${size}px "Trebuchet MS", system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(value, x, y);
  }
  function star(ctx, x, y, outer, inner, fill, stroke, rotation = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = rotation + i * Math.PI / 5, r = i % 2 ? inner : outer;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; ctx.stroke(); }
  }
  function heart(ctx, x, y, size, fill) {
    ctx.save(); ctx.translate(x, y); ctx.scale(size / 20, size / 20);
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.bezierCurveTo(-24, -6, -9, -19, 0, -8);
    ctx.bezierCurveTo(9, -19, 24, -6, 0, 8); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  }
  function line(ctx, points, color, width) {
    ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p));
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  }

  function drawAnimal(ctx, animal, x, y, options = {}) {
    const scale = options.scale || 1;
    const bounce = !reducedMotion && options.moving ? Math.sin(options.time * 13) * 3 : 0;
    ctx.save(); ctx.translate(x, y);
    ellipse(ctx, 0, 25, 24 * scale, 7 * scale, '#35546b22');
    ctx.scale(scale, scale); ctx.translate(0, bounce);
    const fur = animal === 'fox' ? '#e6a76b' : animal === 'reindeer' ? '#c99d75' : animal === 'duck' ? '#ffe18b' : animal === 'cat' ? '#bcb0d7' : '#fffaf0';
    if (options.player) { ellipse(ctx, 0, 5, 33, 35, null, '#1c637a', 3); }
    // Little feet and body.
    ellipse(ctx, -11, 24, 9, 5, fur, C.ink, 2);
    ellipse(ctx, 11, 24, 9, 5, fur, C.ink, 2);
    ellipse(ctx, 0, 10, 19, 20, fur, C.ink, 2.5);
    if (animal === 'bunny') {
      ellipse(ctx, -12, -26, 7, 21, fur, C.ink, 2.5);
      ellipse(ctx, 12, -26, 7, 21, fur, C.ink, 2.5);
      ellipse(ctx, -12, -27, 2.5, 12, '#e4b4b6');
      ellipse(ctx, 12, -27, 2.5, 12, '#e4b4b6');
    } else if (animal === 'fox' || animal === 'cat') {
      for (const sign of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(sign * 22, -9); ctx.lineTo(sign * 21, -34); ctx.lineTo(sign * 4, -22); ctx.closePath(); ctx.fillStyle = fur; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
      }
      if (animal === 'fox') {
        ellipse(ctx, 24, 12, 10, 17, fur, C.ink, 2);
        ellipse(ctx, 26, 1, 6, 7, C.cream);
      }
    } else if (animal === 'reindeer') {
      for (const sign of [-1, 1]) {
        line(ctx, [[sign * 14, -23], [sign * 22, -41], [sign * 29, -45]], '#765842', 5);
        line(ctx, [[sign * 22, -40], [sign * 18, -48]], '#765842', 4);
        ellipse(ctx, sign * 22, -11, 9, 6, fur, C.ink, 2);
      }
    }
    ellipse(ctx, 0, -8, 25, 22, fur, C.ink, 2.5);
    if (animal === 'fox') {
      ellipse(ctx, -10, -1, 12, 9, C.cream); ellipse(ctx, 10, -1, 12, 9, C.cream);
    }
    ellipse(ctx, -9, -9, 3.2, 4.3, C.ink); ellipse(ctx, 9, -9, 3.2, 4.3, C.ink);
    ellipse(ctx, -10, -10, 1, 1, C.cream); ellipse(ctx, 8, -10, 1, 1, C.cream);
    if (animal === 'duck') {
      ellipse(ctx, 0, 0, 11, 5, '#e8a157', C.ink, 1.8);
      line(ctx, [[-7, 0], [7, 0]], '#926344', 1);
    } else {
      ellipse(ctx, 0, -1, 3.8, 2.8, animal === 'reindeer' ? '#287d93' : '#8f6864');
      ctx.beginPath(); ctx.arc(0, 1, 6, 0.2, Math.PI - 0.2); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.7; ctx.stroke();
    }
    ellipse(ctx, -17, 0, 4, 2.5, '#d08e854d'); ellipse(ctx, 17, 0, 4, 2.5, '#d08e854d');
    if (options.player) {
      // Original blue explorer hat, with a star badge.
      rounded(ctx, -22, -32, 44, 18, 8, C.blue, C.ink, 2);
      rounded(ctx, -29, -19, 58, 9, 4, C.blue, C.ink, 2);
      star(ctx, 0, -24, 6, 3, C.cream);
      rounded(ctx, -12, 9, 24, 9, 4, C.blue);
      text(ctx, 'YOU', 0, 50, 12, '#164f63');
    }
    ctx.restore();
  }

  function flower(ctx, x, y, type) {
    if (type % 3 === 0) { line(ctx, [[x, y + 4], [x - 4, y - 4], [x, y + 3], [x + 5, y - 3]], '#91ae7b', 2); return; }
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ellipse(ctx, x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3, 3, type % 2 ? '#fff9dd' : '#a995c8');
    }
    ellipse(ctx, x, y, 2, 2, '#c8a060');
  }

  function drawIsland(ctx, state, time) {
    ctx.fillStyle = C.ocean; ctx.fillRect(0, 0, 1000, 620);
    for (let i = 0; i < 25; i++) {
      const x = (i * 173 + 28) % 990, y = (i * 101 + 32) % 620;
      line(ctx, [[x, y], [x + 9, y + 2], [x + 17, y], [x + 27, y + 2]], '#87bfc930', 3);
    }
    rounded(ctx, 22, 28, 956, 571, 105, C.sand, '#7cb1b9', 3);
    rounded(ctx, 44, 47, 912, 532, 92, C.grass);
    // A wide, friendly trail leads from the house into the island.
    ctx.beginPath(); ctx.moveTo(169, 419); ctx.bezierCurveTo(270, 439, 256, 270, 337, 233);
    ctx.bezierCurveTo(426, 204, 550, 192, 700, 227);
    ctx.strokeStyle = '#eae6bb'; ctx.lineWidth = 47; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(698, 227); ctx.bezierCurveTo(785, 272, 740, 396, 792, 487);
    ctx.stroke();
    for (let i = 0; i < 47; i++) {
      const x = 65 + ((i * 137) % 870), y = 70 + ((i * 97) % 480);
      if (x > 80 && x < 250 && y > 250 && y < 500) continue;
      flower(ctx, x, y, i);
    }
    // Two little shell details on the shore.
    ellipse(ctx, 79, 524, 10, 6, '#fffbde', '#bfa780', 1.5);
    line(ctx, [[76, 520], [78, 527], [81, 520], [82, 526]], '#bfa780', 1);
    star(ctx, 908, 543, 10, 5, '#f6b791', '#c19674');
    // Title label looks like a hand-painted island sign.
    rounded(ctx, 454, 48, 168, 28, 14, '#f5f4cf');
    text(ctx, 'SUNNY LITTLE ISLAND', 538, 63, 10, '#637b5d');
  }

  function drawHome(ctx, state) {
    const { x, y } = state.config.home;
    ellipse(ctx, x, y + 28, 89, 43, '#e9dfad');
    // Circle and HOME sign make the goal identifiable without color.
    ctx.save(); ctx.setLineDash([6, 8]); ellipse(ctx, x, y + 21, 77, 42, null, '#897c50', 2); ctx.restore();
    rounded(ctx, x - 56, y - 89, 112, 76, 8, '#fff8dc', C.ink, 3);
    ctx.beginPath(); ctx.moveTo(x - 68, y - 83); ctx.lineTo(x, y - 138); ctx.lineTo(x + 68, y - 83); ctx.closePath();
    ctx.fillStyle = '#c493aa'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    line(ctx, [[x - 38, y - 94], [x, y - 123], [x + 38, y - 94]], '#ead3d8', 3);
    rounded(ctx, x - 15, y - 61, 30, 48, 14, '#597d89', C.ink, 2);
    ellipse(ctx, x + 7, y - 34, 2, 2, C.yellow);
    for (const dx of [-37, 37]) {
      rounded(ctx, x + dx - 11, y - 63, 22, 24, 5, '#a7d5dd', C.ink, 2);
      line(ctx, [[x + dx, y - 61], [x + dx, y - 41]], C.cream, 2);
      line(ctx, [[x + dx - 9, y - 51], [x + dx + 9, y - 51]], C.cream, 2);
    }
    // Label above the roof, clear of the helper and returning friends.
    line(ctx, [[x, y - 158], [x, y - 133]], '#8d7957', 5);
    rounded(ctx, x - 43, y - 185, 86, 29, 6, C.cream, C.ink, 2);
    text(ctx, '⌂ HOME', x, y - 170, 14);
    heart(ctx, x, y - 104, 8, C.cream);
  }

  function drawObstacle(ctx, obstacle, time) {
    if (obstacle.kind === 'pond') {
      ellipse(ctx, obstacle.x, obstacle.y + 5, 107, 106, '#b3c28c');
      ellipse(ctx, obstacle.x, obstacle.y, 98, 98, '#78bbcd', C.ink, 3);
      ellipse(ctx, obstacle.x, obstacle.y, 85, 85, null, '#c5e5df', 2);
      for (let i = 0; i < 4; i++) {
        const x = obstacle.x - 53 + i * 30, y = obstacle.y - 45 + (i % 2) * 45;
        line(ctx, [[x, y], [x + 9, y + 3], [x + 20, y]], '#c5e5df', 3);
      }
      ellipse(ctx, obstacle.x + 38, obstacle.y + 39, 17, 10, '#d0df9e', '#4c7c7b', 2);
      ellipse(ctx, obstacle.x + 41, obstacle.y + 34, 5, 3, '#fff1ca');
      text(ctx, 'WALK AROUND', obstacle.x, obstacle.y + 9, 11, '#224d60');
      text(ctx, 'THE POND', obstacle.x, obstacle.y + 25, 11, '#224d60');
    } else if (obstacle.kind === 'tree') {
      const { x, y } = obstacle;
      ellipse(ctx, x + 1, y + 18, 34, 11, '#54776225');
      rounded(ctx, x - 8, y - 7, 16, 28, 4, '#bc9871', C.ink, 2);
      ellipse(ctx, x - 17, y - 20, 24, 26, '#83ad8b', C.ink, 2);
      ellipse(ctx, x + 17, y - 20, 24, 26, '#83ad8b', C.ink, 2);
      ellipse(ctx, x, y - 36, 30, 28, '#9dc797', C.ink, 2);
      ellipse(ctx, x - 5, y - 39, 10, 5, '#bfd6a750');
    } else {
      const { x, y, w, h } = obstacle;
      rounded(ctx, x - w / 2, y - h / 2, w, h, h / 2, '#bd9572', C.ink, 3);
      line(ctx, [[x - w / 2 + 20, y - 10], [x + w / 2 - 20, y - 10]], '#ecd5aa', 2);
      line(ctx, [[x - w / 2 + 20, y + 8], [x + w / 2 - 20, y + 8]], '#8c725d', 2);
      ellipse(ctx, x + w / 2 - 20, y, 15, h / 2 - 6, '#edcba0', C.ink, 2);
      ellipse(ctx, x + w / 2 - 20, y, 7, h / 2 - 12, null, '#b18862', 2);
    }
  }

  function draw(ctx, state, time) {
    ctx.clearRect(0, 0, 1000, 620);
    drawIsland(ctx, state, time);
    drawHome(ctx, state);
    state.obstacles.forEach(obstacle => drawObstacle(ctx, obstacle, time));
    state.snacks.forEach(snack => {
      if (snack.collected) return;
      const bob = reducedMotion ? 0 : Math.sin(time * 2 + snack.id) * 3;
      ellipse(ctx, snack.x, snack.y + 16, 16, 5, '#77674620');
      ellipse(ctx, snack.x, snack.y + bob, 24, 24, '#fff8dc', '#b29757', 1.5);
      star(ctx, snack.x, snack.y + bob, 17, 8, C.yellow, '#825d2e');
    });
    const actors = [...state.friends.map(friend => ({ ...friend, player: false })), { ...state.player, animal: state.config.playerAnimal, player: true }];
    actors.sort((a, b) => a.y - b.y).forEach(actor => {
      drawAnimal(ctx, actor.animal, actor.x, actor.y, { player: actor.player, moving: actor.player ? state.player.moving : actor.status === 'following' && state.player.moving, time });
      if (!actor.player && actor.status === 'lost') {
        const bubbleY = actor.y - (actor.animal === 'bunny' ? 66 : 52);
        rounded(ctx, actor.x - 37, bubbleY - 15, 74, 27, 13, C.cream, C.ink, 1.5);
        text(ctx, `${actor.name} ♡`, actor.x, bubbleY, 11);
      }
      if (!actor.player && actor.status === 'following') heart(ctx, actor.x, actor.y - 55, 10, '#605287');
    });
    if (state.phase === 'playing') {
      // A labeled arrow reminds the player where to take their new friends.
      if (state.friends.some(f => f.status === 'following')) {
        const p = state.player, home = state.config.home;
        const angle = Math.atan2(home.y - p.y, home.x - p.x);
        ctx.save(); ctx.translate(p.x + Math.cos(angle) * 62, p.y + Math.sin(angle) * 62); ctx.rotate(angle);
        line(ctx, [[-8, 0], [8, 0], [2, -6], [8, 0], [2, 6]], '#1d6073', 4); ctx.restore();
      }
    }
    if (state.phase === 'won' && !reducedMotion) {
      for (let i = 0; i < 26; i++) {
        const x = (i * 149 + Math.sin(time + i) * 20) % 1000;
        const y = (i * 43 + time * 37) % 620;
        star(ctx, x, y, 5 + i % 3, 3, i % 2 ? '#ffdc72' : '#a48cc5', null, time + i);
      }
    }
  }
  root.RescueArt = { draw, drawAnimal };
})(globalThis);
