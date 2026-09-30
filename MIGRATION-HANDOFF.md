# unfinished 3D refinement: cloud pickup

Windows work is paused by user instruction. This checkpoint is not permission to resume desktop execution. Continue source work and verification in the cloud. Do not merge or deploy production during migration.

## source and release state

- repository: haidmoham/chopper-little-rescue
- branch: codex/chopper-3d-recovery
- parent commit: 0ad276fb42a175321df1877958410b55afb4660b
- main remains 68363c050de4fa61e9147944a3f71fa8965ff597
- published recovery preview: https://chopper-little-rescue-ip5zo72kj-zarnab.vercel.app (Vercel authentication protected)
- that preview is the earlier recovery commit, not this refinement
- no production cutover has occurred

The frozen recovery archive was materialized using the current Library helper. Its SHA256 matched eea2041912789788eee6a1db060231ddab44b354039d4cf2ffd386495ec7425b. Recovery commit 0ad276f has exact original tree 45424d5cda815658896bb9bbfbf616cdc25e2ec4.

## focused refinement already implemented

Actual reference inspected: https://misha2.mhaider.dev/. Browser interactions covered its welcome, village arrival, farmer story, plan selection, and arithmetic prompt. Observed traits were muted sage terrain, amber paths, pine silhouettes, terracotta roofs, cream story panels, and read-aloud classroom choices.

Chopper borrows the palette, thicker island edge, pine shapes at the existing obstacle positions, terracotta cottage roof, chapter caption, and three porch lanterns that light as friends return. The expressive animal meshes, local textures, rescue rules, moonlight, giants, wings, celebration, and offline bundling remain intact. Short desktop welcome-card clipping observed at 1264x625 was fixed with compact card styles. Link-preview description is now concise and lowercase.

Source and generated public files in this checkpoint were built together before desktop authorization was withdrawn. No new automated tests were written.

## observed browser QA before the pause

Evidence came from isolated agent-browser sessions running headless Chromium on Windows, with real WebGL rendering and screenshots. The GPU reported ANGLE / NVIDIA GeForce RTX 3080 / Direct3D11. Movement routes used synthetic keyboard events through the actual browser handlers and animation loop; the read-only RescueGame hook observed state. No player teleport or direct game-state writes were used. Mobile results are viewport simulation, not a physical phone.

- existing 20/20 tests and npm run build passed after the refinement
- full ordinary three-friend snack/rescue/follow/home/win route completed
- repeated full win completed with moonlight, giants, wings, calm motion, and low power together
- delayed win card and rainbow rendered; replay reset phase/counts/pocket; sound remained off
- blur during held movement paused, cleared held input, and left the player stationary
- mobile direction-button pointer hold moved; release and synthetic pointer cancellation stopped movement
- desktop screenshots: 1264x625 and 1366x768; mobile: 390x844 and 320x740; narrow mobile showed no horizontal overflow
- normal pond collision stopped at x approximately 417; wings traversed from x approximately 396 to 696 through the pond
- standalone HTML started with browser networking disabled and completed one rescue
- deliberately disabling WebGL selected and rendered the illustrated fallback
- sampled ordinary mode at 1366x768, DPR 1: 142, 154, 159, 164, 161 fps; 183 draw calls; approximately 28k triangles
- combined low-power mode: five samples of 28 fps; 209 draw calls; approximately 33k triangles; DPR 1
- page-error checks for desktop, mobile, and offline sessions returned no errors

These observations do not establish performance on an 8GB Mac or physical mobile interaction. The Vercel build machine's 8GB memory is not device performance evidence.

## remaining gates and exclusions

The updated refinement has not been deployed to preview. Prepare and verify a new preview from this branch in the cloud, then review the targeted visual refinement with the parent/user. Honor the Pokédex-first release order. Only after those gates, merge to main and deploy the exact verified main commit through the existing Vercel project and authorized credentials. No bypass or new credentials are authorized by this handoff.

The earlier REVIEW-CHECKPOINT.md describes the frozen checkpoint, so its browser-pending statements are historical; this handoff records later observations. A final consolidated QA/release document is unfinished.

Screenshots and exploratory snippets remain outside Git in the Windows task workspace, alongside the original archive and Library helpers. Useful screenshots include desktop-compact-fixed.png, desktop-refined-ready.png, refined-one-home.png, refined-win-card.png, mobile-playing.png, mobile-320.png, mobile-paused.png, moonlight-giants-wings.png, offline-one-home.png, illustrated-fallback.png, and repeated-winged-win.png. Reference screenshots are named misha-*.png. They were not uploaded during this limited handoff. Reproduce evidence in the cloud, or request a separately authorized artifact transfer if needed.

A task-local FFmpeg package was installed outside Git for a planned demo. No demo was recorded or delivered. No source implementation, builds, tests, rendering, merge, or deployment were run during the limited migration handoff.
