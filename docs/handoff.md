# Session handoff

Updated 2026-11-07. Source version 0.6.0 / Android versionCode 10. Read this file, product, narrative, decision ledger and roadmap before implementation. Older milestones are in Git history.

## Instructions and authorization

Respond in French. Code, source prose, documentation and Conventional Commits in English; FR translations are intentional. Moro has no specified gender. Square-pixel visuals only; no AI art. React/TypeScript/Vite, Capacitor Android, Kotlin Health Connect. Do not publish, push, choose a public license, contact others or delegate without authorization. Local work and focused commits are authorized. Do not commit credentials, personal health records or private manuscripts.

Latest user authorization: finish a richer playable opening, update docs/commits, remove every internal test control and browser-preview caption from the UI, then build an APK. Earlier “no APK” instructions are superseded. Supabase migration was explicitly authorized and is now applied; do not ask again.

## Settled rules

- The post office is the territory's only available employer. Other inhabitants offer personal favors and possible private thank-you gifts, not alternative wages.
- Easy first quest; later journeys scale to the personal goal and can span days. One step per world pixel. Steps pay returns too; finger dragging never moves Moro. Reserve capped at seven goals. Automatic travel stops for decisions/junctions.
- Important choices are explicit. Letter contents exist independently of personality. No secret knowledge appears merely because a hidden action happened.
- Five major arcs target approximately one human year. The current opening is a playable milestone, not that complete public campaign.
- Lives: three maximum; confirmed zero only, never missing data; 24-hour grace after complete fixed-zone days; incomplete first day protected; late corrections rebuild outcomes. Three goal days recover one life, protected rest suspends the streak, no banking at full life. Free has no loss.
- Rests: two Standard, one Hard. User chooses weekdays in Settings; changes effective next Monday, seven days between requests. Before a first schedule becomes effective, legacy automatic allowance applies. Preserve schedule history for corrections. Pause/rescue/production reboot and mode-switch timing remain deferred.

## Implemented source

Account-first email/Google PKCE, recovery and encrypted native sessions; EN/FR; goal/mode/compatible traits; four-screen intro; conditional Health Connect invitation and Walk cue. Today's provider total and optional foreground sensor use maximum overlap, then saved high-water marks deduplicate travel. Missing totals are unknown. Baseline after intro avoids spending earlier daily steps on the first quest.

Opening work/refusal dialogue, first letter sealed/opened/destroyed outcomes and net four-coin settlement remain compatible. Two unpaid neighborhood errands survive. Campaign stage adds twenty distinct letters (ten postal, ten personal), seven character conversations, capacity three, goal-scaled routes and a cross-connection. Every request can be accepted or declined; held items can be opened, destroyed or returned. Delivery requires actual visited destination. Reports are optional separate return trips. Witnessed broken seals and truthful/false reports affect bounded trust; contradictions require later progress and returning to the sender. Friendship is explicit at trust three and breaks below zero; earned friendship badge persists. Personal gifts are untaxed and paid once on reporting. Detailed plots/bodies stay private.

Thirty localized thoughts, filtered by known situation. One pending thought persists until dismissal and replaces main arrival choices temporarily; Story remains available. Dismissal marks current travel, preventing backlog. Unseen suitable thoughts are prioritized; after exhaustion, spaced repeats avoid immediately repeating the last thought. Unique thought archive remains readable in Journal.

Four original plus thirteen campaign badge conditions, brief five-second earned feedback. Basic respect, earned through postal employment, roots three spendable-XP branches with two revealed choices per tier; two tiers per branch are implemented. Latest encounter hollow markers, historical traces, visited place labels and abstract discovered-location squares. No live NPC tracking. Pinch/wheel/keyboard zoom, proportional Moro, square pebbles, no zoom UI. Journal newest-first with local timestamps; older undated entries stay undated.

Normal coin/step counters restored. Test toolbar source removed, intro replay absent, internal-tools flag removed. An explicit confirmed full erasure is now available in Settings. Synthetic legacy events remain decodable and automated tests still use domain fixtures; no simulation UI is shipped. No browser-preview caption remains in UI copy.

## Persistence and Supabase

`supabase/migrations/20261106105934_player_saves.sql` applied to the verified hosted project via the owner-connected Supabase integration. Public schema was empty. Remote checks verified owner RLS, denied anonymous table/RPC access, rejected foreign-owner RPC calls, SECURITY INVOKER and safe search path. Tests used transaction-local synthetic claims and rollback, no player records. Security advisor only flags disabled leaked-password protection; Auth configuration was not changed.

Ignored `.env.local` contains public client configuration and VITE_CLOUD_SAVES=true. Example remains false for unconfigured checkouts. Snapshot covers profile, events, navigation, letter outcomes, relationships, thoughts, life calendar/schedules, health checkpoints and language. Revision RPC protects stale writes; conflicts require explicit selection and retain a device backup. Offline local preservation/retry and reset tombstones remain supported. Real-account cross-device/email/OAuth verification is still pending. Never claim it is device-tested.

Content generation prologue-9, schema 1, older prologue-1/2/3/4/5/6/7/8 accepted by deterministic replay. Private pack `src/content/private/opening.json`, vertical `tree.txt` and `skills-tree.txt` are ignored and required for the richer narrative. No private repository/backup exists; do not force-add them. APK includes local text by design. Generic checkout supports the first delivery without this manuscript.

## Verification and environment

Node 22/npm 10, JDK 21, SDK 36. Temporary SDK `/tmp/letmoro-android-sdk`, Gradle `/tmp/letmoro-gradle`; ignored android/local.properties points to SDK. Existing debug keystore remains outside Git. Native history now compiles; actual S23/Fit3 history/midnight/correction data still requires physical validation. VITE_LIFE_RULES=false remains deliberate.

Latest checks and APK status are recorded in gameplay-status.md. Browser tools/scripts/screenshots are under `/tmp/letmoro-qa/`, not shipped UI. Prior scripts referring to removed toolbar/buttons/captions need adaptation. Current campaign.cjs tests synthetic account/cloud restore, dialog replacement, letter collection, badge feedback, rest settings and zoom/FR/landscape. No real account or personal health records were used.

## Next

Complete physical acceptance checks, tune pacing, extend authored encounters and skill/trait effects, settle pause/rescue/reboot and goal/mode switching, implement account export/deletion/retention and durable private-content backup. Multi-day closed-app travel reconciliation and replay compaction still require design; today's import is not proof of all historical/offline travel. See gameplay-status and roadmap. Never equate missing history with zero.

## Previous internal artifact — 0.2.0, 2026-11-06

59 behavioral tests, TypeScript, synthetic browser campaign/letter/privacy/thought/rest/cloud/gesture checks, manuscript-included and generic production builds, three native unit tests, Android lint and final assembleDebug passed. Seven non-blocking Android lint warnings and the Vite main-chunk warning remain. APK 0.2.0 / versionCode 5 generated at android/app/build/outputs/apk/debug/app-debug.apk, signature verified, public backend values and local manuscript checked in packaged assets without printing client values. Existing external debug keystore reused; no phone install/distribution performed. SHA-256 and limitations are in gameplay-status.md.


## Explicit full erasure — 0.2.1

Latest user decision: allow a full fresh start, deleting game data including paths, letters, badges, journal, relationships, profile/settings and local conflict backup while retaining Supabase Auth identity/password/session. This explicit Settings action is distinct from the still-deferred archive-preserving narrative reboot. It intentionally keeps no game archive. It requires confirmation and, when cloud saving is enabled, a successful online null-payload revision before local cleanup. Failed network/CAS writes preserve the local game for retry. Other devices with stale revisions cannot silently restore the erased snapshot. No Auth row or physical Health Connect data/permissions is deleted. Language resets to English; setup returns.

A fresh-start replay marker baselines existing daily health steps instead of reconstructing the previous path; only subsequent increments supply new travel. The actual phone's daily health counter is not falsified or erased. The user authorized a temporary LAN-only APK download for their phone on the same Wi-Fi; no public publication or device install is performed by the agent.

0.2.1 verification: 61 behavioral tests and TypeScript pass. The synthetic browser reset regression covers cancellation, failed network preservation, retry, cloud tombstone, local backup erasure, retained Auth, reload and a fresh new run. Final Android 0.2.1 / versionCode 6 build and APK signature verification passed; packaged web assets match the final build. SHA-256: `f08a10cef7121c9f7003ca94df7b87fbecc04dc535179fa7c8e713ae1a26ce2a`. An isolated APK-only temporary Wi-Fi download is authorized; no phone installation is claimed.

The owner confirmed downloading and installing the 0.2.1 update on the phone over local Wi-Fi. This confirms the update installation only; actual reset, cloud round trip and historical health validation are not yet confirmed. The temporary download server is stopped after delivery.

## Android surfaces and personal-return revision — 2026-11-07

User chose a native widget showing Moro on the discovered local route, remaining steps while following a quest, otherwise daily steps/goal. Source implements a bounded square-only bitmap in RemoteViews, tap-to-open, last-seen timestamp, five-second foreground snapshot publishing and periodic stored-state repaint. It is not independent background health import/progression. Snapshot excludes Auth identity/tokens, full saves, letters and unknown map content; clear/publish calls are ordered across sign-out/reset/account changes. Launcher placement/resizing needs a phone test.

Personal return variants are implemented through a new explicit replay event, an exclusive unopened-delivery badge, a one-time private reward (+5 coins, +2 trust, 25 XP) and an alternate witness. XP is a saved balance only; no new skill effects. Branch prose is private. Old report events remain replayable and do not receive the new reward again. Later addressed letters use the witness when appropriate, with the actual delivery recipient preserved in history.

Owner says Samsung Health already matches Fit3 but Letmoro lags. The issue is not established fixed. New in-memory diagnostics expose Health Connect provider total/read time and Samsung Health origin separately from the combined phone estimate; an explicit button opens Samsung Health. No new health permission, vendor SDK, direct band connection or punitive rule was added. Official-source research and acceptance steps are in fit3-and-samsung-health.md. Samsung direct data access is possible with development/partner constraints; Fit3 can mirror ordinary Android notifications through Galaxy Wearable, but Letmoro does not post game notifications yet. No partner request, company contact, public publication or vendor binary was added.

0.3.0 checks: TypeScript, 67 behavioral tests and synthetic browser checks for both optional returns pass. Native compilation, three Kotlin unit tests and Android lint pass. Launcher rendering/resizing, actual widget refresh and the Samsung/Health Connect mismatch still require physical validation. The initial native attempt lacked SDK 36/build tools; after restoring those temporary tools, the checks passed.

0.3.0 APK / versionCode 7 assembled and signature-verified. Packaged web assets match the final build, include the ignored local return scenes/badge text, and include native widget resources. SHA-256: `fbc5be93756b5be0bd047b60a24db8c017e533c692cbf4b3c24fa7ab8c21f268`. The owner’s previous Wi-Fi delivery preference is retained using an isolated temporary APK-only server; no new device install is claimed.

## Owner audit request — 2026-11-07

Owner asks for useful alternatives to a live widget, a candid development/five-arc/romance/politics audit and the next implementation order. Widget alternatives remain proposals, not feature authorization. A substantial wearable/health/Letmoro mismatch was reported; do not put the owner's totals in Git. Requested 0.3.0 provider diagnostic fields and clarification of the Google app name. No cause is established yet. Prioritize reliable step import and physical persistence checks before more mechanics; the five arcs remain planned scaffolding beyond the playable opening. Roadmap/status headers were corrected to current 0.3.0 and 67 tests.

## Device diagnostic follow-up — 2026-11-07

The owner clarified that Google Health is the renamed Fitbit app, not the Health Connect settings screen. Google documents the rename in its [Google Health announcement](https://blog.google/products-and-platforms/products/google-health/google-health-app/). Do not conflate these products or treat the Google Health app display as a direct reading of Letmoro's Health Connect query.

The new diagnostic confirms a recent Health Connect read with Samsung Health contributing, whose aggregate is close to Letmoro's displayed estimate but materially below Samsung Health. No personal totals or exact observation timestamps are stored here. The investigation now concerns data export/source selection/query semantics rather than assuming the HUD subtracts spent travel.

A concrete query hypothesis: readToday currently queries local midnight through Instant.now(). Android aggregation tests demonstrate rescaling when a record overlaps the requested window. If a provider exports a cumulative record spanning a larger interval, that could reduce a partial-day aggregate. Compare the current request with the complete local civil-day window and inspect interval/source metadata using minimal, consented diagnostics. This is not confirmed as the cause on this device and no speculative correction or manual step grant was applied. Preserve deduplication, account baseline and unknown-data protections.

## November 7 — opening clarity and notebook follow-up

Implemented full-viewport encounters with participant squares/names, persistent dismissal and reopening; expandable campaign offers identify sender/recipient; objective guidance shows purpose/destination/distance/direction on the map and Story. Authorized-route guidance does not chart roads. The ignored private kettle offer explicitly requests a message, not the kettle. Generic campaign copy no longer asks vaguely what to carry. Full speaker attribution and editorial review of all legacy scenes remain pending.

Widget adds a cached notebook with carried-letter and optional-return counts. XP counter opens Skills, explaining its limited implementation: only the existing private-return 25 XP reward exists, no levels or general reward schedule. Further XP awards are proposals in Product. No save schema or Supabase migration required. Step-count discrepancy is unchanged and still requires the documented on-device query investigation. Five complete arcs are not implemented by these UI changes.

Verification for this pass: 69 Node tests pass (two new objective/notebook checks); TypeScript and production web build pass. Synthetic mobile Chromium checks at 390 × 844 verify full-height modal, named participant, close/reopen and absence of JavaScript errors. Android unit tests and lint pass; existing nonblocking lint/build warnings remain. Physical-phone readability, launcher sizing and the step-provider discrepancy still require real-device checks. No new APK is claimed by this entry.


## November 7 — current 0.4.0 implementation supersedes the XP-only checkpoint

Owner explicitly requests reliable steps, spendable XP, progressive two-choice skill forks inspired visually by a connected game skill tree, and a full clarity review of existing dialogue. Source now awards base XP for existing completions via deterministic replay; purchases are validated events, with twelve skill alternatives across three branches/two tiers. Each tier has mutually exclusive alternatives, disclosed before purchase. Owned ancestors remain visible, future tiers stay hidden. Bonuses affect capacity, postal pay, trust, private gifts and specific XP rewards; no raw-step multiplier changes real travel. No Supabase schema change is needed for the versioned event payload. Prior saves receive base rewards automatically and preserve past paths/outcomes. Future five-arc/political/romance expansion remains pending.

Native steps now query full local civil-day boundaries (including 23/25-hour days), separately aggregate Samsung Health's shared source, prefer it when available, otherwise use the Health Connect deduplicated all-source total. Never add sources. Diagnostics expose Samsung, all-source and old partial-window readings without storing personal diagnostic records. The old clipped window and source-priority mismatch are addressed in source, but the actual phone's discrepancy is NOT yet proven fixed. If Samsung's exported total still lags Samsung Health itself, the vendor SDK experiment remains the next adapter; no Wearable/Bluetooth shortcut or Samsung SDK is claimed installed. Life penalties remain off.

Reviewed all existing opening dialogue/request surfaces in both languages, including the first job, three topics, two legacy errands, eight conversation sets and twenty offers/details/reports. Sender/destination, unpaid help, optional returns and intentionally withheld meaning are explicit. Outcomes are shown after delivery; report prose is not presented as completed before reporting. Private manuscript changes remain ignored, included in local builds and require separate backup.


0.4.0 verification: 75 behavioral tests pass, including validated purchases, prerequisites, mutually exclusive forks, hidden descendants, reward differences, save replay, actual postal-pay/trust bonuses and preserved missing/zero step diagnostics. TypeScript/production build pass. Four Kotlin unit tests and Android lint pass. Synthetic EN/FR 390 × 844 Chromium verifies full-screen encounters, buying a skill, hidden future choices and persisted spend on reload. No physical import/launcher acceptance is claimed. Existing web bundle-size and native lint suggestions remain nonblocking.


0.4.0 APK / versionCode 8 assembled, signature verified with the existing signing identity, and packaged web assets byte-compared with final `dist`. SHA-256: `9a0c844bb61df4068a0407c36f3095937cd5242bf59e038b1b3d76f4845a1d62`. Includes the reviewed ignored manuscript and progressive skills UI. A temporary isolated APK-only LAN download is authorized; no device installation or matching real step total is claimed.

## Latest owner feedback and continuation writing

The owner reports that the current phone app, Samsung Health and wearable totals now agree after synchronization. This is positive physical evidence for the foreground query correction, not validation of midnight, long background absence or closed-day history. Do not store reported health totals. Keep life penalties disabled until those acceptance checks pass.

Verified shipped badge count: 17 (four original, thirteen campaign). Do not reveal badge titles/descriptions when answering the owner's count question. No additional badge is implemented in the new continuation draft.

Owner authorizes beginning the next narrative material with inhabitants, new places and meaningful secondary paths off main roads. Ignored `src/content/private/arc-one-continuation.md` contains four new inhabitants, six locations, four entrance junctions, eight linked quest outlines, four English dialogue scenes and French scene translations, plus consequences and runtime acceptance requirements. Private `tree.txt` now has a matching vertical draft subtree. All marked NOT PLAYABLE; no APK/runtime change made in this writing pass. Preserve existing road IDs/offsets via a migration before inserting junctions. No new ending/romance/political action is claimed implemented. Next: fully author outcome variants for the first secondary quest, implement/version secondary junctions and integrate that first loop with replay tests.


## Current 0.5.0 — first playable secondary loop

Implemented one explicitly learned side passage on an existing main road, a new inhabitant/location and two optional personal messages. The first delivery fulfills its own promise; accepting a reply is separate, and direct conversation/no further promise are valid alternatives. Sealed/opened/destroyed/returned letters reuse witnessed trust, truthful/false report, capacity, XP, journal, collection, widget and persistence rules. No new badges: still 17. The original twenty-request closing and unlock count exclude these optional messages; older unfinished saves do not acquire mandatory extra work. Refusing employment still permits this loop.

Graph migration occurs only on the discovery event. The old edge keeps its old geometry while earlier events replay; discovery splits it, remaps current offset and walked intervals, preserves coordinates/odometer/reserve, authorizes the learned junction and stops at intersections. For tiny goals where splitting would create a zero-length edge, the entrance attaches to the original endpoint. Unknown side roads remain absent. Version prologue-8 accepts all previous generations. No database migration required.

The ignored manuscript supplies all new identity/dialogue/letter content in EN/FR. The rest of the continuation remains a draft. A later shared-meal consequence, other new inhabitants and further secondary loops are not yet implemented. No fresh start is required; revisit a known central meeting place and ask about the passage. Real health rules remain unchanged and disabled pending remaining device acceptance checks.

0.5.0 verification: 82 behavioral tests pass, including seven secondary-path regressions, old graph position/interval preservation, no repeated completion rewards, optional reply alternatives and employment refusal. Generic manuscript-free and restored private-manuscript production builds pass. Synthetic EN/FR mobile checks pass. Four Kotlin unit tests, Android lint and APK assembly pass; existing nonblocking bundle/lint suggestions remain. Signature verified and final packaged web assets match dist. APK/versionCode: 0.5.0/9. SHA-256: `f23948cdbd291862ca3d92cf93061990364219097b6b74928bedadffdc9e1042`. Physical playthrough of the new loop remains pending. No Supabase migration or data reset required.


## Current 0.6.0 — language arrival and readable return encounters

Owner requests explicit EN/FR choice before account/setup/intro, slightly smaller encounter text, less repeated copy, selected meaningful return interactions, updated counts/pacing, commits/docs/APK, and asks about a silent promotional clip. First launch now gates App mounting until a language is chosen; valid device preferences skip the gate thereafter. Account landing also has a language selector. Explicit session choice survives restoring a differently localized cloud game. Explicit full erasure still returns setup to English as previously specified; it retains Auth.

Removed generic campaign instructions from encounter/Story when contextual content is present, arrival objective cards, repeated direction hint, offer identity duplication and generic delivery confirmation after an authored reaction. Broken-seal trust effects remain visible. Old dialogue and the first-round ending are collapsed for optional rereading; a just-chosen dialogue answer remains visible. Encounter prose reduced from 13 to 12 px, choices from 12 to 11 px, with 44 px touch targets retained and no nested limited-height details scroller.

Campaign arrivals automatically record a place encounter once per new odometer position; no repeated visit button is needed. Legacy cross/arrival/meeting events establish visit baselines. Actual returns after specific completed deliveries unlock three authored follow-ups at selected known places. Repeated visits at unchanged position cannot manufacture a return. Each response saves once; listening can add one bounded trust, no XP/coin farming. Follow-up prose is private and localized. Other places retain available letters, reports, known conversations and route choices; not every return invents a new scene. Health/arrival/thought effects reject stale captured runs before saving to avoid overwriting another effect's progress.

Current content counts: 9 encounterable characters excluding Moro, 23 distinct letters including the initial job and two side-loop letters, 17 badges. Nine is the catalog across outcomes, not a promise that all appear in every route. No new letter/badge added in this release.

Reproducible pacing: `npm run measure:pacing`, 10,000-step goal, one letter at a time. All 23 deliveries with no optional reports: 596,200 steps (59.62 goal equivalents); all reports without legacy errands: 1,155,450 (115.545); all reports and both legacy errands: 1,252,450 (125.245). These are explicit nonoptimized itineraries, not min/max bounds, calendar days, active reading time or proof of fully authored months of story. Batching, skipping, other routes and later free walking change the result. Future five arcs remain unfinished.


0.6.0 verification: 88 behavioral tests pass; TypeScript, generic and manuscript-included builds pass. Synthetic mobile EN/FR checks verify first language choice before account, persisted preference, localized setup/intro, secondary quest regression, deduplicated encounter paragraphs and a return choice saved once across reload. Four Kotlin unit tests, Android lint and assembly pass. Existing nonblocking bundle-size/native lint suggestions remain. Signature identity matches 0.5.0 and packaged web assets match final dist. APK/versionCode: 0.6.0/10; SHA-256: `bd51b703113d258da08ea95573f993ff25ecc596598fe7367bfed02a880260f4`. No reset or Supabase migration required. Physical readability/return playthrough remains to confirm on the owner's phone.

A local promotional preview was also rendered at `artifacts/promo/letmoro-teaser-fr.mp4`: 21 seconds, 720 × 1280, H.264, no audio stream. It is a simple montage of genuine UI captures and a pixel/text end card, using synthetic saves, not a filmed physical playthrough. Only introductory encountered characters are shown; no letter bodies or real account/health data are included. Artifact is ignored by Git, not published, and not backed up remotely. SHA-256: `647f8a53fdaea6d489572478aee35b022caede3eb2b5b460ef0c809553883aa8`.
