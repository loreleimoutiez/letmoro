# Letmoro

A quiet walking adventure about carrying other people's letters and finding a life of your own.

Moro begins delivering letters to earn a living and build independence. Real-world steps are intended to support travel; personal decisions shape the story.

## Project status

An internal browser prologue is implemented with **simulated steps only**. It includes a fictional street crossing, an explicit job choice, an intact delivery, the first settlement, a knowledge-limited journal, secret first-job badge, discovered records, and local saving. The mobile-first main view shows a borderless white Moro square and a 1 px path on black; story, records, coins, and simulation controls live in a modal menu. A short refusal ending is a draft boundary, not the complete alternative campaign route.

This is not the first public campaign. Android, Capacitor packaging, Kotlin health access, Fit3 import, lives, traits, skills, accounts, synchronization, translations, and the full campaign are not implemented. No real health data is read. No public release or license has been selected.

## Development

Requires Node.js 22.12 or later. Verified locally with Node.js 22.23.2 and npm 10.9.8. Dependencies are pinned in `package-lock.json`: React 19.2.8, TypeScript 5.9.3, Vite 7.3.0. These versions were available in the local cache; they are not a claim of latest-version or security review.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run preview
```

The development server listens at `http://127.0.0.1:5173`. Production assets are written to `dist/`. A lockfile supports reproducible installation; online installation on a fresh machine still needs verification.

The UI and authored draft are in English. Choose a personal goal, then use the simulation buttons. No real walking is needed for the trial. Travel costs of 2% and 10% are temporary trial values. Stored steps never pass a personal decision automatically. The seven-goal reserve is implemented without production calendar accounting.

Saves remain in this browser under `letmoro.internal-prologue.v1`. They contain the chosen goal and simulated action history, not health records. Clearing browser storage removes them. Invalid or incompatible saves are kept until the player explicitly starts a replacement trial; unavailable storage produces a visible warning. There is no migration to a later campaign save yet.

## Structure

- `src/domain/`: deterministic progression and settlement, independent of platform APIs.
- `src/content/`: versioned English narrative and stable scene keys for future localization.
- `src/adapters/`: versioned save serialization and validated event replay.
- `src/ui/`: local-clock presentation rules.
- `src/main.tsx`, `src/style.css`: React interface and square-pixel world.
- `tests/`: progression, reserve, settlement, save validation, and time-boundary tests.

The current prototype uses white on black. The existing local-clock helper is retained and tested for future design work but does not control the interface. The locally bundled Press Start 2P font is by CodeMan38 and distributed under the [SIL Open Font License](public/fonts/OFL.txt); this dependency license does not select a license for Letmoro.

Type checking, seven behavioral tests, and the production build pass. Chrome checks cover the complete journey, save reload, secret badge unlock, discovery records, sealed letters, 320–1280 px overflow, and Escape/focus return. Screen-reader and physical Android checks remain pending.

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
