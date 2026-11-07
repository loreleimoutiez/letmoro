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

The main view contains only Moro, a thin 1 CSS px discovered path below the square with no overlap, a menu control, three red life squares at the upper left, and today’s health step count at the lower right. Unavailable counts display an em dash. Coins are displayed at the lower left. Arrival choices and short discovered-place labels are deliberate exceptions to the otherwise spare map; ordinary travel does not show a full story page. The menu contains Story, Collection (letters, encountered characters, badges and journal), step connection, and bottom-aligned Settings. Characters remain empty until encountered. Badges hide their titles and descriptions until earned. The first badge is earned by accepting the first job; its satirical description marks becoming visible to society through employment. First delivery, first opening and first destruction badges are also authored and shown only after their triggering action. No test toolbar, intro-replay controls, fictional-step input, zoom buttons or browser-preview captions are shown. Settings offers a separate explicit confirmed full erasure that keeps the login account. Earned badges briefly appear on the main screen; one persistent contextual thought can replace arrival choices until dismissed.

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

| Mode | Weekly configurable zero-step rest days | Emergency pause | Final-life rescue |
| --- | --- | --- | --- |
| Free | No life loss | Details to settle | Not needed |
| Standard | Two selected weekdays, no carryover | Available | Once per account |
| Hard | One selected weekday, no carryover | Unavailable | Unavailable |

Players select rest weekdays in Settings. Changes take effect the following Monday in the fixed run time zone, with seven days between requests. Preserve schedule history; corrections use the schedule active on that date. Until the first schedule takes effect, retain the legacy automatic allowance. Afterward, only a selected zero-step day consumes available rest; other confirmed zero days cost a life. Merely falling below the goal does not cost a life. Three consecutive goal-reaching days restore one life up to the maximum; then the recovery counter resets. Protected rest suspends the streak. An unprotected below-goal day interrupts it.

Emergency pause freezes all gameplay and narrative timers until manual resumption, preserves progress and recovery streak, and leaves archives readable. Activation boundaries and treatment of subsequent imported steps remain to be specified.

In standard mode, the account's single exceptional rescue requires reaching the run's original daily goal during one full day, restoring the run with one life. Timing, activation, and failure boundaries remain unresolved. Hard mode has a definitive reboot at zero lives.

Modes may change in either direction with no exclusive hard-mode reward. The mode active when the last life is lost determines its resolution; switching afterward cannot bypass it. Switching must not refresh rest allowances or resurrect a lost run; the detailed accounting policy is pending.

Implementation sequence, unresolved boundaries and acceptance tests are tracked in [Lives and reboot](lives-and-reboot.md). Life/rest/recovery now have a tested source reducer ; real penalties await historical-data validation. Pause/rescue/production reboot are not active yet.

Reboot resets gameplay progress, money, skills, relationships, home, and cosmetics. Player archives remain. Rescue is the explicit exception that restores the existing run.

## Economy and skills

Currency is `sous` in French and `coins` in English. The legacy internal `sous` field remains compatible with existing saves. The first delivery earns 8 sous, followed by two unexpected deductions of 2 sous each; take-home pay is 4 sous. Do not reveal the deduction in onboarding before the first settlement.

Money supports appearance customization, a home, and meaningful narrative spending. Avoid ongoing real-time bills while the player is absent. Refusing delivery can cost income but must open worthwhile alternatives rather than make the campaign unplayable.

XP, demonstrated effort and authored choices are intended to unlock a square-pixel skill tree across personal, relational, professional and political life. Skills enable options and practical advantages. Pixel color and understated rendering can be customized; an XP-linked glow is a candidate, not an approved balancing rule.

## Records and discovery

Count delivered letters explicitly. Track every entrusted letter and its fate: delivered intact, opened and delivered, retained, lost, destroyed, or redirected. Count opened-and-delivered letters as deliveries while preserving the separate breach of trust.

Provide a catch-up summary, chronological personal story, letter collection, character records, and known locations. Preserve only player-known information in journal summaries. Show already encountered people at their last known location, not a hidden live location.

The fictional map is independent of GPS. It reveals only observed paths, places, and people, using square pixels. A witnessed unexplored junction can have a short visible stub; unknown regions remain concealed. Support zoom and accessible details. Manual panning does not move Moro; real steps drive travel.

## Campaign ambition

A complete, substantial first campaign is required, not just a public prologue. Latest user target: a prologue, five arcs spanning approximately one real human year, and a personalized epilogue. Earlier six-to-eight-week estimates are superseded. Earlier region, cast, letter and scene counts are obsolete scope estimates, not sufficient commitments for this longer campaign. Validate content volume and pacing through writing and playtests; calendar gating has not been approved.

Every continuing major route must have depth and resolution, including refusal, non-romance, and non-political routes. Early death can shorten a run. Additional content may be downloaded independently of application binaries, with offline caching and compatibility checks. No promise of an infinitely authored story.

## Current implementation — 0.2.0

See [gameplay status](gameplay-status.md) for the bounded implemented opening and verification. It adds twenty distinct letters and seven recurring-character conversations, explicit trust/friendship and witnessed/delayed consequences, optional return reports/private gifts, thirty contextual persistent thoughts and twelve further badge conditions. A refusal route supports the ten personal requests without alternative employment. Letter capacity is three for campaign items. First-job pay and easy route remain intact.

Supabase owner-only migration is deployed; ignored local configuration enables synchronization. Real-account cross-device verification remains pending. Test/reset/replay UI is removed. Pinch/wheel/keyboard zoom remains and scales Moro, without zoom buttons or percentages. The five arcs/year-long campaign, numerical trait/skill effects, pause/rescue/reboot and production account controls remain unfinished. No public release is authorized.


## Explicit full erasure — 0.2.1

Latest user decision: allow a full fresh start, deleting game data including paths, letters, badges, journal, relationships, profile/settings and local conflict backup while retaining Supabase Auth identity/password/session. This explicit Settings action is distinct from the still-deferred archive-preserving narrative reboot. It intentionally keeps no game archive. It requires confirmation and, when cloud saving is enabled, a successful online null-payload revision before local cleanup. Failed network/CAS writes preserve the local game for retry. Other devices with stale revisions cannot silently restore the erased snapshot. No Auth row or physical Health Connect data/permissions is deleted. Language resets to English; setup returns.

A fresh-start replay marker baselines existing daily health steps instead of reconstructing the previous path; only subsequent increments supply new travel. The actual phone's daily health counter is not falsified or erased. The user authorized a temporary LAN-only APK download for their phone on the same Wi-Fi; no public publication or device install is performed by the agent.

## Home-screen widget and source transparency

The Android widget previews Moro's actual saved location on discovered route segments, with remaining objective distance or daily steps/goal. It opens the app on tap and displays the snapshot time. Account changes/erasure remove stale account imagery. No unknown places, bodies or future choices are exposed. The current implementation uses foreground app snapshots, not an independent background game engine.

Step-connection details distinguish the Health Connect aggregate from combined foreground phone estimates and report whether Samsung Health data contributed. Owner-observed Samsung/Letmoro divergence remains to diagnose physically. Samsung-specific SDK and notification mirroring research is documented separately; neither is silently enabled.

## Encounter readability and tour reminders (November 7)

Encounters temporarily use the full viewport, with a participant strip, scrollable main reading area and a persistent return-to-path action. Closing the encounter preserves the decision; it can be reopened from the map. A new stage, location or selected letter reopens it. Campaign letter offers are individually expandable; their heading identifies sender and recipient without revealing sealed contents.

An active walking objective has a compact map reminder and a fuller Story card: purpose, destination, remaining travel and current or suggested direction. Guidance uses authorized roads only and does not unlock shortcuts. Choosing a letter as the objective does not itself choose a walking direction. The Android widget adds a cached tour notebook (letters carried and optional returns) alongside its route preview and distance/day summary. It is not a live background simulation.

XP is a spendable, persisted currency, independent of trust. Current balance is visible below the lives and opens the skill tree. Basic respect is unlocked by accepting employment. Three connected branches (craft, relationships, community) each reveal two alternatives at the current tier; buying one permanently selects it for that run and reveals the next pair. Only acquired nodes and available alternatives are visible. The current implementation has two tiers per branch: 20 XP then 45 XP, twelve authored skill alternatives and six possible purchases per run. This is an opening progression tree, not the complete political/romantic skill system. All advertised bonuses are wired to gameplay; see `src/domain/skills.ts` and localized descriptions.

Rewards: first delivery 12 XP; an honestly closed failed first delivery 6; unpaid errands 35/40; campaign deliveries 18–43 by mission progression (the longer private delivery gives 45); honest successful return reports 8, honest destroyed-letter reports 3; returning an undelivered letter 4; first campaign visits 5; first friendship with each person 10. The special successful private return retains its separate 25 XP. Purchased skills can add bonuses. Declining offers, repeatedly looking/talking, destroying letters, lying and spending steps do not award XP. Failed/declined outcomes do not earn the delivery award. Existing events replay into the new reward rules, so earlier accomplishments receive their base XP automatically; future skill bonuses are never applied retroactively. Purchases subtract the balance and track spent XP through a validated event, preventing duplicate purchases, bypassed prerequisites and repeated friendship farming.


## Secondary paths — first implementation

A secondary entrance can be learned on a road already walked. Learning is an explicit saved event; it neither spends travel steps nor moves Moro. New junctions stop travel for a direction choice. Existing distances and walked geometry are preserved by event-time graph migration. A fallback attaches the branch to an endpoint when a very small goal would otherwise produce a zero-length segment.

The first secondary loop adds two personal letters with separate acceptance and completion, plus direct-conversation/no-further-promise alternatives. Its base delivery rewards are 32 and 18 XP. These requests do not contribute to the original round's letter-unlock count or add mandatory conditions to its ending. Letter privacy, capacity, trust and reports remain consistent with the existing campaign. No new employment, timed obligation or badge is introduced.


## Language arrival and return encounters — 0.6.0

Before account, setup, health invitation or intro, a fresh installation without a valid device language presents Français/English with no preselected default. Selection persists; returning installations keep their saved language. Account landing and Settings allow changes. An explicitly chosen language has session priority when restoring cloud content; existing explicit full erasure still resets setup language to English.

Encounters use 12 px prose and 11 px choices, retain 44 px touch targets, and use one primary content scroller. Objective/direction and delivery confirmations are not repeated alongside equivalent scene text. Completed conversations and round closure remain available through collapsed reread controls.

Returning can reveal a specific follow-up after its prerequisite delivery, rather than replaying an identical introductory conversation. Three new localized follow-ups are implemented. Actual movement followed by arrival is required, with temporal ordering after the relevant delivery and one saved response. A short greeting is a valid option; there is no new promise or automatic XP. Other destinations need not produce new content on every visit. Existing report/reward/consequence interactions remain available independently.
