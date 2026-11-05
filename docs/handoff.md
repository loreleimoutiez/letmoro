# Session handoff

Updated 2026-11-05. Internal Android build 0.1.3 / versionCode 4; no public release.

## Instructions and authorization

Read `AGENTS.md`, product, narrative, decision ledger and roadmap before implementing. Respond in French; write code, comments, source narrative, documentation and Conventional Commits in English. French translation files are intentional. Latest user decisions override earlier proposals.

Workspace: `/home/lorelei/Documents/letmoro`. Local development, reversible fixes and local commits are authorized. No remote, push, public license, publication, contact with other people, or sub-agent delegation is authorized. Git writes can require escalation. Do not include health records, credentials, project-specific client values, pairing codes or device/network identifiers in Git. Actual public Supabase client values are in ignored `.env.local`; `.env.example` contains placeholders. Public configuration is embedded in the APK by design; server secrets never are.

## Settled direction

Direct Android app, React/TypeScript shared UI, Capacitor and Kotlin. Browser preview only, no PWA. Minimal square-pixel world, white borderless Moro on black, 1 px path, local pixel font, no AI artwork. Time-of-day design deferred. Moro has no specified gender. English default; explicit FR/EN preference persists.

Account entry comes before preferences. Small white underlined-square logo at upper left, “letmoro” to its right, larger gap before form. Login/signup are tabs; Forgot password is an underlined text action directly below Password in login. Google sign-in uses the system browser. Owner provider setup is never a player requirement.

Intro: four short screens explaining walking, discovery, waiting decisions and the first objective. Text is smaller and above Moro; Continue/Skip below. Manual reading pace except the initial short stepped fade. “Walk…” cue appears above Moro on arrival and clears on motion or timeout. No coin marker, no visible trial labels or simulation controls. Red temporary Reset game in Settings confirms before clearing the current account's local game; production reboot rules remain separate.

## Implemented

- Goal, difficulty descriptions, three compatible traits per sign; choices saved, mode/trait mechanics not implemented.
- Prologue: fictional crossing, explicit work/refusal, intact delivery and 8 minus 2 minus 2 settlement. Refusal is only a draft endpoint. First public campaign must remain rich and complete.
- Daily steps and coins HUD; three fixed red life squares. No life penalties. Missing data never means zero.
- First daily import can lengthen the starting path. Saved `journeyOrigin` starts the quest after introduction and initial step connection; existing daily steps do not finish it. Progress is one `current / required steps` line. One accepted step equals one world CSS pixel; route effort remains trial 2%/10% of goal. Office lies beyond crossing. No drag/manual camera travel; pinch only zooms.
- Health Connect aggregate with local day/zone key, persisted high-water marks and event replay. Corrections do not undo choices. Zone changes conservatively rebaseline; old undated credits are retained conservatively. Production calendar/correction policy remains open.
- Optional ACTIVITY_RECOGNITION permission enables foreground step detector; counter fallback can be slower. Native events update UI directly, with 3-second visible provider refresh. Provider/live estimates are combined by maximum, never addition. Stop on pause/sign-out. Hardware/multi-source timing still needs validation.
- Locked badges hidden, earned first-job medal, sealed-letter records, encountered characters only, event journal. No letter opening or authored return encounters yet. Smaller centered app mark with thicker underline in SVG/PNG/native vector.
- Supabase email/password signup, confirmation, login/logout, recovery, PKCE native callback and Google browser OAuth. Public service settings verified email/Google enabled and confirmation required; user added callback and configured Google. No actual accounts/emails were created by agent tests. Actual Google/email round trips are not claimed verified.
- Android Keystore AES-GCM session/PKCE storage; passwords never persisted; logging/backup/transfer disabled. Browser preview uses session storage. No service-role or Google client secret in app.
- Account-isolated local saves and one-time legacy migration. Corrupt legacy data stays owned/preserved until explicit reset. No cloud game/health save or database profile tables.

## Verification and artifacts

Node 22.23.2/npm 10.9.8; React 19.2.8, TypeScript 5.9.3, Vite 7.3.7, Capacitor core/Android/CLI 8.6.0, App 8.1.2, Browser 8.0.5, Supabase JS 2.119.0. JDK 21, SDK 36, AGP 8.13.0, Kotlin 2.2.20, Health Connect 1.1.0.

Passed: TypeScript; 24 JS/TS behavioral tests; 3 Kotlin live-total tests; browser tests with synthetic sensors and intercepted auth requests; production build; Android compilation/lint; npm audit with zero known advisories. App lint has 7 non-blocking dependency/template/KTX suggestions; upstream Capacitor uses its own baseline. No clean-machine installation or complete physical security review claimed.

Current browser regression: `/tmp/letmoro-browser/live-auth.cjs`, external Playwright tooling only. It tests account gating, English default, walking intro, delayed quest origin, live events, email and Google mock flows, PKCE, password recovery and reset. Old scripts describe superseded layouts and need adaptation; do not treat their stale assertions as product requirements.

APK: `android/app/build/outputs/apk/debug/app-debug.apk` (ignored). Temporary SDK `/tmp/letmoro-android-sdk`, Gradle `/tmp/letmoro-gradle`; ignored `android/local.properties` points to that SDK. Use your own SDK/JDK setup on a fresh system. The APK is served from an isolated `/tmp/letmoro-phone-install` directory on a temporary local server, not from the repo. User opened a narrow PC firewall rule for downloads; close temporary access after testing ends.

The user confirmed installation and basic Health Connect count display on S23. USB disconnected repeatedly. Wi-Fi pairing succeeded but the debug connection port refused, so no device debugging session is established. Short-lived pairing code was interactive and never put in project files. New sensor timing, Google consent, email delivery, recovery callbacks, encrypted-session restore and native accessibility remain physical test tasks.

## Next

See roadmap. First test the new account-first APK on S23, including activity permission/live movement, first-quest baseline and actual auth flows. Then production reconciliation/calendar rules, full narrative and trait/mode mechanics. Cloud saves, account deletion/export, heartbeat, full campaign and public licensing are not complete. No publication is authorized.
