# Session handoff

Updated 2026-11-06. Source version 0.2.0 / Android versionCode 5. Read this file, product, narrative, decision ledger and roadmap before implementation. Older milestones are in Git history.

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

Four original plus twelve campaign badge conditions, brief five-second earned feedback. Basic respect only, earned through postal employment; future skills hidden. Latest encounter hollow markers, historical traces, visited place labels and abstract discovered-location squares. No live NPC tracking. Pinch/wheel/keyboard zoom, proportional Moro, square pebbles, no zoom UI. Journal newest-first with local timestamps; older undated entries stay undated.

Normal coin/step counters restored. Test toolbar source removed, reset/replay absent, internal-tools flag removed. Synthetic legacy events remain decodable and automated tests still use domain fixtures; no simulation UI is shipped. No browser-preview caption remains in UI copy.

## Persistence and Supabase

`supabase/migrations/20261106105934_player_saves.sql` applied to the verified hosted project via the owner-connected Supabase integration. Public schema was empty. Remote checks verified owner RLS, denied anonymous table/RPC access, rejected foreign-owner RPC calls, SECURITY INVOKER and safe search path. Tests used transaction-local synthetic claims and rollback, no player records. Security advisor only flags disabled leaked-password protection; Auth configuration was not changed.

Ignored `.env.local` contains public client configuration and VITE_CLOUD_SAVES=true. Example remains false for unconfigured checkouts. Snapshot covers profile, events, navigation, letter outcomes, relationships, thoughts, life calendar/schedules, health checkpoints and language. Revision RPC protects stale writes; conflicts require explicit selection and retain a device backup. Offline local preservation/retry and reset tombstones remain supported. Real-account cross-device/email/OAuth verification is still pending. Never claim it is device-tested.

Content generation prologue-4, schema 1, older prologue-1/2/3 accepted by deterministic replay. Private pack `src/content/private/opening.json`, vertical `tree.txt` and `skills-tree.txt` are ignored and required for the richer narrative. No private repository/backup exists; do not force-add them. APK includes local text by design. Generic checkout supports the first delivery without this manuscript.

## Verification and environment

Node 22/npm 10, JDK 21, SDK 36. Temporary SDK `/tmp/letmoro-android-sdk`, Gradle `/tmp/letmoro-gradle`; ignored android/local.properties points to SDK. Existing debug keystore remains outside Git. Native history now compiles; actual S23/Fit3 history/midnight/correction data still requires physical validation. VITE_LIFE_RULES=false remains deliberate.

Latest checks and APK status are recorded in gameplay-status.md. Browser tools/scripts/screenshots are under `/tmp/letmoro-qa/`, not shipped UI. Prior scripts referring to removed toolbar/buttons/captions need adaptation. Current campaign.cjs tests synthetic account/cloud restore, dialog replacement, letter collection, badge feedback, rest settings and zoom/FR/landscape. No real account or personal health records were used.

## Next

Complete physical acceptance checks, tune pacing, extend authored encounters and skill/trait effects, settle pause/rescue/reboot and goal/mode switching, implement account export/deletion/retention and durable private-content backup. Multi-day closed-app travel reconciliation and replay compaction still require design; today's import is not proof of all historical/offline travel. See gameplay-status and roadmap. Never equate missing history with zero.
