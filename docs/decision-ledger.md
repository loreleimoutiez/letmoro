# Decision ledger

This ledger resolves important changes during the original design conversation. Read it alongside the complete product specification.

## Settled user decisions

| Topic | Current decision |
| --- | --- |
| Project name | Letmoro; formerly Step-up. Actual project folder renamed to `letmoro`. |
| Protagonist | Moro, fixed name, unspecified gender. Appearance and traits are customizable. |
| Language | All code, commits, documentation, and source text in English; selectable translations planned. Launch translation list remains open. |
| Visuals | Square pixels only in the world, different sizes/colors allowed, very abstract motion, no AI art. |
| Theme | Follows time of day in real time. Earlier dark-default and manual-toggle proposals are superseded; override settings are not currently agreed. |
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
| Standard | Two automatic zero-step rest days weekly, no carryover; emergency pause; account-wide one-time rescue. |
| Hard | One automatic zero-step rest day weekly, no emergency pause, no rescue. |
| Free | No life loss. |
| Mode changes | Both directions allowed, no exclusive hard-mode distinction; cannot undo a final-life outcome. |
| Life loss | Confirmed zero-step days only, after using available rest. Earlier below-threshold loss is superseded. |
| Life recovery | Three consecutive goal-reaching days restore one of three red square lives; protected rest suspends the streak. |
| Emergency pause | Entire game frozen until manual return; lives, progress, and streak preserved; archives readable. |
| Final rescue | Once for the entire account, standard mode only; original run goal reached in one complete day; return with one life. |
| Reboot | Only archives persist. No permanent XP, skills, money, or cosmetic advantages have been approved. |
| Currency | `sous`, including `1 sous`. First gross pay 8, two deductions of 2, net 4; surprise revealed at settlement. |
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
- Monday is the proposed weekly reset, not a separately confirmed calendar rule.
- Goal changes taking effect next day and preserving the cost of ongoing journeys were proposed anti-abuse rules. Final semantics remain open.
- Bonus thresholds such as 110%, 130%, and 150% are illustrative, not final balance values.
- Anonymous letters from vanished people, a dam, the Cinders relay, and other earlier story examples are inspiration, not established lore.
- An unbounded procedural or AI-generated campaign was never approved. Rich authored content and coherent consequences are the direction.

## Important unresolved interactions

- Because only zero steps cost lives, one recorded step protects a day but does not recover lives. Do not silently introduce a higher penalty threshold to prevent this behavior.
- Recovery streaks start again after a life is earned. Decide whether achievement while already at full life can be banked; no banking has been approved.
- Decide mode-change timing and weekly accounting without refreshing allowances through repeated switching.
- Decide emergency pause start/end boundaries and handling of imported steps, including whether suspended players can accumulate travel reserve.
- Decide how to establish a confirmed zero day, allow delayed sync, and handle corrected records after a life outcome.
- Decide free-mode streak handling and whether any life display is meaningful there.
- Decide when the one-day rescue begins, whether the player can decline it, when account usage is consumed, and how interrupted data import is resolved.
- Separate narrative progression, current daily goal, original run goal, and travel reserve; define changes without retroactive exploits or lost progress.
- Alternative accessible effort measurement for people whose movement is not counted as steps requires research and user decisions.
