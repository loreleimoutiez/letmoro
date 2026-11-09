<img width="1280" height="720" alt="letmoro-teaser-en-landscape" src="https://github.com/user-attachments/assets/1c2423bf-51c7-423c-94e2-c315d76a0a85" />

# Letmoro

A narrative walking adventure for Android, about delivering letters and finding a life of your own.

You follow Moro through a fictional territory, carrying correspondence between people whose lives gradually become familiar. A first offer of postal work opens one way forward; personal favors, conversations and exploration remain possible if Moro refuses it. The story is quiet much of the time, with humor, uncertainty and consequences growing out of ordinary encounters.

Your real steps move Moro along discovered roads. At a destination, you decide what happens next: accept a request, keep a letter sealed, open it, return it, or leave a conversation for another time. Choices and relationships persist. Important decisions wait for you; walking does not make them on your behalf. The world uses abstract square pixels, with readable English and French text.

The full campaign is intended to offer substantial personal, relational and optional political paths. Those larger routes are still being written. The current app provides a playable opening, not the complete five-arc campaign.

## Documentation

[Product and game rules](docs/product.md) · [Story and tone](docs/narrative.md) · [Current playable content](docs/gameplay-status.md) · [Roadmap](docs/roadmap.md)

For development: [Architecture](docs/decisions/0001-architecture.md) · [Decisions](docs/decision-ledger.md) · [Navigation](docs/navigation.md) · [Health](docs/health-connect.md) · [Accounts](docs/auth.md) · [Cloud saves](docs/cloud-saves.md) · [Lives and reboot](docs/lives-and-reboot.md) · [Handoff](docs/handoff.md)

## Status

Version 0.7.0 is an internal playable Android opening. Its catalog includes 29 letters across alternative routes and ten encounterable characters excluding Moro, optional personal requests, branching conversations, a journal, contextual travel thoughts and spendable XP. Letters retain their outcomes, and witnessed actions can affect trust and friendships. Two inhabited secondary loops and three conditional return conversations are implemented. The second loop adds an explicit request choice, optional answers and a correction requiring actual communication.

Development and device testing currently focus on Samsung Android hardware, initially a Galaxy S23 and Fit3. Letmoro reads step data through Health Connect and can use foreground phone sensors; it does not connect directly to the band. Game restoration on a Samsung tablet has been confirmed. Cross-device step handling, long absences and historical-health acceptance still need work. Real life-loss penalties remain disabled.

The rest of Arc I, the full five-arc campaign, substantial romance and political routes, home/spending projects and trait effects remain unfinished. The next inhabited loop is integrated; the private Arc I convergence and closing plan remains unimplemented. See [current gameplay status](docs/gameplay-status.md) for implemented behavior, measured travel examples and dated checks.

## Source and manuscript

The application code and documentation live in this repository. Authored manuscripts and narrative trees live in a separate private repository and are imported into an ignored local directory for builds. A checkout without the manuscript supports the generic first delivery. See [private authoring](docs/narrative-authoring.md) for setup and backup status.

A GitHub remote is configured for the application repository. No public project license has been selected; the bundled font has its own license below.

## Development

Node.js 22.12+ and npm are required. Android uses JDK 21 and SDK 36. Dependencies are pinned in `package-lock.json`; Capacitor core/Android/CLI 8.6.0, React 19.2.8, TypeScript 5.9.3, Vite 7.3.7 and Supabase JS 2.119.0.

```sh
npm ci
cp .env.example .env.local
npm run dev
npm run check
npm test
npm run build
npm run android:build
```

Put your Supabase project URL and **public publishable key** in ignored `.env.local`. Never put a Google client secret, service-role key or password in the app. Client public configuration is included in the compiled application by design. See [account setup](docs/auth.md).

Configure `JAVA_HOME` and `ANDROID_HOME`, or ignored `android/local.properties`. The APK is `android/app/build/outputs/apk/debug/app-debug.apk`. Browser preview is for development and cannot access Android health sensors. No PWA or service worker is shipped.

For native checks after synchronization:

```sh
cd android
./gradlew :app:assembleDebug :app:lintDebug :app:testDebugUnitTest
```

## Data and validation

Daily step checkpoints and game progress are saved locally by authenticated account. The owner-isolated cloud migration is deployed and local cloud saving is enabled; see [cloud saves](docs/cloud-saves.md). New checkouts default to local-only until their own backend is configured. The first authenticated account can claim an older local save once. Authentication tokens and PKCE verifiers use Android Keystore-backed AES-GCM encryption; passwords are never persisted. Browser preview sessions use session storage. Android backup/transfer and native logging are disabled. With cloud saves disabled, only authentication contacts Supabase. Enabling cloud saves also uploads persisted gameplay and daily step/checkpoint events.

The 0.7.0 checkpoint passes TypeScript, 100 behavioral/tooling tests, production web builds with/without private content, Android assembly, four Kotlin unit tests and Android lint. App lint reports 16 non-blocking warnings; Vite reports a main-chunk size warning at approximately 706 kB minified. Synthetic EN/FR mobile browser checks cover the new loop's three routes, sealed-letter privacy, reload persistence and portrait/landscape. See [gameplay status](docs/gameplay-status.md) for artifact verification and dated evidence.

The owner confirmed matching Letmoro/Samsung Health/wearable totals after synchronization and game restoration on a Samsung tablet. Midnight, prolonged absence, closed-day history/corrections and untested email/OAuth or concurrent-save scenarios still need physical checks. Synthetic browser checks do not create accounts, send emails or read personal health data. No fresh dependency audit is claimed.

## Structure

- `src/domain/`: deterministic story, map, profile rules and health credit reconciliation.
- `src/content/`: English source and French translation.
- `src/adapters/`: local account saves, auth storage and Android health boundaries.
- `src/auth/`: validated public configuration, PKCE callback and account state.
- `src/ui/`: entry/setup/account screens, pixel world and step observation hook.
- `android/`: Capacitor shell, Kotlin health sensor bridge and encrypted session storage.
- `tests/`: synthetic save, account isolation, auth boundary, health and progression checks.

Press Start 2P is bundled locally with its [SIL Open Font License](public/fonts/OFL.txt). That dependency license does not license Letmoro itself. All artwork is authored geometric/vector code; no AI artwork is used.

## Starting over

Settings → Start over → confirm erases the game and its archives locally and in the online save while retaining the account/password. Online saving requires a working connection before local erasure. Reinstalling alone does not erase an account backup. Old daily steps become the new game's baseline rather than restoring the former path. Health Connect's own records remain unchanged. This is separate from the deferred narrative reboot/rescue system.

## Android widget and step-source investigation

A native home-screen widget shows Moro on discovered local terrain, remaining quest distance or daily steps/goal, and a last-seen timestamp. It opens Letmoro on tap and retains the last app snapshot while closed; it does not independently advance the game or read steps in the background. A new step-connection detail separates the shared Health Connect aggregate from the phone estimate and identifies Samsung Health contributions. See [Fit3 and Samsung Health research](docs/fit3-and-samsung-health.md). Direct Samsung SDK access and Fit3 notifications remain investigated possibilities, not implemented integrations.

## Version labels

Internal builds use `0.minor.patch`: `0` marks ongoing development, the middle number identifies a feature milestone, and the final number identifies smaller fixes within that milestone. For example, `0.6.1` would be a corrective update to `0.6.0`, while `0.7.0` would mark the next feature milestone. The release label describes change history; campaign completeness is documented separately. Android's `versionCode` is a separate increasing install/update counter (11 for 0.7.0; 10 for the previous 0.6.0 APK).
