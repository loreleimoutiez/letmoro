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
| Standard | Two automatic zero-step rest days weekly, no carryover; emergency pause; account-wide one-time rescue. |
| Hard | One automatic zero-step rest day weekly, no emergency pause, no rescue. |
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

## Interface revision — 2026-11-05

The latest user direction supersedes the earlier decorated two-column interface: mobile-first map, borderless Moro square, black background, white pixel typography, a 1 CSS px path below Moro without overlap, and no visible map prose or counters. Story and records move into an openable menu. Encountered characters start empty. Badge names and descriptions stay secret until unlocked; accepting the first job earns the first badge. The other badges and readable letter contents are not authored yet. English currency is now coins; French remains sous. Time-of-day design is postponed.

## Terminal and live-status revision — 2026-11-05

The user requests three red life squares at the upper left, a health step counter at the lower right, and a minimal terminal appearance. These are deliberate exceptions to the earlier counter-free main view. Moro should slowly vary opacity without disappearing; real-heartbeat synchronization is a possible later idea. Menu navigation must be separated and readable, closing uses a borderless cross, and headings/status/body text require visual hierarchy. Phone-only health testing is authorized; the selected Android step-import route is Health Connect with local permissions, not a Google account login. No health penalties or automatic narrative credit are introduced by this read-only experiment.

## Onboarding, map, and platform revision — 2026-11-05

The final platform decision is a direct Android application. A PWA was considered, then explicitly superseded; retain shared React UI, Capacitor Android, and Kotlin health access, with browser preview for development. Do not implement a Google account login as a substitute for Health Connect device permissions.

Coins belong at the bottom left; health steps at the bottom right. Moro stays centered while the terrain moves. The initial path and square share the same width. The mark is a black square above a same-width thin black underline. Previously walked paths remain freely revisitable; undiscovered branches remain invisible. Pan/pinch navigation is needed as the known map grows. Sparse tiny square stones or grass may communicate motion. Return encounters can involve absent characters, notes, or witnesses; these are directions to author, not existing scenes.

New runs ask for daily goal, difficulty, three positive and three negative compatible traits. Follow setup with a short stepped-fade “Meet Moro” and a few restrained lines about building a life, then the first objective. FR and EN are the current settings languages. Remove the menu caption and numbering, use restrained pixel icons, group records, and keep Settings at the bottom. The trial trait catalog and conflicts are draft content; setup is persisted but difficulty/traits do not affect mechanics yet.

Near-instant physical movement is desired. Health Connect aggregate refresh alone cannot guarantee per-step latency; direct foreground sensor feedback and safe reconciliation remain a distinct next implementation. Heart-rate feedback and secure player accounts are future capabilities, without additional permissions, credentials, backend, or identity provider selected so far.

## Balance and discovered office correction

Do not repeat the balance beneath every collection. Keep it at the lower-left HUD with a dedicated detail view. Mark the discovered delivery office with a small yellow square, separated from Moro and the path. The user is preparing a USB S23 test; wait for readiness before installation.

## Step-only movement supersedes manual revisiting — 2026-11-05

Latest correction: do not move the path by finger drag or manual return controls. Only real steps drive production Android movement; pinch is magnification only. The office marker lies beyond the crossed intersection, not on it. Geometry places the intersection at 112 and the office at 160 trial units, with the office revealed only after the explicit crossing.

Phone detection initially showed Samsung MTP but no ADB. After the user enabled debugging, Samsung disappeared even from host `lsusb`; reconnection/data-mode assistance is pending. Do not claim physical install/import success.

The internal step-credit experiment establishes a current-day/zone session baseline. Positive deltas above a session high-water mark add travel credits; equal, missing, or downward-corrected reads do not. Day/zone change and reload rebaseline without historical credit. Raw daily totals stay in memory; accepted increments are saved as health-source gameplay credits. This is trial behavior, not settled production calendar/offline reconciliation. Simulated-step buttons are development-browser-only and absent from the Android production build.

## Daily import and map scale — 2026-11-05

The user reported that Health Connect displayed a daily total while travel remained at zero. The old session-baseline rule caused this; it is superseded. Today’s steps now count on the first import. Per-day/zone high-water marks are stored atomically with narrative credits so reload, repeated reads, and spent travel cannot double-credit the same steps. Missing data does nothing and corrections do not reverse narrative events. Zone changes rebaseline conservatively. Legacy credits without dates are conservatively deducted from the first import and can under-credit when old credits span several days; this is a prototype migration limitation, not a production calendar rule.

Map rule: one step equals one world CSS pixel at 1× zoom. Route lengths derive from their existing goal-scaled travel costs, and movement stops at explicit decisions. The office remains beyond the crossing. Today’s count and spendable travel reserve are labeled separately in Story.

Hide locked badge entries entirely, without “secret badge” text. The earned first-job badge has a small square-pixel medal. The mark has a smaller centered square and a 3-unit underline of equal width in its 64-unit coordinate space, consistently rendered as SVG, PNG, and Android vector.

Health permission rationale now accurately describes locally persisted daily checkpoints. No user-provided step total, pairing code, private network address, or imported health record is to be added as repository content; tests use independent synthetic observations.

## Entry, rapid steps, accounts, and presentation — latest revision

The previous “all imported steps immediately count toward the first quest” proposal is superseded. Existing daily activity may lengthen the initial path, while the first quest starts from a saved origin after both meeting Moro and connecting steps. Progress reads `0 / required steps`, with one CSS world pixel per accepted step. Remove the coin marker. Default to English while preserving explicit FR selection.

Account creation/login now comes before preferences. Supabase Auth was selected and configured locally with public client values; the owner enabled email confirmation and Google and added the native callback. Provider settings are owner setup only, never required of players. Actual Google and email device round trips remain unverified. Game saves are separated per account locally, not synchronized to a backend. Never commit live project values, OAuth client secrets, tokens or user health records.

Latest layout: smaller intro text above Moro, validation controls below, manual Continue rather than timed narrative progression, and a fading “Walk…” cue after the introduction. Account-page branding is a smaller white-on-black logo at upper left with “letmoro” on its right and added spacing below. Forgot password is only a clickable text action under Password in login. The auth logo is branding, distinct from the in-world character layout.

Remove player-facing trial language and simulation controls, keeping a temporary red Reset game control in Settings with confirmation. Retain truthful internal-milestone documentation. Native foreground detector events and a slower counter fallback replace reliance on a 15-second poll; activity permission is separate from Health Connect. Accounts use PKCE and encrypted Android sessions. No publication, public license or contact with third parties was authorized.
