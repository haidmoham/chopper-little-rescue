# 3D storybook upgrade · review checkpoint

This branch contains the implemented Three.js toy-diorama upgrade. It is a **review checkpoint, not a completed browser/hardware certification**. The verified v1 remains on `main` and in `public/classroom-backup.html`.

## Implemented

- Original rounded 3D animal models, beveled island, cottage, pond, trees, butterflies, and clouds
- Warm lighting, breathing/blinking/walking, friendship sparkles, balloons, and a staged rainbow homecoming
- Whole-world moonlight, gentle-giant size, and wings that actually pass over obstacles
- Calm motion and optional low-power rendering; simulation is separate from rendering
- Shared low-poly geometry, instanced flowers/effects, capped DPR and pixel budget, no dynamic shadow maps or post-processing
- Three.js is bundled locally, including inside the single-file offline HTML; no CDN or downloaded model/texture is needed at runtime
- Illustrated fallback when WebGL isn't available

## Checks at publication

`npm run build`, JavaScript syntax checks, and **20/20 automated tests pass**. Checks include movement/collision/rescue, the complete movement-only rescue route, winged traversal, effect bounds/expiry, pause/restart/input release, and offline self-containment.

Real hosted visual inspection, full 3D playthrough, mobile inspection, and hardware performance checks are **pending**. The renderer has not yet been visually certified. See `QA.md` for the earlier v1 verification, not a claim about this upgrade.

## Windows pickup

Check out `codex/storybook-wow`, then:

```sh
npm ci
npm test
npm run build
npm run dev
```

Open http://localhost:4173. The Grown-ups panel shows actual renderer mode, sampled FPS, draw calls, triangles, and DPR. Inspect the normal game and `/mobile-preview.html`. Use the named controls for Moonlight, Gentle giants, Wings, Calm motion, and Low power.

The downloadable 3D file is `public/chopper-little-rescue-offline.html` (~651KB). The original, known-good offline file is `public/classroom-backup.html` (44KB). Don't overwrite that fallback while reviewing the upgrade.

An 8GB RAM specification alone doesn't establish GPU performance. Actual MacBook/browser testing is still needed before treating the new renderer as classroom-ready on that machine.
