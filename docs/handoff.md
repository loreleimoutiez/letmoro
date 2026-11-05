# Session handoff

Updated on 2026-11-05. Internal Android milestone, not a public release.

## Read first

Read `AGENTS.md`, `docs/decision-ledger.md`, `docs/product.md`, `docs/narrative.md`, `docs/decisions/0001-architecture.md`, and `docs/roadmap.md`. Respond in French; write artifacts in English. Latest user decisions override earlier proposals.

## Workspace and authorization

Project: `/home/lorelei/Documents/letmoro`. Git initialized with the existing configured identity; local Conventional Commits authorized on `main`. Git writes may require escalation. No remote, push, public license, publication, other-person contact, or sub-agent delegation authorized. Future supplied remote: `https://github.com/loreleimoutiez/letmoro.git`.

Final platform selection: Android directly. The user briefly selected PWA plus Android, then explicitly replaced that with Android. Do not revive PWA work. Shared React UI, Capacitor packaging, Kotlin health access, browser preview for development. No service worker or PWA install flow.

## Current implementation

- Internal simulated prologue: goal, seven-goal reserve, explicit job/refusal/delivery/settlement choices, 8 minus 2 minus 2 payment, event journal. Draft refusal endpoint, not a complete branch. Costs 2%/10% are trial values.
- Versioned validated local saves; new optional mode and three-positive/three-negative profile round-trips through replay. Legacy saves without profile remain readable. Trait conflicts and exact counts validated. Modes and traits are recorded only; effects are not implemented.
- FR/EN UI and narrative draft, persisted language setting. Source English with separate French translation. New-run goal/mode/trait setup, “Meet Moro” with stepped fade, brief user-paced lines, skip control, then first objective. Old saves are preserved, not forcibly replaced.
- Terminal black/white view: borderless 24 px white Moro, same-width initial underline below, three fixed red life squares top-left, coins bottom-left, unknown-safe health steps bottom-right. Moro opacity 0.48–1 over 4.8 seconds, disabled with reduced motion. No clock palette yet.
- Main menu: Story, Collection, Step connection, bottom-aligned Settings with pixel icons. No caption/numbering. Borderless cross. Collection groups letters, encounters, badges, journal. Secret first-job badge unlocks at acceptance. No authored letter opening or other badges yet.
- Centered Moro and translating terrain. Progressively discovered trial geometry, visible crossing only once reached, sparse 2 px markers. No finger dragging or manual return controls. Pinch changes magnification only. Notes, witnesses, and step-driven return routes remain to author. No unknown branches rendered.
- Underlined black square mark in SVG, Android vector and reproducible generated PNGs (`scripts/icons.mjs`); no AI artwork. Local Press Start 2P with OFL dependency license; no project license chosen.
- Kotlin Health Connect plugin: read-steps permission, permission rationale in native EN/FR, today's aggregate with provider deduplication, null for empty/error/unavailable/denied. Foreground polling every 15 seconds and on focus/visibility return; corrected totals may decrease. Raw daily observations and cursor in memory; accepted health travel increments in local story saves. Native logging and backup/transfer disabled. No Google account login, cloud credentials, or heart-rate permission.

## Verification and environment

Node 22.23.2/npm 10.9.8. React 19.2.8, TypeScript 5.9.3, Vite 7.3.7; Capacitor core/Android/CLI 8.6.0. JDK 21, SDK 36, AGP 8.13.0, Kotlin 2.2.20, Health Connect stable 1.1.0. npm audit returned zero vulnerabilities after patch updates; no fresh clean-machine install claimed.

Passed: TypeScript, fourteen behavioral tests, production build, Capacitor sync, Android `assembleDebug`, Android `lintDebug` (0 app errors, 5 warnings: newer dependency versions and template resources). Capacitor's own lint uses its upstream baseline; this is not a warning-free whole-toolchain claim. Earlier generated placeholder tests were removed rather than retained as bogus coverage.

Browser checks in installed headless Chrome with temporary Playwright cover validated setup/conflicts, introduction, initial path width, HUD, unknown health, centered movement and progressive discovery, complete delivery/badge/reload, language/trait persistence, drag blocking, pinch gesture, 320–1280 px overflow, Escape/focus and reduced motion. Visually inspected screenshots. Current script: `/tmp/letmoro-browser/android-ui.cjs`; screenshots `/tmp/letmoro-android-map.png`, `/tmp/letmoro-android-menu.png`, `/tmp/letmoro-android-fr.png`. Tooling stays outside repo.

Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk` (ignored). Temporary SDK `/tmp/letmoro-android-sdk` and Gradle cache `/tmp/letmoro-gradle`; ignored `android/local.properties` points to the temporary SDK. Build with JDK 21 and your own SDK path. Initial restricted Gradle attempt failed on `.android` cache writes; escalated rerun downloaded SDK components and succeeded.

`adb devices -l` detected no phone. Physical install, step permission/import, phone-only timing, screen readers, and native gestures remain unverified. See `docs/health-connect.md` for setup. No sensitive health data or credentials were used.

## Next required work

Prioritize actual S23 installation and source checks, then low-latency native sensor feedback with safe reconciliation. The 15-second aggregate channel is not instant. New steps since the first successful session read advance travel; reload/day/zone change creates a new baseline. Steps between app termination and the next first read are not credited. Real steps never cost lives. Full health calendar/credit rules, trait mechanics, modes/lives, opened letters, return encounters, full campaign, accounts/authentication/sync and heart-rate feedback remain ahead. Accounts were discussed but no backend, provider, deployment, or secrets are configured.

The balance appears in the lower-left HUD and opens its own detail view; it is not repeated below collections. A small yellow square marks the delivery office only after discovery.
