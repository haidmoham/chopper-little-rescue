# Verification record

## Deterministic rules

`npm test`: **10/10 passed**, 2026-09-30.

- Ready/paused states stop movement; resume moves
- WASD/arrow input is represented as independent directions; diagonal speed is normalized
- Slow frames are capped; map boundaries remain solid
- Pond collision prevents entry and permits sliding; rectangular log collision checked
- Snacks collect once
- A friend requires one snack in the original rules, then follows the trail
- Home deposits followers once; three friends produce a win
- Workshop overrides and snack-free rules preserve original defaults
- Trail points interpolate around bends

`npm run build`: passed. Produces static web files and one self-contained offline HTML.

## Browser QA

Hosted playthrough and visual checks are pending the initial Vercel deployment. The installed local Chromium could not launch because the execution environment denied socket creation; the cloud browser blocks loopback URLs. No local-browser pass is claimed.

Physical touch hardware and a real classroom projector have not been tested.
