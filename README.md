<img width="1280" height="720" alt="letmoro-teaser-en-landscape" src="https://github.com/user-attachments/assets/1c2423bf-51c7-423c-94e2-c315d76a0a85" />

# Letmoro

A quiet Android walking adventure about delivering letters and finding a life of your own.

## Status

Internal Android version 0.6.0 / versionCode 10. This is a playable opening, not the complete five-arc public campaign. Postal delivery is the territory's only available employment. The local ignored manuscript adds twenty letters, seven recurring-character conversations and two optional unpaid errands beyond the easy first job/delivery. Refusing employment preserves a complete ten-request personal route. A first secondary-path extension adds a new encounter and two optional messages without changing that round’s completion requirements.

- Minimal square-pixel world; real-step-funded cardinal travel, reversal and returns, long journeys and a discovered cross-connection. Pinch, mouse wheel and keyboard zoom scale Moro with the terrain; no zoom buttons or percentage.
- Above-Moro arrival decisions, dialogue details that replace initial choices, up to three carried campaign letters, opening/destruction/return/delivery/report actions, optional report journeys, trust, explicit friendships and delayed contradictory reports. Earned badges have brief restrained feedback; locked badges/skills remain hidden. Only the Basic respect skill root is implemented.
- Persistent travel thoughts: one pending thought until dismissed, no offline queue, context-aware selection and a readable thought archive. Journal uses newest-first local timestamps without numbering.
- Account-first Supabase Auth, Android Keystore sessions and per-account local saves. Hosted owner-only save migration applied and verified; local cloud synchronization enabled. Real-account cross-device restore and email/Google round trips still need device verification. No server credentials are shipped.
- Health Connect and optional foreground step sensors; a pre-map connection invitation, normal coins/steps HUD, and no test toolbar, reset/replay, fictional-day input or browser-preview captions in the interface.
- Tested life/rest/recovery reducer with 24-hour finalization grace and fixed run time zone. Rest weekdays are configurable by difficulty, effective next Monday with a seven-day change cooldown. Real penalties remain disabled pending physical history validation. Pause, rescue, production reboot, mode switching, numerical trait effects and the full campaign skill tree are not implemented.

The twenty-request sequential round with every optional report return costs about 113 personal daily goals in a deterministic simulation; carrying several letters and skipping optional reports changes effort considerably. This is a route-cost observation, not a measured real-world duration or evidence of a finished year-long campaign. See [current gameplay status](docs/gameplay-status.md).

Private manuscripts and vertical authoring trees remain under Git ignore; no private remote or durable manuscript backup was created. A checkout without them provides the generic first delivery. See [private authoring](docs/narrative-authoring.md). No publication, remote push or public license is authorized.

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

Current source passes TypeScript, 51 JavaScript/TypeScript behavioral tests and production web builds with/without private content. Vite reports a non-blocking main-chunk size warning (about 529 kB minified). The previous Android build passed 3 Kotlin unit tests and Android compilation/lint; these native checks were not repeated for the new narrative UI. App lint retains non-blocking template/dependency/KTX suggestions. npm audit reported zero known advisories. Browser tests with synthetic native events and intercepted auth requests cover account gating, signup/sign-in/sign-out/recovery, Google PKCE launch/callback, quest baseline, live updates and local reset. These tests do not create real accounts or send emails. The user has confirmed installation and a displayed Health Connect daily count on S23; new live-sensor timing and actual auth email/OAuth flows still need device tests.

## Structure

- `src/domain/`: deterministic story, map, profile rules and health credit reconciliation.
- `src/content/`: English source and French translation.
- `src/adapters/`: local account saves, auth storage and Android health boundaries.
- `src/auth/`: validated public configuration, PKCE callback and account state.
- `src/ui/`: entry/setup/account screens, pixel world and step observation hook.
- `android/`: Capacitor shell, Kotlin health sensor bridge and encrypted session storage.
- `tests/`: synthetic save, account isolation, auth boundary, health and progression checks.

Press Start 2P is bundled locally with its [SIL Open Font License](public/fonts/OFL.txt). That dependency license does not license Letmoro itself. All artwork is authored geometric/vector code; no AI artwork is used.

## Documentation

[Product](docs/product.md) · [Narrative](docs/narrative.md) · [Architecture](docs/decisions/0001-architecture.md) · [Decisions](docs/decision-ledger.md) · [Roadmap](docs/roadmap.md) · [Navigation](docs/navigation.md) · [Health](docs/health-connect.md) · [Accounts](docs/auth.md) · [Cloud saves](docs/cloud-saves.md) · [Lives and reboot](docs/lives-and-reboot.md) · [Handoff](docs/handoff.md)

The supplied future GitHub repository is reserved; no remote or publication is configured. No open-source license has been chosen.

## Starting over

Settings → Start over → confirm erases the game and its archives locally and in the online save while retaining the account/password. Online saving requires a working connection before local erasure. Reinstalling alone does not erase an account backup. Old daily steps become the new game's baseline rather than restoring the former path. Health Connect's own records remain unchanged. This is separate from the deferred narrative reboot/rescue system.

## Android widget and step-source investigation

A native home-screen widget shows Moro on discovered local terrain, remaining quest distance or daily steps/goal, and a last-seen timestamp. It opens Letmoro on tap and retains the last app snapshot while closed; it does not independently advance the game or read steps in the background. A new step-connection detail separates the shared Health Connect aggregate from the phone estimate and identifies Samsung Health contributions. See [Fit3 and Samsung Health research](docs/fit3-and-samsung-health.md). Direct Samsung SDK access and Fit3 notifications remain investigated possibilities, not implemented integrations.

A personal delivery now has distinct optional return outcomes and an exclusive intact-seal badge. XP is now awarded for completed deliveries, promises and first discoveries; it buys implemented bonuses in three progressively revealed two-choice skill branches. Earlier save generations remain readable; existing accomplishments replay into the new base XP rewards, while skill bonuses apply only after purchase. Private scenes and the authoring tree remain ignored.


Version 0.6.0 adds explicit English/French choice before the first account/setup/intro screen, lighter interaction copy and three authored conditional return conversations. Current catalog: nine encountered-character identities excluding Moro, 23 letters including the initial delivery, and 17 badge conditions. `npm run measure:pacing` reproduces example travel workloads at a 10,000-step goal; these do not predict calendar duration or reading time.


## Version labels

Internal builds use `0.minor.patch`: `0` marks ongoing development, the middle number identifies a feature milestone, and the final number identifies smaller fixes within that milestone. For example, `0.6.1` would be a corrective update to `0.6.0`, while `0.7.0` would mark the next feature milestone. The release label describes change history; campaign completeness is documented separately. Android's `versionCode` is a separate increasing install/update counter (10 for 0.6.0).
