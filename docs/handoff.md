# Session handoff

Updated 2026-11-06. Internal Android build 0.1.3 / versionCode 4; no public release.

## Instructions and authorization

Read `AGENTS.md`, product, narrative, decision ledger and roadmap before implementing. Respond in French; write code, comments, source narrative, documentation and Conventional Commits in English. French translation files are intentional. Latest user decisions override earlier proposals.

Workspace: `/home/lorelei/Documents/letmoro`. Local development, reversible fixes and local commits are authorized. No remote, push, public license, publication, contact with other people, or sub-agent delegation is authorized. Git writes can require escalation. Do not include health records, credentials, project-specific client values, pairing codes or device/network identifiers in Git. Actual public Supabase client values are in ignored `.env.local`; `.env.example` contains placeholders. Public configuration is embedded in the APK by design; server secrets never are.

## Settled direction

Direct Android app, React/TypeScript shared UI, Capacitor and Kotlin. Browser preview only, no PWA. Minimal square-pixel world, white borderless Moro on black, 1 px path, local pixel font, no AI artwork. Time-of-day design deferred. Moro has no specified gender. English default; explicit FR/EN preference persists.

Account entry comes before preferences. Small white underlined-square logo at upper left, “letmoro” to its right, larger gap before form. Login/signup are tabs; Forgot password is an underlined text action directly below Password in login. Google sign-in uses the system browser. Owner provider setup is never a player requirement.

Intro: four short screens explaining walking, discovery, waiting decisions and the first objective. Text is smaller and above Moro; Continue/Skip below. Manual reading pace except the initial short stepped fade. “Walk…” cue appears above Moro on arrival and clears on motion or timeout. No coin marker, no visible trial labels or simulation controls. Red temporary Reset game in Settings confirms before clearing the current account's local game; production reboot rules remain separate.

## Implemented

- Goal, difficulty descriptions, three compatible traits per sign; choices saved, mode/trait mechanics not implemented.
- Prologue: fictional crossing, explicit work/refusal, intact delivery and 8 minus 2 minus 2 settlement. Refusal now permits reconsideration; its exploration route remains to author. First public campaign must remain rich and complete.
- Daily steps and coins HUD; three fixed red life squares. No life penalties. Missing data never means zero.
- First daily import can lengthen the starting path. Saved `journeyOrigin` starts the quest after introduction and initial step connection; existing daily steps do not finish it. Progress is one `current / required steps` line. One accepted step equals one world CSS pixel; route effort remains trial 2%/10% of goal. Office lies beyond crossing. No drag/manual camera travel; pinch only zooms.
- Health Connect aggregate with local day/zone key, persisted high-water marks and event replay. Corrections do not undo choices. Zone changes conservatively rebaseline; old undated credits are retained conservatively. Production calendar/correction policy remains open.
- Optional ACTIVITY_RECOGNITION permission enables foreground step detector; counter fallback can be slower. Native events update UI directly, with 3-second visible provider refresh. Provider/live estimates are combined by maximum, never addition. Stop on pause/sign-out. Hardware/multi-source timing still needs validation.
- Locked badges hidden, earned first-job medal, sealed-letter records, encountered characters only, event journal. Letter opening/destruction and immediate outcomes now exist in source; authored return encounters remain pending. Smaller centered app mark with thicker underline in SVG/PNG/native vector.
- Supabase email/password signup, confirmation, login/logout, recovery, PKCE native callback and Google browser OAuth. Public service settings verified email/Google enabled and confirmation required; user added callback and configured Google. No actual accounts/emails were created by agent tests. Actual Google/email round trips are not claimed verified.
- Android Keystore AES-GCM session/PKCE storage; passwords never persisted; logging/backup/transfer disabled. Browser preview uses session storage. No service-role or Google client secret in app.
- Account-isolated local saves and one-time legacy migration. Corrupt legacy data stays owned/preserved until explicit reset. No cloud game/health save or database profile tables.

## Verification and artifacts

Node 22.23.2/npm 10.9.8; React 19.2.8, TypeScript 5.9.3, Vite 7.3.7, Capacitor core/Android/CLI 8.6.0, App 8.1.2, Browser 8.0.5, Supabase JS 2.119.0. JDK 21, SDK 36, AGP 8.13.0, Kotlin 2.2.20, Health Connect 1.1.0.

Passed: TypeScript; 24 JS/TS behavioral tests; 3 Kotlin live-total tests; browser tests with synthetic sensors and intercepted auth requests; production build; Android compilation/lint; npm audit with zero known advisories. App lint has 7 non-blocking dependency/template/KTX suggestions; upstream Capacitor uses its own baseline. No clean-machine installation or complete physical security review claimed.

Current browser regression: `/tmp/letmoro-browser/live-auth.cjs`, external Playwright tooling only. It tests account gating, English default, walking intro, delayed quest origin, live events, email and Google mock flows, PKCE, password recovery and reset. Old scripts describe superseded layouts and need adaptation; do not treat their stale assertions as product requirements.

APK: `android/app/build/outputs/apk/debug/app-debug.apk` (ignored). Temporary SDK `/tmp/letmoro-android-sdk`, Gradle `/tmp/letmoro-gradle`; ignored `android/local.properties` points to that SDK. Use your own SDK/JDK setup on a fresh system. The APK is served from an isolated `/tmp/letmoro-phone-install` directory on a temporary local server, not from the repo. User opened a narrow PC firewall rule for downloads; close temporary access after testing ends.

The user confirmed installation and basic Health Connect count display on S23. USB disconnected repeatedly. Wi-Fi pairing succeeded but the debug connection port refused, so no device debugging session is established. Short-lived pairing code was interactive and never put in project files. New sensor timing, Google consent, email delivery, recovery callbacks, encrypted-session restore and native accessibility remain physical test tasks.

## Latest planning session — 2026-11-06

Project reviewed without runtime changes. User prioritizes a rich narrative tree before new implementation, with inhabitants foregrounded and a discreet mystery. Five arcs should target approximately one real year; the six-to-eight-week estimate is superseded. New requirements: multidirectional paths, mid-route reversal and real-step-funded returns over known paths; easy first job quest and later multi-day travel; visible choices above Moro; early branching dialogues with explicit work acceptance; opening/destruction of undelivered letters in Collection; proportionate consequences for every choice; character gallery with colored square/name/known role. A hollow larger yellow office is a proposal. No such mechanics have been implemented.

Do not put secret plots or letter bodies in this intended public repository. Private content storage is undecided; no private remote has been created. Current tracked prologue content already exists. See product, narrative, ledger and roadmap for scope and unresolved controls. No new feature code or tests changed in this planning session.

## Next

See roadmap and `docs/lives-and-reboot.md` for the explicit implementation sequence, agreed rules, unresolved boundaries and required tests for life loss/recovery, emergency pause, death, account rescue and production reboot. These mechanics remain unimplemented; the temporary local reset is separate. First test the new account-first APK on S23, including activity permission/live movement, first-quest baseline and actual auth flows. Then production reconciliation/calendar rules, full narrative and trait/mode mechanics. Cloud saves, account deletion/export, heartbeat, full campaign and public licensing are not complete. No publication is authorized.


## Opening source implementation — 2026-11-06

User authorized implementation and approved the neighborhood proposal with a correction: postal delivery is the territory's only available employment. Other inhabitants cannot offer paid alternatives. Current source implements above-Moro decisions, optional persisted job questions, explicit paid-work acceptance, reconsideration, opening/reading and confirmed destruction of the first undelivered letter, delivered-opened records, a no-wages destroyed-letter report, character gallery and hollow yellow office. Existing saves replay without losing progress; opening is never inferred for older deliveries. No graph traversal, return travel, full relationship consequences, further quests or campaign has been implemented.

Private authoring files: `src/content/private/opening.json` (English source and French translation), `src/content/private/tree.txt` (vertical tree with playable/planned labels). The directory is ignored; do not force-add it. `src/content/narrative.ts` defines the local pack contract and optional Vite loading. Missing pack: generic opening remains available, questions/named characters are absent and unread letters cannot be opened. Private text is included in local compiled assets by design, so an APK is not a secrecy boundary. No private remote or durable backup was created. See `docs/narrative-authoring.md`.

Current source checks: 27 behavioral tests, TypeScript and production web build passed. Browser checks with a synthetic account cover above-Moro questions, refusal/reconsideration, reading, canceled/confirmed destruction, reload persistence, character gallery, loss report and landscape overflow. Script/screenshots: `/tmp/letmoro-qa/`. Earlier `/tmp` SDK/browser artifacts were absent after restart. Current machine SDK has only platform 34, while this project requires 36; no new APK or native validation is claimed. Existing 0.1.3 APK references above describe the previous session.


## Latest user steering and source checkpoint — 2026-11-06

No APK now. Keep private manuscript/tree in this repository's ignored directory for the moment; separate storage deferred. A bottom test toolbar now replaces ordinary coin/step HUD in development preview or explicit `VITE_INTERNAL_TOOLS=true` builds. It edits coins, adds fictional steps, confirms reset and replays intro. Reset/replay removed from Settings. Test step credits never modify real daily totals. New `test-coins` events replay and are hidden from narrative journal. Settlement adds four coins to existing balance.

Cloud source is opt-in (`VITE_CLOUD_SAVES=true`, example defaults false). Migration: `supabase/migrations/202611060001_player_saves.sql`; details: `docs/cloud-saves.md`. Stores current save/profile/event history including daily health aggregate/checkpoint events plus language. Owner-only RLS, owner-checked revision RPC, startup restoration, periodic changed-save uploads, local preservation/offline retry, explicit conflict resolution with local backup, and reset tombstones implemented. Actual Supabase migration not applied; no administrative connection available, no real-account cloud round trip claimed. Keep live sync disabled until owner setup/verification. No credentials were added.

Current checks: 30 behavioral tests, TypeScript and production web build; browser narrative/toolbar/cloud checks on synthetic accounts with intercepted HTTP; isolated PostgreSQL 16 migration and SQL policy/revision tests. SQL fixtures roll back; temporary test server was stopped. Browser tests cover fresh-device restore, conflicting local versions, offline retry, stale-revision conflict, JSONB key ordering and reset. Test scripts/screenshots are in `/tmp/letmoro-qa/`; SQL tests are tracked. Existing native/physical checks were not repeated and no APK was built. Narrative source commit: `937a681`; later test/cloud work is separate.
