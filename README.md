# Chopper's Little Rescue

This branch is the **3D storybook review checkpoint**. Read [REVIEW-CHECKPOINT.md](REVIEW-CHECKPOINT.md) for implementation status, Windows pickup, and checks still pending. The verified classroom fallback is `public/classroom-backup.html`.

A tiny, big-hearted animal rescue game for a live engineering workshop. Find star snacks, meet Bunny, Duck, and Fox, and guide them home. No battles, timers, lives, accounts, analytics, or child data.

## Play

- Arrow keys or WASD to move
- On-screen arrow pad on phones, tablets, and touch devices
- Walk onto a star snack, then walk to a friend; the friend follows you
- Return to the house marked **HOME**
- Esc or P to pause; Restart begins a fresh round
- Sound starts off. Choose **Sound off** to turn it on; choose it again to mute

Shapes, labels, outlines, and counters carry the instructions, so color isn't the only cue. The canvas is a visual game; it isn't designed as a fully screen-reader-playable experience.

## Offline fallback

Download `public/chopper-little-rescue-offline.html` and open it in a browser. Everything is inside that one file, including code-drawn art and synthesized sounds. It makes no runtime network requests. Keep an untouched copy for the classroom.

## Run and change it

Requires Node 20+ for build/tests. Three.js is bundled into the game; esbuild is a build-time dependency. There are no runtime CDN, model, font, or texture downloads.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open http://localhost:4173. Run `npm ci` once after checkout.

The local preview uses only Node's built-in HTTP server. For a desktop inspection of the phone layout, open `/mobile-preview.html`; it displays the standalone HTML in a real 390-pixel iframe with the arrow pad.

| File | What to change |
|---|---|
| `src/logic.js` | Named `CONFIG`, state, rules, movement, collisions, rescue goal |
| `src/draw.js` | Original animal and island drawing functions |
| `src/scene.js` | Three.js toy models, lighting, transformations, and bounded effects |
| `src/game.js` | Keyboard/pointer input, sound, UI, update/draw loop |
| `src/style.css` | Layout, colors, text, responsive controls |
| `src/index.html` | Welcome, instructions, pause/win cards, workshop panel |

`npm run build` copies the source into `public/` and rebuilds the single-file offline version. Edit **src**, not the generated **public** files.

The **Grown-ups** panel (also Shift + T) lets the class vote on the helper animal, obstacles, or whether a friend needs a snack. Applying a setting starts a fresh round. **Reset original** restores the starting game.

See [TEACHER-NOTES.md](TEACHER-NOTES.md) for three bounded live-edit prompts and a reset plan.

## Vercel

Import this repository with framework **Other**, build command **npm run build**, and output directory **public**. No environment variables or backend are required. `vercel.json` includes those settings.

## Verification

`npm test` exercises deterministic movement, normalized diagonals, boundaries, collision/sliding, snack collection, rescue/follow/home, victory, pause/resume, workshop overrides, and trail interpolation. Browser checks are recorded in [QA.md](QA.md).

This is an unofficial, One Piece-inspired project name. All artwork is drawn from original code; no franchise artwork, clips, or music are included. No affiliation is implied.
