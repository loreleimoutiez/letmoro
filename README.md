# Letmoro

A quiet Android walking adventure about delivering letters and finding a life of your own.

## Status

An internal Android build is available for device testing. This is not the complete first public campaign. The current story covers meeting Moro, a fictional street crossing, a job decision, one intact delivery and its settlement. The refusal route is a draft endpoint.

Implemented:

- Minimal black/white pixel interface, centered borderless Moro, a discovered 1 px path, three fixed red life squares, coins and steps. No finger-drag travel; pinch changes zoom only.
- Account creation/sign-in before game preferences: Supabase email/password, confirmation, recovery, sign-out, and Google OAuth through the system browser. Google and email are enabled on the configured test service; actual device email/OAuth round trips still need verification.
- English by default, saved French/English preference, daily goal, difficulty descriptions and three compatible positive/negative traits. Mode and trait mechanics are not implemented yet.
- Four short introduction screens explain walking and explicit choices. Small text sits above Moro, controls below. A fading “Walk…” cue follows. Settings can replay the introduction without resetting progress.
- Health Connect daily aggregate import plus optional foreground Android step-detector events. Counter-sensor fallback may be slower. Foreground synchronization fallback runs every 3 seconds; this is not background tracking.
- Quest progress as `current / required steps`. Existing daily activity may reveal a longer starting path, but the first quest starts only after the introduction and initial step connection. One accepted step equals one world CSS pixel at normal zoom; important choices still wait.
- Local saves isolated by account, validated event replay, persistent step deduplication, hidden locked badges, a first-job pixel medal and an underlined-square app mark.
- Temporary red **Reset game** control in Settings, with confirmation, clearing only the current account's local game. It is a testing utility, not production reboot rules.

Full campaign, return encounters, opened-letter consequences, trait/mode mechanics, life penalties, account-wide rescue, cloud save synchronization, heart-rate feedback and time-of-day presentation remain ahead. No public release, push or project license has been selected.

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

Daily step checkpoints and game progress stay on the device, separated by authenticated account. The first authenticated account can claim an older local save once. Authentication tokens and PKCE verifiers use Android Keystore-backed AES-GCM encryption; passwords are never persisted. Browser preview sessions use session storage. Android backup/transfer and native logging are disabled. No game or health data is uploaded to Supabase; only authentication is connected.

TypeScript, 24 JavaScript/TypeScript behavioral tests, 3 Kotlin unit tests, production build and Android compilation/lint pass. App lint retains non-blocking template/dependency/KTX suggestions. npm audit reported zero known advisories. Browser tests with synthetic native events and intercepted auth requests cover account gating, signup/sign-in/sign-out/recovery, Google PKCE launch/callback, quest baseline, live updates and local reset. These tests do not create real accounts or send emails. The user has confirmed installation and a displayed Health Connect daily count on S23; new live-sensor timing and actual auth email/OAuth flows still need device tests.

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

[Product](docs/product.md) · [Narrative](docs/narrative.md) · [Architecture](docs/decisions/0001-architecture.md) · [Decisions](docs/decision-ledger.md) · [Roadmap](docs/roadmap.md) · [Health](docs/health-connect.md) · [Accounts](docs/auth.md) · [Lives and reboot](docs/lives-and-reboot.md) · [Handoff](docs/handoff.md)

The supplied future GitHub repository is reserved; no remote or publication is configured. No open-source license has been chosen.
