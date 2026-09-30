/* The small browser shell: input → update → draw. */
(function () {
  'use strict';
  const Rules = window.RescueRules;
  let canvas = document.getElementById('world');
  let sceneRenderer = null;
  try { sceneRenderer = window.RescueScene?.create(canvas); } catch (error) { console.warn('Using the illustrated fallback.', error.message); }
  let ctx = sceneRenderer ? null : canvas.getContext('2d');
  if (!sceneRenderer && !ctx) { const replacement = canvas.cloneNode(); canvas.replaceWith(replacement); canvas = replacement; ctx = canvas.getContext('2d'); }
  const $ = id => document.getElementById(id);
  const prefersCalm = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  let state = Rules.createState({ reducedMotion: prefersCalm });
  let input = {};
  let soundOn = false;
  let audio = null;
  let lastTime = 0;
  let lastPhase = '';
  let lastMessage = '';
  let roundSettings = { reducedMotion: prefersCalm };
  let winShown = false;
  let lastStatsAt = 0;
  const keyDirections = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };

  function clearInput() {
    input = {};
    document.querySelectorAll('[data-direction]').forEach(button => button.classList.remove('pressed'));
    state.player.moving = false;
  }
  function startRound() {
    clearInput();
    Rules.start(state);
    syncUI();
    canvas.focus({ preventScroll: true });
  }
  function restartRound(settings = roundSettings, play = true) {
    clearInput();
    roundSettings = { ...settings };
    state = Rules.createState(roundSettings);
    winShown = false;
    if (play) startRound(); else syncUI();
  }
  function pauseRound() {
    clearInput();
    Rules.togglePause(state);
    syncUI();
    if (state.phase === 'paused') $('resume').focus({ preventScroll: true });
    else if (state.phase === 'playing') canvas.focus({ preventScroll: true });
  }

  function playTone(event) {
    if (!soundOn || !audio) return;
    const melodies = { snack: [660, 880], friend: [523, 659, 784], home: [659, 784, 1047], win: [523, 659, 784, 1047] };
    const melody = melodies[event] || [];
    melody.forEach((frequency, index) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      const begin = audio.currentTime + index * 0.10;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, begin); gain.gain.linearRampToValueAtTime(0.045, begin + 0.01); gain.gain.exponentialRampToValueAtTime(0.001, begin + 0.18);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(begin); oscillator.stop(begin + 0.2);
    });
  }

  function syncUI() {
    canvas.setAttribute('aria-label', state.config.snacksRequired
      ? 'Island map. Use arrow keys or W A S D to move. Collect star snacks, walk to the three friends, then return to the house.'
      : 'Island map. Use arrow keys or W A S D to move. Walk to the three friends, then return to the house. Star snacks are optional.');
    $('win-first-line').textContent = state.config.snacksRequired ? 'You shared snacks.' : 'You explored the island.';
    $('snack-count').textContent = state.pocket;
    $('home-count').textContent = `${state.rescued} / ${state.friends.length}`;
    $('friend-dots').textContent = state.friends.map(f => f.status === 'home' ? '●' : '○').join(' ');
    const showWin = state.phase === 'won' && (state.config.reducedMotion || state.celebrationTime >= 2.8);
    $('overlay').hidden = state.phase === 'playing' || state.phase === 'won' && !showWin;
    $('win-card').hidden = !showWin;
    if (showWin && !winShown) { winShown = true; $('play-again').focus({ preventScroll: true }); }
    if (state.message !== lastMessage) {
      $('message').textContent = state.message;
      lastMessage = state.message;
    }
    if (state.phase === lastPhase) return;
    const phase = state.phase;
    $('overlay').setAttribute('data-phase', phase);
    $('stage').classList.toggle('is-playing', phase === 'playing');
    $('welcome').hidden = phase !== 'ready';
    $('pause-card').hidden = phase !== 'paused';
    $('pause').disabled = phase === 'ready' || phase === 'won';
    $('pause').textContent = phase === 'paused' ? 'Resume' : 'Pause';
    if (phase === 'won') clearInput();
    lastPhase = phase;
  }

  function fitCanvas() {
    // Logical coordinates stay constant as the page resizes; backing pixels stay crisp.
    const rect = canvas.getBoundingClientRect();
    if (sceneRenderer) { sceneRenderer.resize(rect.width, rect.width * Rules.CONFIG.height / Rules.CONFIG.width); return; }
    const scale = Math.min(2, window.devicePixelRatio || 1);
    // CSS may letterbox the mobile canvas, so use its logical aspect ratio.
    const backingWidth = Math.max(1, Math.round(rect.width * scale));
    canvas.width = backingWidth;
    canvas.height = Math.round(backingWidth * Rules.CONFIG.height / Rules.CONFIG.width);
    ctx.setTransform(canvas.width / 1000, 0, 0, canvas.height / 620, 0, 0);
  }

  function frame(now) {
    const seconds = now / 1000;
    const dt = lastTime ? seconds - lastTime : 0;
    lastTime = seconds;
    Rules.update(state, input, dt);
    state.events.forEach(playTone);
    syncUI();
    if (sceneRenderer) sceneRenderer.draw(state, seconds);
    else window.RescueArt.draw(ctx, state, seconds);
    if (seconds - lastStatsAt > 1) {
      const stats = sceneRenderer?.stats();
      $('performance').textContent = stats ? `3D diorama · ${stats.fps} fps · ${stats.drawCalls} draw calls · ${Math.round(stats.triangles / 1000)}k triangles · DPR ${stats.pixelRatio}` : 'Illustrated fallback · 3D is unavailable in this browser';
      lastStatsAt = seconds;
    }
    requestAnimationFrame(frame);
  }

  function isEditing(event) { return /INPUT|SELECT|TEXTAREA/.test(event.target.tagName); }
  function takeTapStep(direction) {
    // A quick little tap still moves, even if it lands between animation frames.
    Rules.update(state, { [direction]: true }, 1 / 60);
    state.events.forEach(playTone);
    syncUI();
  }
  document.addEventListener('keydown', event => {
    if (isEditing(event)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (event.shiftKey && key === 't') { $('teacher').open = !$('teacher').open; clearInput(); return; }
    if (key === 'Escape' || key === 'p') {
      if (state.phase === 'playing' || state.phase === 'paused') { event.preventDefault(); if (!event.repeat) pauseRound(); }
      return;
    }
    const direction = keyDirections[key];
    if (direction && state.phase === 'playing') {
      event.preventDefault();
      input[direction] = true;
      if (!event.repeat) takeTapStep(direction);
    }
  });
  document.addEventListener('keyup', event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (keyDirections[key]) input[keyDirections[key]] = false;
  });
  window.addEventListener('blur', () => { clearInput(); if (state.phase === 'playing') pauseRound(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); if (state.phase === 'playing') pauseRound(); } });
  window.addEventListener('resize', fitCanvas);

  // Pointer events work for touch, pen, and mouse. Capture ensures release isn't lost.
  document.querySelectorAll('[data-direction]').forEach(button => {
    const stop = () => { input[button.dataset.direction] = false; button.classList.remove('pressed'); };
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (state.phase !== 'playing') return;
      button.setPointerCapture(event.pointerId);
      input[button.dataset.direction] = true;
      button.classList.add('pressed');
      takeTapStep(button.dataset.direction);
    });
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('lostpointercapture', stop);
  });

  $('start').addEventListener('click', startRound);
  $('restart').addEventListener('click', () => restartRound());
  $('pause').addEventListener('click', pauseRound);
  $('resume').addEventListener('click', pauseRound);
  $('play-again').addEventListener('click', () => restartRound());
  $('sound').addEventListener('click', async () => {
    if (!audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { $('sound').textContent = 'Sound unavailable'; $('sound').disabled = true; return; }
      audio = new AudioContext();
    }
    soundOn = !soundOn;
    $('sound').textContent = soundOn ? 'Sound on' : 'Sound off';
    $('sound').setAttribute('aria-pressed', String(soundOn));
    if (soundOn) { await audio.resume(); playTone('snack'); } else await audio.suspend();
  });
  $('workshop').addEventListener('submit', event => {
    event.preventDefault();
    restartRound({ playerAnimal: $('animal').value, obstacleStyle: $('obstacles').value, snacksRequired: $('snacks-required').checked, worldMood: $('world-mood').value, flying: $('flying').checked, animalScale: Number($('animal-scale').value) || 1, reducedMotion: $('calm-motion').checked, lowPower: $('low-power').checked });
    $('teacher').open = false;
  });
  $('reset-defaults').addEventListener('click', () => {
    $('animal').value = Rules.CONFIG.playerAnimal;
    $('obstacles').value = Rules.CONFIG.obstacleStyle;
    $('snacks-required').checked = Rules.CONFIG.snacksRequired;
    $('world-mood').value = 'sunny'; $('flying').checked = false; $('animal-scale').value = '1'; $('calm-motion').checked = prefersCalm; $('low-power').checked = false;
    restartRound({ reducedMotion: prefersCalm });
    $('teacher').open = false;
  });
  $('teacher').addEventListener('toggle', () => {
    clearInput();
    if ($('teacher').open && state.phase === 'playing') pauseRound();
  });

  // Read-only inspection hook for classroom debugging and automated checks.
  window.RescueGame = Object.freeze({
    snapshot: () => JSON.parse(JSON.stringify(state)),
    inputSnapshot: () => ({ ...input }),
    soundEnabled: () => soundOn
  });
  fitCanvas();
  $('calm-motion').checked = prefersCalm;
  syncUI();
  requestAnimationFrame(frame);
})();
