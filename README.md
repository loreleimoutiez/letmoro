# Letmoro

A quiet Android walking adventure about delivering letters and finding a life of your own.

## Status

An internal Android build is available for device testing. This is not the complete first public campaign. The current story covers meeting Moro, a fictional street crossing, a job decision, one delivery with sealed/opened/destroyed outcomes and its settlement, followed by an initial playable neighborhood with optional unpaid errands. Refusal allows reconsideration or neighborhood exploration. This is still a small opening slice.

Implemented:

- Minimal black/white pixel interface, centered borderless Moro, a discovered 1 px path, three life squares driven by persisted day accounting, coins and steps. No finger-drag travel; pinch changes zoom only.
- Account creation/sign-in before game preferences: Supabase email/password, confirmation, recovery, sign-out, and Google OAuth through the system browser. Google and email are enabled on the configured test service; actual device email/OAuth round trips still need verification.
- English by default, saved French/English preference, daily goal, difficulty descriptions and three compatible positive/negative traits. Trait mechanics and pause/rescue/production reboot remain pending; life/rest/recovery now have tested source rules, with real history processing validation-gated.
- Four short introduction screens explain walking and explicit choices. Small text sits above Moro, controls below. A fading “Walk…” cue follows. Settings can replay the introduction without resetting progress.
- Health Connect daily aggregate import plus optional foreground Android step-detector events. Counter-sensor fallback may be slower. Foreground synchronization fallback runs every 3 seconds; this is not background tracking.
- Quest progress as `current / required steps`. Existing daily activity may reveal a longer starting path, but the first quest starts only after the introduction and initial step connection. One accepted step equals one world CSS pixel at normal zoom; important choices still wait.
- Local saves isolated by account, validated event replay, persistent step deduplication, hidden locked badges, a first-job pixel medal and an underlined-square app mark.
- Temporary test toolbar at the bottom of the development preview: edit coins, add fictional steps, replay introduction and confirm a game reset. These controls are removed from Settings. Fictional steps stay separate from real health totals. Normal builds omit the toolbar; explicit internal builds can enable `VITE_INTERNAL_TOOLS=true`.

Full campaign, further return encounters, deeper letter consequences, numerical trait/skill mechanics, mode switching, physical historical-day validation, pause, account-wide rescue, live cloud-save deployment, heart-rate feedback and time-of-day presentation remain ahead. No public release, push or project license has been selected.

New source features include arrival choices above Moro, dialogue details that replace initial choices, explicit work acceptance, letter opening/destruction, reversible step-funded cardinal routes, last-encounter map markers and character gallery, first-action letter badges and the Basic respect skill root. Map zoom supports pinch/wheel/buttons/keyboard and fitting known paths, without a percentage readout; Moro scales with zoom. The arrival road can continue backward past its original start; a discreet counter tracks remaining quest distance including detours. Journal is newest-first with local timestamps; unknown skills remain hidden. Postal delivery is the territory's only available employment. New narrative text and the authoring tree live in an ignored local pack; a checkout without it uses generic opening content and cannot open unread letters. See [private authoring](docs/narrative-authoring.md). No new Android APK is claimed for these changes.

A health invitation appears before the map when access is absent. Life/rest/recovery and a zero-life guard are implemented with fictional-day testing; `VITE_LIFE_RULES=false` keeps real historical penalties off until phone validation. Pause, rescue and production reboot are deferred. See [life rules](docs/lives-and-reboot.md). Supabase deployment remains pending connection of the discovered integration; writing the migration has not created a live backup.

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

Daily step checkpoints and game progress are saved locally by authenticated account. An opt-in cloud adapter and owner-isolated database migration are implemented but not deployed; see [cloud saves](docs/cloud-saves.md). The current default remains local-only. The first authenticated account can claim an older local save once. Authentication tokens and PKCE verifiers use Android Keystore-backed AES-GCM encryption; passwords are never persisted. Browser preview sessions use session storage. Android backup/transfer and native logging are disabled. With cloud saves disabled, only authentication contacts Supabase. Enabling cloud saves also uploads persisted gameplay and daily step/checkpoint events.

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
