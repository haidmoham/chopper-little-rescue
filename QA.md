# Verification record

Verified 2026-09-30.

## Automated checks

`npm test`: **17/17 passed**. `npm run build`: passed. JavaScript syntax checks: passed.

- Deterministic initial state; original configuration stays unchanged
- Ready/paused states stop movement; resume moves
- Normalized diagonal speed, opposing-key cancellation, slow-frame cap, and boundaries
- Circular pond collision/sliding and rectangular log collision
- One-time snack collection; snack sharing; following the saved path
- Home deposits followers once; three friends produce a win
- Workshop overrides and snack-free rules preserve original defaults
- Trail interpolation around bends
- Complete movement-only three-friend route, without teleporting
- DOM-stub checks for start/pause/restart, quick taps, held-input clearing on blur, resize, pointer cancel/lost capture, and workshop reset
- Offline HTML has three inline scripts, no external stylesheet/script references, and no fetch/WebSocket/XHR calls
- Dependency-free local server path resolution rejects encoded traversal

DOM-stub checks are contract tests, not visual browser evidence. The local server's HTTP endpoint could not be exercised in this restricted environment; its path resolver and JavaScript syntax were checked.

## Real hosted browser checks

Production: https://chopper-little-rescue.vercel.app/

- Rendered welcome screen and successful start
- Actual arrow-key and WASD playthrough: collected snacks, met Bunny/Duck/Fox, saw all three follow, walked them home, reached **3 / 3**, and saw **Everyone is home!**
- Play again reset to **0 / 3**
- P paused; Keep helping resumed; Restart reset the round
- Pond stopped repeated movement attempts at its edge
- Sound defaulted off; button changed off → on → off (UI/API operation verified; speaker audio wasn't measured)
- Workshop changed the helper to Cat, removed obstacles, and disabled required snacks; the map and hint updated; Reset original restored the game
- Short desktop viewport fits the full map, goal, status, and controls
- 390-pixel iframe of the **standalone offline HTML** rendered its full welcome card after a clipping fix; the playing map compacted correctly; large on-screen arrow buttons moved the helper
- Pointer buttons released to unpressed state after clicking
- Final desktop welcome was reloaded and visually inspected after mobile changes

The full rescue playthrough used gameplay commit `ba7f9d3`; subsequent changes affected the HOME label, workshop copy/ARIA, and mobile layout. Those changes were rechecked on deployed commit `a761e002`; all movement and shell tests were rerun afterward.

Browser logs showed extension-origin metadata errors, with no game-origin error observed in the captured mobile log set.

## Offline evidence and limits

The same single-file HTML was actually started and played in the hosted mobile-preview iframe. Static checks confirm that it is self-contained. A disconnected `file://` opening wasn't tested because the available cloud browser does not offer that route. Download it and open it once on the classroom computer before the demo.

Physical touch hardware, an actual projector, other browser engines, and real speaker output weren't tested. Blur/input clearing and resize invariants passed DOM-stub checks; native held-key/physical multitouch behavior remains a device rehearsal check.

## Fixes found during QA

1. Short desktop screens cropped the map/status → size the adventure to the viewport height
2. Very quick taps could fall between animation frames → give each initial key/pointer press a small immediate step
3. Phone-width welcome card clipped → use a taller overlay stage and a compact playing stage
4. HOME label overlapped the helper at the start → move it above the roof
5. Snack-free workshop copy and ARIA mentioned required snacks → make them match the chosen rule
