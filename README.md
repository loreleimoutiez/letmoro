# Letmoro

A quiet walking adventure about carrying other people's letters and finding a life of your own.

Moro begins delivering letters to earn a living and build independence. Real-world steps are intended to support travel; personal decisions shape the story.

## Project status

An internal browser prologue is implemented with **simulated steps only**. It includes a fictional street crossing, an explicit job choice, an intact delivery, the first settlement, a knowledge-limited journal, and local saving. A short refusal ending is a draft boundary, not the complete alternative campaign route.

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

The theme follows local time and refreshes while open and on focus/resume. Transition hours are provisional. Narrative time is independent of the clock. Semantic controls, visible keyboard focus, a skip link, responsive layout, and reduced-motion handling are included; browser and assistive-technology verification remains pending.

## Documentation

- [Product specification](docs/product.md)
- [Narrative bible](docs/narrative.md)
- [Architecture](docs/decisions/0001-architecture.md)
- [Delivery plan](docs/roadmap.md)
- [Contributing](CONTRIBUTING.md)
- [Session handoff](docs/handoff.md)
- [Decision ledger](docs/decision-ledger.md)

## Repository and license

The user reserved [the GitHub repository](https://github.com/loreleimoutiez/letmoro). No push or publication has been authorized or performed. The current workspace's `.git` directory is read-only and is not an initialized repository, so no local commit exists yet.

No open-source license has been selected. Public visibility does not itself grant permission to reuse the code or narrative.
