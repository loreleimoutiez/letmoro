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

The main view contains only Moro, a thin 1 CSS px discovered path below the square with no overlap, a menu control, three red life squares at the upper left, and today’s health step count at the lower right. Unavailable counts display an em dash. Coins are displayed at the lower left. No title, name, description, or story prose appears on the map. The menu contains Story, Collection (letters, encountered characters, badges and journal), step connection, and bottom-aligned Settings. Characters remain empty until encountered. Badges hide their titles and descriptions until earned. The first badge is earned by accepting the first job; its satirical description marks becoming visible to society through employment. Only that badge is authored so far. Trial simulation controls remain in a separate menu section.

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

Reboot resets gameplay progress, money, skills, relationships, home, and cosmetics. Player archives remain. Rescue is the explicit exception that restores the existing run.

## Economy and skills

Currency is `sous` in French and `coins` in English. The legacy internal `sous` field remains compatible with existing saves. The first delivery earns 8 sous, followed by two unexpected deductions of 2 sous each; take-home pay is 4 sous. Do not reveal the deduction in onboarding before the first settlement.

Money supports appearance customization, a home, and meaningful narrative spending. Avoid ongoing real-time bills while the player is absent. Refusing delivery can cost income but must open worthwhile alternatives rather than make the campaign unplayable.

XP and demonstrated effort unlock a square-pixel skill tree. Skills enable options and practical advantages. Pixel color and understated rendering can be customized; an XP-linked glow is a candidate, not an approved balancing rule.

## Records and discovery

Count delivered letters explicitly. Track every entrusted letter and its fate: delivered intact, opened and delivered, retained, lost, destroyed, or redirected. Count opened-and-delivered letters as deliveries while preserving the separate breach of trust.

Provide a catch-up summary, chronological personal story, letter collection, character records, and known locations. Preserve only player-known information in journal summaries. Show already encountered people at their last known location, not a hidden live location.

The fictional map is independent of GPS. It reveals only observed paths, places, and people, using square pixels. A witnessed unexplored junction can have a short visible stub; unknown regions remain concealed. Support pan, zoom, and details through accessible companion controls.

## Campaign ambition

A complete, substantial first campaign is required, not just a public prologue. Planning target: six to eight weeks at moderate activity, prologue, five acts, personalized epilogue, roughly four regions, twenty places, ten to fifteen recurring characters, thirty to forty authored letters, and 150–200 scenes across all routes. Validate these targets through writing and playtests.

Every continuing major route must have depth and resolution, including refusal, non-romance, and non-political routes. Early death can shorten a run. Additional content may be downloaded independently of application binaries, with offline caching and compatibility checks. No promise of an infinitely authored story.

## Terminal presentation and phone step trial — 2026-11-05

The visual direction is a minimal terminal: black, pixel text, spare separators, distinct headings and secondary text. The menu shows one vertical navigation list, then one selected page with a back control; closing uses a borderless cross with an accessible name. Moro has a slow 4.8-second opacity pulse, never below 48%, disabled by reduced-motion preference. Synchronizing with the player's heartbeat remains a future possibility, not implemented or permissioned.

Three life squares are currently a fixed display; life accounting is not active. The Android experiment reads today's aggregate through Health Connect with read-steps permission only, refreshing every 15 seconds while visible and when returning. Data availability depends on the upstream source; exact real-time updates are not promised. Real health observations remain in memory, separate from simulated story progress. See `health-connect.md` for phone-only setup and validation.

## Current Android entry and map

The user explicitly selected direct Android delivery after considering a PWA. Browser development preview remains useful; there is no PWA install or service worker. A new trial records goal, mode, and exactly three compatible traits of each sign. A terse introduction brings Moro into view and fades in discrete opacity steps. Interface and narrative draft support FR/EN; language preference survives reload. The current trait catalog is a draft and its effects remain unimplemented.

Moro stays in the viewport center as known terrain translates beneath the square. Initial underline: 24 px, the same width as Moro. The first small route progressively reveals a crossing; a few 2 px markers provide movement cues. Dragging revisits known portions without spending steps or changing narrative events; a growing map supports pinch zoom and keyboard companion controls. No unknown route is rendered. The current revisit is map navigation only; interaction with changed inhabitants, notes, and witnesses requires authored return scenes and domain events.

The app mark is an underlined black square on white, matching the initial world geometry in inverse colors. Accounts/authentication and heartbeat synchronization are planned work. The app currently has neither a backend nor account credentials. Health Connect uses local Android authorization.

The balance appears in the lower-left HUD and opens its own detail view; it is not repeated below collections. A small yellow square marks the delivery office only after discovery.
