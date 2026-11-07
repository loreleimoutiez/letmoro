# Session handoff

Updated 2026-11-07. Source version 0.3.0 / Android versionCode 7. Read this file, product, narrative, decision ledger and roadmap before implementation. Older milestones are in Git history.

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

Four original plus thirteen campaign badge conditions, brief five-second earned feedback. Basic respect only, earned through postal employment; future skills hidden. Latest encounter hollow markers, historical traces, visited place labels and abstract discovered-location squares. No live NPC tracking. Pinch/wheel/keyboard zoom, proportional Moro, square pebbles, no zoom UI. Journal newest-first with local timestamps; older undated entries stay undated.

Normal coin/step counters restored. Test toolbar source removed, intro replay absent, internal-tools flag removed. An explicit confirmed full erasure is now available in Settings. Synthetic legacy events remain decodable and automated tests still use domain fixtures; no simulation UI is shipped. No browser-preview caption remains in UI copy.

## Persistence and Supabase

`supabase/migrations/20261106105934_player_saves.sql` applied to the verified hosted project via the owner-connected Supabase integration. Public schema was empty. Remote checks verified owner RLS, denied anonymous table/RPC access, rejected foreign-owner RPC calls, SECURITY INVOKER and safe search path. Tests used transaction-local synthetic claims and rollback, no player records. Security advisor only flags disabled leaked-password protection; Auth configuration was not changed.

Ignored `.env.local` contains public client configuration and VITE_CLOUD_SAVES=true. Example remains false for unconfigured checkouts. Snapshot covers profile, events, navigation, letter outcomes, relationships, thoughts, life calendar/schedules, health checkpoints and language. Revision RPC protects stale writes; conflicts require explicit selection and retain a device backup. Offline local preservation/retry and reset tombstones remain supported. Real-account cross-device/email/OAuth verification is still pending. Never claim it is device-tested.

Content generation prologue-6, schema 1, older prologue-1/2/3/4/5 accepted by deterministic replay. Private pack `src/content/private/opening.json`, vertical `tree.txt` and `skills-tree.txt` are ignored and required for the richer narrative. No private repository/backup exists; do not force-add them. APK includes local text by design. Generic checkout supports the first delivery without this manuscript.

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
