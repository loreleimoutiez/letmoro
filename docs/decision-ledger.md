# Decision ledger

This ledger resolves important changes during the original design conversation. Read it alongside the complete product specification.

## Settled user decisions

| Topic | Current decision |
| --- | --- |
| Project name | Letmoro; formerly Step-up. Actual project folder renamed to `letmoro`. |
| Protagonist | Moro, fixed name, unspecified gender. Appearance and traits are customizable. |
| Language | All code, commits, documentation, and source text in English; selectable French and English translations are the current scope. |
| Visuals | Square pixels only in the world, different sizes/colors allowed, very abstract motion, no AI art. |
| Theme | Latest revision: white square and white pixel text on black for this prototype; time-of-day behavior deferred. This supersedes the earlier active clock palette. |
| Genre | Letter-delivery narrative adventure, quiet most of the time, discreet fantasy, earned full emotional range. |
| Motivation | Earn a living, independence, stability, and meaning after an unspecified difficult past. |
| Origin | A shared motivation is fixed; whether separate selectable origins remain necessary is unresolved. Do not invent a contradictory backstory. |
| Personality | Exactly three positive and three negative traits, fixed per run, selectable again on reboot. |
| Trait effects | Dialogue, advantages/disadvantages, and bounded automatic initiatives; traits do not rewrite the letters themselves. |
| Decisions | Explicit personal choices on mobile; steps govern travel, exploration, and viable challenges. |
| Automation | Combine persistent travel intention with traits, authorized budget, and accepted risks. Important decisions wait. |
| Daily goal | Player enters it; later adjustment suggestions are optional. |
| Accessibility | Adapt effort without reducing story richness; do not require proof of disability. |
| Reserve | Seven daily goals of steps while decisions wait; excess still serves daily goals, life recovery, and statistics. |
| Standard | Two chosen zero-step rest weekdays weekly, no carryover; emergency pause; account-wide one-time rescue. |
| Hard | One chosen zero-step rest weekday weekly, no emergency pause, no rescue. |
| Free | No life loss. |
| Mode changes | Both directions allowed, no exclusive hard-mode distinction; cannot undo a final-life outcome. |
| Life loss | Confirmed zero-step days only, after using available rest. Earlier below-threshold loss is superseded. |
| Life recovery | Three consecutive goal-reaching days restore one of three red square lives; protected rest suspends the streak. |
| Emergency pause | Entire game frozen until manual return; lives, progress, and streak preserved; archives readable. |
| Final rescue | Once for the entire account, standard mode only; original run goal reached in one complete day; return with one life. |
| Reboot | Only archives persist. No permanent XP, skills, money, or cosmetic advantages have been approved. |
| Currency | `sous` in French, `coins` in English. First gross pay 8, two deductions of 2, net 4; surprise revealed at settlement. |
| Political route | M le Maudit / M the Accursed can become central antagonist; opposition is optional. |
| Romance | Several deep optional routes with importance comparable to political content. |
| Private-life route | Building a life and choosing personal projects supports players pursuing neither politics nor romance. |
| Records | Delivery counter, letter outcomes, personal chronology, catch-up, characters, discovered places. |
| Map | Fictional, mobile-accessible, discovered paths/places/people only, last known character locations. |
| Campaign | Rich and long on all continuing major routes; early death remains possible. Expansions are additional content, not required to complete the first campaign. |
| Hardware | Galaxy S23 and Galaxy Fit3 initially; complete mobile experience accepted; broader models later. |
| Delivery conventions | Professional public-ready code and documentation; Conventional Commits. |

## Proposals to validate, not promises

- Campaign counts and six-to-eight-week duration are assistant planning estimates, not finished writing or measured playtime.
- The first paid delivery as a short local trial and exact English dialogue are draft staging, not a completed approved script.
- Housing, customization, and narrative spending are the proposed uses of sous; exact prices, ownership, furnishings, and inventory rules are not designed.
- Skill-tree categories and unlock requirements are examples. Color customization is intended; XP-linked glow remains an idea.
- Monday at midnight in the fixed run time zone is confirmed. Rest changes start the following Monday, with seven days between requests.
- Goal changes taking effect next day and preserving the cost of ongoing journeys were proposed anti-abuse rules. Final semantics remain open.
- Bonus thresholds such as 110%, 130%, and 150% are illustrative, not final balance values.
- Anonymous letters from vanished people, a dam, the Cinders relay, and other earlier story examples are inspiration, not established lore.
- An unbounded procedural or AI-generated campaign was never approved. Rich authored content and coherent consequences are the direction.

## Important unresolved interactions

- Because only zero steps cost lives, one recorded step protects a day but does not recover lives. Do not silently introduce a higher penalty threshold to prevent this behavior.
- Recovery streaks reset after a life is earned; no banking at full life is allowed.
- Decide mode-change timing and weekly accounting without refreshing allowances through repeated switching.
- Decide emergency pause start/end boundaries and handling of imported steps, including whether suspended players can accumulate travel reserve.
- Complete fixed-zone days have a 24-hour sync grace; unknown/incomplete days are protected and late corrections recompute life outcomes. Native historical data still needs physical validation.
- Free mode keeps three lives and no recovery bank. Mode switching remains unresolved.
- Decide when the one-day rescue begins, whether the player can decline it, when account usage is consumed, and how interrupted data import is resolved.
- Separate narrative progression, current daily goal, original run goal, and travel reserve; define changes without retroactive exploits or lost progress.
- Alternative accessible effort measurement for people whose movement is not counted as steps requires research and user decisions.

## Latest binding implementation decisions — 2026-11-06

- The post office is the territory's only available employer. Personal letter favors may bring private untaxed thank-you gifts, not another job. Keep the easy first work quest and explicit job acceptance.
- Route travel and returns cost real steps, one world pixel per step. Multi-directional choices and a tiny compass; unavailable directions grey. Backward travel can continue beyond arrival. No finger-drag travel. Pinch/wheel/keyboard zoom scales Moro; remove all zoom buttons and percentages.
- Above-Moro decisions and branching conversations. Details temporarily replace initial choices. Opening/destruction of held letters are explicit and retain distinct history; delivered letters cannot be altered. Consequences depend on witnesses/context and may be delayed. Recurring inhabitants lead the story.
- Character gallery: square/color, name, known role. Map hollow square at last actual encounter and smaller traces at earlier places, never hidden live location. Short visited-place labels; square pebbles recur along walked paths.
- First letter action badges and more discovered-only badges; brief fading earned feedback. Basic respect after postal employment, future skill nodes hidden. Political/relational/professional/personal skills remain intended; advanced political commitments require explicit choices and consequences.
- One persistent thought at a time until explicit dismissal, no offline backlog. Context reflects known encounters and current friendships. Long quests have discreet remaining-distance feedback; detours count. Journal newest-first, no numbering, real local timestamps for new events.
- Three lives; 24-hour grace; fixed run zone; Monday week. Rests are configurable weekdays (2 Standard, 1 Hard), effective next Monday, seven days between changes. Missing data never means zero. Corrections rebuild outcomes using the schedule active on that day. Life/rest/recovery first; pause/rescue/production reboot remain deferred.
- Health connection invitation before Walk if not already authorized. No browser-preview captions or simulator/reset/replay UI in the requested APK. Normal coins/steps return to their standard positions.
- Private manuscript and vertical authoring tree stay in this repo's ignored directory for now. No private remote creation/publication. Local client builds include their text; Git ignore is not a manuscript backup.
- Database persistence explicitly authorized. Supabase is connected on the correct owner account; verified hosted player_saves migration applied. Owner-only access verified remotely without player records. Local cloud enabled; real account/device round trip remains pending. No server key or credential is committed.
- Finish source, tests, documentation and local Conventional Commits, remove test UI, then build the APK. This supersedes earlier no-APK/testing-toolbar instructions. No push/publication/license is authorized. Five arcs over approximately a real year remain an authoring target; the current expanded opening is not the finished public campaign.
