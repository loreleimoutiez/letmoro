# Session handoff

Updated on 2026-11-05. Internal implementation milestone, not a public release.

## Read first

Read `AGENTS.md`, `docs/decision-ledger.md`, `docs/product.md`, `docs/narrative.md`, `docs/decisions/0001-architecture.md`, and `docs/roadmap.md`. Respond in French; write artifacts in English. Latest user decisions override earlier proposals.

## Workspace and authorization

Project: `/home/lorelei/Documents/letmoro`. Git was initialized using the existing configured identity; local Conventional Commits are authorized and exist on `main`. Git metadata writes may require sandbox escalation. No remote is configured, no push is authorized, and no project license has been chosen. The supplied future remote is `https://github.com/loreleimoutiez/letmoro.git`.

Local development and documentation upkeep are authorized. No sub-agent delegation, publication, or contact with others is authorized.

## Implemented

React/TypeScript/Vite internal prologue with personal goal, simulated steps, seven-goal reserve, explicit story choices, intact delivery, 8 minus 2 minus 2 settlement, event journal, validated versioned local saves, storage warnings, and explicit trial replacement. Invalid saves remain until explicit replacement. Trial costs are 2% and 10%, rounded up, not final balance.

Latest interface revision: mobile-first black viewport, borderless white Moro square, 1 CSS px path below with a gap, and one menu button. No visible map text, scenery, counters, or branding. Native modal dialog holds story, letters, encountered characters, badges, coins, journal, and internal trial controls. Character and letter lists start empty. The first badge hides its title/description until job acceptance. Records derive from saved events and survive reload without a schema change. Letters remain sealed; opening and authored letter contents are not implemented. Other badges are not authored.

English currency is coins; French remains sous. Internal `Run.sous` stays compatible. Press Start 2P is bundled locally with its OFL in `public/fonts/`; no external font request and no project license selection. The automatic time palette is deferred by the latest user direction. `src/ui/time.ts` is retained but unused by the interface.

## Verification

Node 22.23.2, npm 10.9.8; dependencies pinned with lockfile. Type checking, seven behavioral tests, and production build pass. Existing dependencies were previously installed offline; fresh online install and current advisory review remain pending.

The earlier socket/browser block no longer reproduces. Vite successfully served on 127.0.0.1:5174 (5173 was occupied). Headless installed Chrome with temporary Playwright outside the repository verified map geometry, 1 px path, no square overlap, initially empty characters, secret badge then unlock, complete delivery and settlement, reload persistence, sealed delivered letter, no page/dialog horizontal overflow at widths 320/390/768/1280, Escape closing with focus returned to menu, and no runtime errors. Mobile screenshots were visually inspected. Temporary browser script: `/tmp/letmoro-browser/redesign.cjs`; screenshots: `/tmp/letmoro-mobile-map.png` and `/tmp/letmoro-mobile-menu.png`. These are local verification artifacts, not repository dependencies. Physical Android and screen-reader validation remain pending.

## Next

See `docs/roadmap.md` for the ordered next steps. Prioritize actual mobile interaction, authored letters and opening decisions, first-act/refusal writing, then time-of-day design and Android hardware proof. Full campaign, traits, lives, skills, accounts, translations, Capacitor, Kotlin, and health import remain unimplemented. Missing health data must never mean zero steps. No health penalties before validated data and calendar rules.
