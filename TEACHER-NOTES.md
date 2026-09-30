# A small game, a big engineering idea

For a K–3 demo: show Spider, show this game, then make one change together. The key idea is **we tell the computer a rule, predict what will happen, and test it**.

## Before the room

1. Download `public/chopper-little-rescue-offline.html`. Save an untouched copy named `rescue-backup.html` and open it once before class.
2. Open the hosted game on the projector. Sound is off by default. Leave it off unless the room wants a tiny celebration sound.
3. Try one rescue: snack → friend → house. Arrow keys/WASD work; phones/tablets have a big arrow pad.
4. Keep the backup in a second browser tab. Avoid changing this tab during the live build.

## A quick demonstration

“These friends are lost. What do you think the stars are for?”

Collect a snack. Meet a friend. Let a child point to **HOME**. Walk home and show the counter change. There is no rush, score, or losing.

Ask the class to vote on **one** change. Say the predicted result out loud before asking Codex to make it. Test that result together.

## Three safe live-edit prompts

1. **Animal:** “Change the helper from a reindeer to a bunny using the named configuration. Keep all the game rules the same. Run the tests and rebuild the offline file.”
   - Prediction: the helper looks different; the same arrows and rescue rules still work
2. **Obstacle:** “Replace the pond and trees with two logs using the named obstacle configuration. Keep clear paths to every snack, friend, and home. Run the tests and rebuild.”
   - Prediction: we must take a different route, but everyone can still get home
3. **Rule:** “Let friends follow the helper without needing a snack. Use the snacksRequired setting, and update the welcome instructions and status messages so they explain the new rule accurately. Keep snacks as optional collectibles. Run the tests and rebuild.”
   - Prediction: meeting a friend immediately starts the friendship; the stars are still fun to collect

The same three changes can be rehearsed in **Grown-ups** without editing code. Applying a setting restarts the round. **Reset original** returns to the original reindeer, pond, and snack rule.

## If the live change gets wobbly

- Pause with P or Esc while talking
- Switch to the untouched `rescue-backup.html` tab and continue playing
- Reopening the untouched file returns to the original welcome screen; Restart begins a fresh round
- In the editable checkout, return to the last verified Git commit only after saving any work you want to keep, then run `npm test` and `npm run build`
- Wi-Fi isn't needed for the downloaded one-file game

Keep the lesson focused on one idea. A working, small change is more memorable than a large unfinished feature.
