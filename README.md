# Letmoro

A quiet walking adventure about carrying other people's letters and finding a life of your own.

Moro begins delivering letters to earn a living and build independence. Real-world steps are intended to support travel; personal decisions shape the story.

## Project status

An internal Android prologue with a browser development preview is implemented with **simulated steps only**. It includes a fictional street crossing, an explicit job choice, an intact delivery, the first settlement, a knowledge-limited journal, secret first-job badge, discovered records, and local saving. The mobile-first main view shows a borderless white Moro square and a 1 px path on black; three red life squares appear at the upper left, coins at the lower left, and health steps at the lower right. A compact menu holds story, collection, connection, and settings. A short refusal ending is a draft boundary, not the complete alternative campaign route.

This is not the first public campaign. Capacitor Android packaging and a read-only Kotlin Health Connect experiment are now present. Phone-only steps can be tested after installing an Android build and granting access; physical import is not yet verified. Fit3 import, life accounting, trait effects, skills, accounts, synchronization, and the full campaign remain unimplemented. Real step observations stay in memory and do not affect the simulated story. No public release or license has been selected.

## Development

Requires Node.js 22.12 or later. Verified locally with Node.js 22.23.2 and npm 10.9.8. Dependencies are pinned in `package-lock.json`: React 19.2.8, TypeScript 5.9.3, Vite 7.3.7. Capacitor packages are pinned to 8.6.0. The dependency audit was refreshed during the Android work.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run preview
```

The development server listens at `http://127.0.0.1:5173`. Production assets are written to `dist/`. A lockfile supports reproducible installation; online installation on a fresh machine still needs verification.

The UI and narrative draft are available in French and English. A new run asks for a daily goal, difficulty, and three compatible positive and negative traits, followed by a short introduction. Difficulty and trait effects are not active in this trial. Use Settings → Internal trial for simulated walking. No real walking is needed for the trial. Travel costs of 2% and 10% are temporary trial values. Stored steps never pass a personal decision automatically. The seven-goal reserve is implemented without production calendar accounting.

Saves remain in this browser under `letmoro.internal-prologue.v1`. They contain the chosen goal, optional validated run setup, and simulated action history, not health records. Clearing browser storage removes them. Invalid or incompatible saves are kept until the player explicitly starts a replacement trial; unavailable storage produces a visible warning. There is no migration to a later campaign save yet.

## Structure

- `src/domain/`: deterministic progression and settlement, independent of platform APIs.
- `src/content/`: English source narrative, French translation, and stable localization keys.
- `src/adapters/`: versioned save serialization and validated event replay.
- `src/ui/`: world camera, setup, pixel icons, and live step observation hook.
- `src/main.tsx`, `src/style.css`: React interface and square-pixel world.
- `tests/`: progression, reserve, settlement, save validation, and time-boundary tests.

The current prototype uses white on black. The existing local-clock helper is retained and tested for future design work but does not control the interface. The locally bundled Press Start 2P font is by CodeMan38 and distributed under the [SIL Open Font License](public/fonts/OFL.txt); this dependency license does not select a license for Letmoro.

Type checking, thirteen behavioral tests, and the production build pass. Chrome checks cover the complete journey, save reload, secret badge unlock, discovery records, sealed letters, 320–1280 px overflow, and Escape/focus return. Android APK compilation and lint pass (0 app errors, 5 warnings for newer dependency versions and template-generated resources). Screen-reader and physical Android checks remain pending.

## Documentation

- [Product specification](docs/product.md)
- [Narrative bible](docs/narrative.md)
- [Architecture](docs/decisions/0001-architecture.md)
- [Delivery plan](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)
- [Session handoff](docs/handoff.md)
- [Decision ledger](docs/decision-ledger.md)

## Repository and license

The user reserved [the GitHub repository](https://github.com/loreleimoutiez/letmoro). No push or publication has been authorized or performed. Git is initialized on `main` with local Conventional Commits. No remote is configured.

No open-source license has been selected. Public visibility does not itself grant permission to reuse the code or narrative.

## Android step experiment

See [phone-only Health Connect setup](docs/health-connect.md) for build requirements, installation, permissions, and actual-phone checks. No Google login or watch is needed by Letmoro. The browser cannot access Health Connect. The HUD shows three fixed red life squares and an unknown-safe step count; the menu contains the step connection. Moro pulses slowly without disappearing and respects reduced motion. Menu navigation groups records in Collection and places Settings at the bottom, using pixel icons without numbering. Moro remains centered as the discovered path moves below; only known path positions are reachable by dragging. Pinch zoom becomes available after the first journey. Revisiting changes map position, not narrative events; return encounters are not authored.

The current target is an Android app, as explicitly selected after considering a PWA. Browser tooling remains for development only; no service worker or PWA install flow is shipped. The black underlined-square mark is authored in SVG/vector code, with a reproducible PNG generator in `scripts/icons.mjs`. No AI artwork is used.

The balance appears in the lower-left HUD and opens its own detail view; it is not repeated below collections. A small yellow square marks the delivery office only after discovery.
