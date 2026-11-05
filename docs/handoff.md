# Session handoff

Updated on 2026-11-05. This file records implementation status, not a release announcement.

## Read first

Read `AGENTS.md`, `docs/decision-ledger.md`, `docs/product.md`, `docs/narrative.md`, `docs/decisions/0001-architecture.md`, and `docs/roadmap.md` before implementation. Respond in French; write project artifacts in English. Do not reopen settled preferences.

## Current workspace

The actual project is now `/home/lorelei/Documents/letmoro`; project files are writable. The earlier `/tmp/letmoro` recovery procedure is obsolete. No transfer is needed.

The workspace contains a read-only, empty `.git` directory. It is not a Git repository. Initialization and commits are blocked by that directory's permissions. Do not remove it or pretend commits exist. Once Git metadata becomes writable, check configured identity, initialize Git, and make focused Conventional Commits. Never invent identity.

The user has provided the empty remote for later: `https://github.com/loreleimoutiez/letmoro.git`. No remote has been configured, and no push or publication is authorized. No license has been chosen.

## Implemented milestone

An internal React/TypeScript/Vite prologue now exists:

- Personal goal entry, simulated step buttons, capped seven-goal reserve.
- Fictional street crossing, job acceptance or quiet refusal draft ending, courtyard journey, explicit intact delivery, and 8 minus 2 minus 2 settlement.
- Decisions cannot be crossed automatically. Invalid transitions and duplicate payment are rejected.
- Versioned English scene content and event-based journal limited to encountered information.
- Domain logic independent of React/storage; versioned save encode/decode with event replay validation.
- Local browser persistence, explicit replacement confirmation, visible storage errors, preservation of unreadable saves until explicit replacement.
- Abstract square-pixel surroundings; provisional day/dusk/night palette follows local clock with interval, focus, and visibility refresh.
- Responsive CSS, semantic controls, visible focus, skip link, live scene announcements, no animation.

The refusal branch is only a clearly labeled internal endpoint. Full refusal routes, cast, campaign, traits, lives, skills, accounts, translations, Android, Capacitor, Kotlin, and health integration remain unimplemented. Do not describe this trial as the public campaign.

Trial-specific assumptions: goal stays fixed within a trial; street travel costs 2%, courtyard travel 10%, each rounded up with a one-step minimum. No calendar, health, punishment, or daily accounting. These are not newly settled product rules.

## Toolchain and verification

Node.js 22.23.2, npm 10.9.8. React 19.2.8, TypeScript 5.9.3, Vite 7.3.0 are pinned with a lockfile. npm registry lookup could not complete. Installation succeeded offline from a writable copy of the existing npm cache at `/tmp/letmoro-npm-cache`, using `npm install --offline --cache=/tmp/letmoro-npm-cache --ignore-scripts`. No dependency lifecycle scripts ran. The Vite production build still succeeded. Fresh online `npm ci` and a current dependency security review remain pending. Offline npm's audit output is not a verified online vulnerability check.

Passed: TypeScript check, six domain/save/time tests, production build. Direct execution with `node --experimental-strip-types tests/prologue.test.ts` displays all six tests; this sandbox's isolated test-runner output reports a single file.

Blocked: `npm run dev` cannot listen on 127.0.0.1 (EPERM). Browser verification was also attempted with Playwright and installed Chrome, serving build assets through intercepted requests to avoid a local server. Chrome exits with SIGTRAP after a denied socket operation. No browser rendering, keyboard, reload persistence, or mobile visual checks can be claimed. Temporary Playwright tooling is outside the repository and is not a project dependency.

## Next work

1. Run the browser trial in an environment permitting local sockets. Inspect desktop/mobile layout, keyboard sequence, screen-reader announcements, clock changes, successful reload, invalid-save handling, and unavailable storage. Verify that only discovered surroundings appear.
2. Make Git metadata writable through the workspace environment, check identity, initialize, and commit the verified foundation. Do not push without authorization.
3. Verify a clean install and review current dependency advisories before public distribution.
4. Continue authored campaign structure and cast; deepen the refusal route before treating it as continuing gameplay. Keep private-life and non-romantic/non-political routes complete.
5. Resolve production goal/reserve/calendar rules when they become necessary. Do not infer missing data means zero steps.
6. Validate S23 + Fit3 → Samsung Health → authorized Health Connect import on actual hardware before health penalties or cadence promises. Capacitor and Kotlin setup remain future work.

The user authorizes ongoing local development, stack selection, documentation upkeep, and Conventional Commits. No sub-agent delegation, publication, contact with others, or legal license choice is authorized.
