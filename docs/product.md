# Product specification

Status: agreed direction, with unresolved details explicitly listed in the roadmap. Numerical content estimates are planning targets, not completed content or release promises.

## Identity and platforms

- App name: Letmoro. Public search found no matching app at naming time; this is not trademark clearance.
- Protagonist: Moro, a fixed name without specified gender. Avoid gendered descriptions across translations.
- Naming intent: “let Moro” travel and deliver; “to Moro” as a letter's address and an echo of “tomorrow.” The story is about building a future, not merely counting steps.
- Initial hardware: Samsung Galaxy S23 and Galaxy Fit3.
- Full experience on Android mobile; browser access on desktop with synchronized progress planned.
- Fit3 supplies step data through the phone ecosystem. Do not promise an installable Fit3 narrative app or live cadence access.
- Other wearable integrations and a Wear OS companion are future work.

## Presentation

The world consists exclusively of square pixels, potentially of different sizes and colors. Moro and other characters are single squares. Paths and locations use square pixels, without figurative icons, circles, or detailed illustrations. Abstract, restrained firefly-like pixel motion is welcome.

The current prototype is mobile first, with a pure black background, white pixel text, and Moro as a borderless white square. The initial path is the same width as Moro. The eventual black-square presentation and time-of-day behavior will be designed later. The earlier automatic clock palette is deferred, not active. Use a locally bundled 8-bit-style font and accessible semantic controls.

The main view contains only Moro, a thin 1 CSS px discovered path below the square with no overlap, a menu control, three red life squares at the upper left, and today’s health step count at the lower right. Unavailable counts display an em dash. Coins are displayed at the lower left. No title, name, description, or story prose appears on the map. The menu contains Story, Collection (letters, encountered characters, badges and journal), step connection, and bottom-aligned Settings. Characters remain empty until encountered. Badges hide their titles and descriptions until earned. The first badge is earned by accepting the first job; its satirical description marks becoming visible to society through employment. Only that badge is authored so far. Player-facing simulation controls have been removed; a temporary reset remains in Settings for testing.

## Character and narrative agency

At creation, select exactly three positive and three negative traits, subject to incompatibilities. Traits remain fixed for that run; a reboot permits a new selection. They affect dialogue, advantages, difficulties, and limited automatic initiatives. Letter contents and other characters' motives exist independently of Moro's traits.

Personal decisions are explicit mobile choices. Walking governs travel, exploration, and some challenges. Cadence challenges begin voluntarily after their instructions are read; unreliable measurements never silently select an outcome.

Before travel, choose an intention: deliver, explore, or help. It persists until changed. Traits influence initiatives within that intention, a player-defined spending budget per journey, and an accepted risk limit. Important decisions always wait: opening a letter, romance, political commitment, losing a life, spending a unique item, or closing a major branch. Record automatic actions, their reasons, and costs in the journal.

## Steps and effort

The player directly enters a personal daily step goal. Habit-based suggestions are optional and never imposed. Low goals do not require justification and do not reduce narrative richness. Goal and mode are independent.

Travel costs scale to the personal goal, with different relative effort for different events. Exact ratios remain unbalanced. Exceeding the goal can earn capped, diminishing bonuses; essential story and skills must not require daily overachievement.

Pending decisions retain up to seven daily goals of unused travel steps. Additional steps still count toward daily goals, life recovery, and statistics. Stored steps cannot retroactively complete a new cadence challenge. Present scenes progressively rather than skipping decisions when spending the reserve.

Avoid double-crediting imported steps. Missing or unsynchronized data is not confirmed zero. Day finalization, late corrections, goal changes, travel across time zones, and reserve recalculation need explicit rules and tests before production health integration.

## Modes and lives

Three red squares at the upper left represent lives, maximum three. No heart icons.

| Mode | Weekly automatic zero-step rest days | Emergency pause | Final-life rescue |
| --- | --- | --- | --- |
| Free | No life loss | Details to settle | Not needed |
| Standard | Two, no carryover | Available | Once per account |
| Hard | One, no carryover | Unavailable | Unavailable |

A confirmed zero-step day consumes available rest before costing a life. Merely falling below the goal does not cost a life. Three consecutive goal-reaching days restore one life up to the maximum; then the recovery counter resets. Protected rest suspends the streak. An unprotected below-goal day interrupts it.

Emergency pause freezes all gameplay and narrative timers until manual resumption, preserves progress and recovery streak, and leaves archives readable. Activation boundaries and treatment of subsequent imported steps remain to be specified.

In standard mode, the account's single exceptional rescue requires reaching the run's original daily goal during one full day, restoring the run with one life. Timing, activation, and failure boundaries remain unresolved. Hard mode has a definitive reboot at zero lives.

Modes may change in either direction with no exclusive hard-mode reward. The mode active when the last life is lost determines its resolution; switching afterward cannot bypass it. Switching must not refresh rest allowances or resurrect a lost run; the detailed accounting policy is pending.

Implementation sequence, unresolved boundaries and acceptance tests are tracked in [Lives and reboot](lives-and-reboot.md). These mechanics are not active yet.

Reboot resets gameplay progress, money, skills, relationships, home, and cosmetics. Player archives remain. Rescue is the explicit exception that restores the existing run.

## Economy and skills

Currency is `sous` in French and `coins` in English. The legacy internal `sous` field remains compatible with existing saves. The first delivery earns 8 sous, followed by two unexpected deductions of 2 sous each; take-home pay is 4 sous. Do not reveal the deduction in onboarding before the first settlement.

Money supports appearance customization, a home, and meaningful narrative spending. Avoid ongoing real-time bills while the player is absent. Refusing delivery can cost income but must open worthwhile alternatives rather than make the campaign unplayable.

XP and demonstrated effort unlock a square-pixel skill tree. Skills enable options and practical advantages. Pixel color and understated rendering can be customized; an XP-linked glow is a candidate, not an approved balancing rule.

## Records and discovery

Count delivered letters explicitly. Track every entrusted letter and its fate: delivered intact, opened and delivered, retained, lost, destroyed, or redirected. Count opened-and-delivered letters as deliveries while preserving the separate breach of trust.

Provide a catch-up summary, chronological personal story, letter collection, character records, and known locations. Preserve only player-known information in journal summaries. Show already encountered people at their last known location, not a hidden live location.

The fictional map is independent of GPS. It reveals only observed paths, places, and people, using square pixels. A witnessed unexplored junction can have a short visible stub; unknown regions remain concealed. Support zoom and accessible details. Manual panning does not move Moro; real steps drive travel.

## Campaign ambition

A complete, substantial first campaign is required, not just a public prologue. Latest user target: a prologue, five arcs spanning approximately one real human year, and a personalized epilogue. Earlier six-to-eight-week estimates are superseded. Earlier region, cast, letter and scene counts are obsolete scope estimates, not sufficient commitments for this longer campaign. Validate content volume and pacing through writing and playtests; calendar gating has not been approved.

Every continuing major route must have depth and resolution, including refusal, non-romance, and non-political routes. Early death can shorten a run. Additional content may be downloaded independently of application binaries, with offline caching and compatibility checks. No promise of an infinitely authored story.

## Terminal presentation and phone step trial — 2026-11-05

The visual direction is a minimal terminal: black, pixel text, spare separators, distinct headings and secondary text. The menu shows one vertical navigation list, then one selected page with a back control; closing uses a borderless cross with an accessible name. Moro has a slow 4.8-second opacity pulse, never below 48%, disabled by reduced-motion preference. Synchronizing with the player's heartbeat remains a future possibility, not implemented or permissioned.

Three life squares are currently a fixed display; life accounting is not active. The Android experiment reads today's aggregate through Health Connect with read-steps permission only, with foreground sensor events and a 3-second visible refresh fallback. Data availability depends on the upstream source; exact real-time updates are not promised. Daily import checkpoints and travel credits are persisted locally and reconstructed together through save replay, preventing duplicate credit after restarting. See `health-connect.md` for phone-only setup and validation.

## Current Android entry and map

The user explicitly selected direct Android delivery after considering a PWA. Browser development preview remains useful; there is no PWA install or service worker. A new trial records goal, mode, and exactly three compatible traits of each sign. A terse introduction brings Moro into view and fades in discrete opacity steps. Interface and narrative draft support FR/EN; language preference survives reload. The current trait catalog is a draft and its effects remain unimplemented.

Moro stays in the viewport center as known terrain translates beneath the square. Initial underline: 24 px, the same width as Moro. The first small route progressively reveals a crossing; a few 2 px markers provide movement cues. Dragging and manual camera traversal are disabled by the latest user decision. A growing map supports pinch magnification without movement. No unknown route is rendered. Step-driven return routes and interaction with changed inhabitants, notes, and witnesses require authored scenes and domain events.

The app mark is an underlined black square on white, matching the initial world geometry in inverse colors. Supabase account authentication is implemented; cloud game saves and heartbeat synchronization remain planned work. Health Connect uses local Android authorization.

The balance appears in the lower-left HUD and opens its own detail view; it is not repeated below collections. A small yellow square marks the delivery office only after discovery.

## Onboarding readability

Keep small introduction text in a bounded area above the centered character, with confirmation controls below the path. On short viewports this area scrolls internally instead of overlapping Moro. Display localized descriptions of all difficulty options before selection, with shared zero-day/data/recovery rules and an explicit prototype status. Descriptions explain the intended product without claiming that life loss, emergency pause, or rescue are already implemented.

## Daily crediting and visible movement

One imported step advances one CSS world pixel at normal zoom, capped at the current explicit decision. Trial route lengths equal their goal-scaled step costs in pixels. The initial underline remains 24 px; observed travel extends it. Quest progress uses one current / required steps line; the daily total remains in the HUD and connection details.

The first import records the current daily total; the first quest starts from the origin established after introduction and connection. Per-day/zone daily high-water marks are persisted together with credits through validated event replay. Repeated imports and downward corrections do not grant travel twice, including after restart or after spending reserve. A newly imported day credits its own total; time-zone changes conservatively rebaseline to avoid overlapping periods. These internal rules do not finalize production calendar or life accounting.

The badge list is empty until something is earned; no locked-badge placeholder text. The first-job badge includes an outlined pixel medal. The logo’s square occupies 24×24 units centered in a 64×64 field, with an equal-width 3-unit underline below.

## Account-first entry and quest origin — latest decision

The account entry is the first screen, before gameplay preferences. It has a compact white underlined-square logo at the upper left, “letmoro” to its right, and spacing before the form. Email/password creation and login are supported through Supabase, along with Google in the system browser. Forgotten password is a text action directly below Password in login, not a navigation category. Owner-only provider setup is not part of a player's flow. English is the default; an explicitly selected French setting persists.

After login, setup records goal, mode and three compatible traits of each sign. Four short introduction screens explain carrying the phone, walking/revealing paths and explicit choices, then the post-office objective. Text is smaller and above Moro; Continue/Skip are below. A stepped-fade “Walk…” prompt appears above Moro on entry and clears on movement or timeout.

The first imported daily total can place Moro further along a visible starting path, but it does not complete the new quest. A persisted journey origin is established only after the introduction and step connection. The goal-scaled post-office distance is measured from that origin, beyond the crossing. Quest display is only `current / required steps`. Existing progress is preserved on migration. One accepted step remains one CSS world pixel at normal zoom.

A foreground detector supplies low-latency events after optional physical activity permission, with counter fallback and 3-second visible Health Connect synchronization. Provider totals and live estimates are combined using a maximum rather than addition, then persistent high-water marks prevent replay. Source timing and all overlapping wearable cases are not yet hardware-verified. No life penalties run.

Game progress and health checkpoints are local and separated by account. Supabase handles authentication only; no cloud game/health save exists. Session tokens and PKCE verifier use Android Keystore encryption. The temporary red Reset game action is kept in Settings with confirmation for internal testing; production reboot semantics remain separate. Player-facing trial labels and simulation controls are removed; documentation continues to state incomplete implementation honestly.


## Journey, choices and collections — 2026-11-06

These are approved design requirements, not implemented features.

- Keep the first job-seeking quest as short and easy as the current prototype. Later quests can require several personal daily step goals and span days. Define travel effort relative to the user-selected goal without reducing narrative richness for lower goals.
- Paths may extend vertically and in other directions, using square-pixel geometry. Moro may choose to turn back at any time and travel along already traversed paths using real steps at the same movement rate as outward travel. This supersedes any restriction against choosing a return route; finger dragging still does not move Moro or pay travel costs. Exact mid-route controls and reserve handling remain to design.
- Route choices can lead to different physical paths. Dialogue and letter decisions also have consequences, but whether every such choice should create a physical fork remains an open proposal rather than a requirement.
- Present short narrative text and available choices above Moro when a walking objective unlocks a decision. Players must not have to inspect Story in the menu to discover it. Important decisions still wait for explicit input. Story remains available for rereading. This supersedes the blanket prohibition on map prose.
- Each entrusted, undelivered letter must offer applicable explicit collection actions, including opening and destruction before or after reading. Opening and destruction are distinct events; preserve their history and context-dependent consequences. Further actions such as redirection need authored rules. Delivered letters are historical records rather than items Moro still controls.
- Encountered characters have short branching conversations, including during the first job-seeking quest. Accepting the first letter must explicitly communicate acceptance of paid work.
- Every player choice, including routes, dialogue and letter handling, has one or more consequences proportionate to context and stakes. Consequences can be small or delayed; do not turn every ordinary choice into punishment or reveal hidden outcomes in the journal.
- Character collection uses an unboxed gallery: each encountered character's colored square, name below it, then a brief known role or description. Do not reveal undiscovered identities or information.
- The office visual proposal is a hollow yellow square slightly larger than Moro, with border thickness matching the current yellow marker's side length. Exact sizing and appearance remain to preview; this is not implemented.
- Full story content must stay out of this intended public repository. A separate private content repository is under consideration, not created or authorized for publication. Existing tracked prologue drafts remain in the current repository; no history rewrite has been requested. Content distributed to clients is not guaranteed to remain secret.


## First playable narrative slice — 2026-11-06

The post office offers the territory's only available employment: letter delivery. This supersedes proposed paid errands or alternative jobs with other inhabitants. Refusal must still support meaningful exploration and relationships; the continuing route remains to author.

Implemented in source: arrival decisions above Moro, explicit paid-work acceptance, three optional remembered employment questions when the private opening pack is present, reconsideration after a pause, and collection actions to open/read or confirm destruction of the first undelivered letter. Opening is disabled when its private text is absent. Delivered-opened letters count as deliveries and preserve their opened state. Destruction blocks delivery and wages; an explicit courtyard report records failure. Reading remains known after destruction. Existing intact settlement remains four net coins; no additional financial penalty for opening has been introduced. Further social consequences are not implemented.

Encountered characters now use an unboxed square/name/role gallery, with private names and colors supplied by the opening pack. The office is a hollow yellow 36 px square with a 12 px border. These source changes have not been built or tested on Android in this session. Multidirectional paths, mid-route reversal, additional quests and the full campaign remain unimplemented.


## Internal testing and cloud-save source — latest 2026-11-06

Move reset and intro replay out of Settings into a bottom internal-test toolbar alongside editable coins and fictional-step input. Explicit additions advance gameplay but never alter the real daily health count or health ledger. Coin edits are replayable test events; delivery wages add to the current balance. Development preview enables the toolbar automatically; normal builds omit it unless `VITE_INTERNAL_TOOLS=true`. This supersedes the earlier blanket removal of simulation controls for this testing phase. Reset still confirms before clearing gameplay.

Persist the currently saved gameplay, profile, history, daily health aggregate/checkpoint events and language under the authenticated account in Supabase. The migration, client, reconciliation and conflict UI are implemented behind `VITE_CLOUD_SAVES=true`; the real database is not yet configured or verified. Retain local progress during failures, compare server revisions before writing, and ask which version to continue when devices diverge. No new APK is authorized now. The private manuscript and vertical tree remain local and Git-ignored in this repository for the moment. See cloud-save and narrative-authoring documentation.
