# Step-funded neighborhood navigation

Status: implemented in web source; no new Android package or physical gesture validation in this session. The opening graph and two optional out-and-back errands are playable with the ignored local content pack. This is not a complete first arc or year-long campaign.

## State and movement

Story stage and physical position are separate. `Navigation` stores an edge, integer offset, selected heading, authorized edges and traversed intervals. The small cardinal control selects only directions available at the current node or on the current edge. Unavailable directions are disabled. Choosing a direction uses already earned reserve if present; it never creates step credit. New real or fictional credits then move Moro at one world pixel per accepted step at normal zoom. Fictional credits remain separate from health totals.

Travel stops at authored edge endpoints, even with surplus credit. The arrival and earlier-approach nodes are now transit points: an explicitly upgraded return route continues through them and extends west as steps arrive. It does not skip dialogue or automatically select another branch. Turning around mid-edge preserves all discovered intervals and costs the same number of steps per pixel. A physical return to the encounter location is required before performing that scene's actions. Steps arriving while a decision waits remain in the capped reserve.

The initial office quest remains 2% of the daily goal, followed by a 10% northbound courtyard route. New neighborhood routes are explicitly selected before their directions become available. Optional unpaid help opens a two-daily-goal outward leg and requires the same return distance. These are provisional effort values, not measured production balancing or real-time deadlines. The post office remains the only available employer.

## Replay and compatibility

New saves use content generation `prologue-3`; decoding also accepts `prologue-1` and `prologue-2`. Existing events replay with their original linear credit rules until a single `enable-navigation` event materializes the already visible progress and charges it once. Existing delivery/letter outcomes remain unchanged. The primary street stays horizontal; the courtyard extends north. This is a geometry update for the prototype, not preservation of old screen coordinates.

Imported activity before the quest origin forms an earlier known approach, not completed first-quest travel. Native aggregate/high-water reconciliation remains unchanged. Direction, destination, encounter, dialogue and errand events are saved through the same validated replay stream. Cloud decoding normalizes older saves before comparing current content fingerprints. Live cloud setup remains pending as documented separately.

Do not infer another quest's discovery from a previous inspection: known locations are derived from the actual inspection/encounter event sequence. The current small graph has fixed prototype topology and a single-letter lifecycle; future campaign geography/content loading, event compaction and longer-term save scalability remain work before a year-long campaign.

## Discovery and representation

Only traversed intervals are drawn, with a constant screen-width path. Characters are encounter records rather than live tracked positions. Their most recent encountered place has a hollow square in their color; earlier distinct places retain small colored squares. A later meeting moves the hollow marker without erasing history. Multiple meetings at one place do not duplicate a marker. Collection reports last encountered place.

Encountered buildings/places use hollow squares, with short localized labels above when bounds, label spacing and the character/dialogue area allow. Neither a destination selection nor an authorized edge reveals an unvisited building or hidden character. The latest-marker projection is shared by the map and Collection.

## Zoom and controls

Pinch works from the opening, without the old post-office-distance gate. Capture the pinch ratio before scheduling a React state update; reading the mutable previous-distance reference inside the updater caused incorrect or reversed zoom. Wheel/trackpad, keyboard +/- with map focus, and visible +/- buttons also zoom.

A small square button fits the known route extents or resets zoom; no percentage is visible. The minimum zoom adapts to discovered extents so long walked routes can be viewed. Moro remains centered and scales proportionally; dragging never moves the camera or protagonist. Labels are culled instead of overlapping. Cardinal controls have small visible letters with 44 px touch targets; landscape reserves side space for controls. Reduced-motion preferences still disable Moro's pulse.

## Progression and narrative

Reusable dialogue details temporarily replace initial choices, with an explicit return. The local pack extends the opening with two encounter locations and optional unpaid errands; listening, promised help, observations, completion and letter-related memories persist. Secrets, full text and the vertical tree remain in `src/content/private/`, ignored by Git.

Letter delivery, opening and destruction each award one first-action badge with localized title/description. Undiscovered badges remain absent. Accepting work unlocks the visible `Basic respect` skill root, a short notice and a journal entry. There are no visible future nodes or placeholder branches, and no unimplemented numerical skill bonuses are claimed.

## Verification

Behavioral tests cover reversal, one-step/one-pixel spending, reserve stops, disabled branches, physical scene guards, legacy conversion, health deduplication, encounter history, unpaid return costs, refusal exploration, first-action badges and zoom bounds. Browser checks use synthetic accounts and intercepted auth/cloud HTTP, including real Chromium two-touch input, wheel/buttons, portrait/landscape, both locales, persistent errands and marker relocation. They are not physical Android validation.


## Continuing return, distance and journal revision

`extend-return-path` upgrades existing runs explicitly, so earlier replay does not reinterpret old stopping/spending decisions. The continuing edge grows only as paid travel arrives; known intervals and sparse pebble decoration reveal no future terrain. Shortest authorized route distance to the pending choice drives the discreet map/Story reminder; moving away can increase the distance. Starting/approach transit nodes pass through automatically, while authored decision nodes still stop.

An unaccepted employment conversation reappears at the office even while another exploration destination is selected. A promised errand keeps its inspected state and can be resumed after employment/refusal. No second paid-job acceptance is granted to an already employed run.

New user actions carry UTC timestamps; the unnumbered journal displays local date/time and reverses recorded order. Legacy entries remain undated. Life-accounting events use the observation time and separately name the day concerned. Historical corrections never rewrite story choices or invent dates.
