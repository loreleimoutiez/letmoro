# Private narrative authoring

The intended public repository contains the runtime, content interfaces and behavioral tests. Do not commit new private dialogue, letter bodies, hidden conditions, biographies, campaign trees or endings. Existing tracked prologue drafts predate this separation and remain in history.

## Local opening pack

`src/content/private/` is ignored by Git. The local `opening.json` supplies `en` and `fr` objects matching `OpeningContent` in `src/content/narrative.ts`. English is source; French is translation. Vite includes the optional pack at build time. The owner created a separate private GitHub repository, `letmoro-manuscript`. A local Git copy lives in ignored `.manuscript/`. The owner confirmed the initial push; local `origin/main` tracks that initial snapshot. This environment still lacks GitHub authentication, so new commits cannot be uploaded or remote visibility independently queried here. No runtime download service or content update protocol exists.

The optional `visits` section now supplies neighborhood dialogue/errand text, and `characters` supplies identities/colors for the current ten encounterable characters excluding Moro. Generic tracked stage copy keeps a checkout buildable without these private scenes.

The local `tree.txt` is the vertical authoring view. Label implemented branches separately from planned scenes and mechanics. Keep it synchronized with manuscript and runtime progress. The tree is an authoring artifact, not a player-visible map or an implemented year-long campaign.

Without the pack, the app uses the tracked generic prologue, hides optional questions, uses generic character identities, and disables opening unread letters. Existing opened/destroyed/delivered event histories remain readable. Rebuild after adding or changing a pack. The letter body and identities are never put into game-save events; events store actions and known topic identifiers.

Ignored files are not backed up by Git. Preserve them separately before moving or cleaning this workspace. The separate private repository is now selected; an independent backup on another medium is still pending. Do not force-add manuscripts to this repository.

## Verification and distribution

Run TypeScript, behavioral tests and a production build, then exercise both locales and letter outcomes in the browser. Also verify a build without the private directory. Check `git check-ignore src/content/private/opening.json` before staging and review staged filenames.

Compiled client assets and Android packages contain any included manuscript. Repository privacy does not prevent extraction from a distributed application. The owner selected the private manuscript repository for backup. This does not authorize public manuscript publication or pushing application changes.

New runtime events extend the existing replay format without changing prior actions. Current generation `prologue-10` accepts `prologue-1` through `prologue-9`. Earlier generations introduced stable campaign letter IDs, item states, relationships, thoughts and schedules; later generations added skill purchases, explicit secondary-path discovery and conditional return choices. Keep these IDs stable; never rewrite the meaning of shipped events. Future content generations and replay compaction still need explicit migration design.

## Expanded local pack contract

`campaign` contains localized letter titles/offers/bodies/delivery/report text, visited-place copy, recurring conversation prompts/options/responses, three conditional return follow-ups, secondary-passage/reply outcomes, thirty conditional thoughts, earned-badge copy and a closing scene. Runtime mechanics remain separate from prose. Missing manuscript: the generic first delivery works and campaign entry is absent. Only opened bodies are rendered, including after destruction; sealed/delivered-sealed bodies are never shown. A silent destination never reacts as a live recipient. Do not force-add local trees or manuscripts.


## Separate manuscript workflow

The ignored `.manuscript/` directory is a separate Git repository with its own `origin`, history and commits. Its initial snapshot preserves the four existing manuscript files byte for byte. The existing `src/content/private/` copies remain in place. Never add either directory to the application repository.

The owner confirmed pushing the initial snapshot on 2026-11-09. Keep `loreleimoutiez/letmoro-manuscript` Private. On a future setup or before uploading new drafts, use an authenticated terminal to fetch and inspect remote history:

```sh
git -C .manuscript fetch origin
git -C .manuscript branch -r
```

For the prepared checkout whose local branch tracks the owner-pushed `origin/main`, push committed manuscript updates with:

```sh
git -C .manuscript push -u origin main
```

If remote history has advanced or a new checkout has unrelated history, inspect and integrate it first; do not force-push or overwrite remote content. Verify the uploaded files and restore a fresh clone before claiming remote backup complete. Authentication credentials belong in the system's Git credential manager, never in commands, project files or chat.

For later work, edit and commit the manuscript in that separate repository, then prepare local runtime content:

```sh
npm run manuscript:import
npm run manuscript:import -- --check
```

The command accepts an optional repository path and requires a clean committed source with all four required regular files and EN/FR opening content. It refuses to overwrite divergent local text by default. Preserve local edits in the manuscript repository first. If replacement is intended, `--replace` copies the previous files into ignored `.manuscript-backups/` before replacement. These same-disk copies are recovery aids, not independent backups. It does not delete additional private files or upload anything.

The import writes ignored `src/content/private/source-version.json` with the source commit and SHA-256 hashes. Preserve this manifest with local build records to trace manuscript input. It is not automatically embedded in APK metadata; the existing 0.6.0 APK is unchanged. A future checkout can clone the private repository into `.manuscript/` and run the same import command.


## Arc I closing plan — 2026-11-09

The private repository now contains `arc-one-closure.md`: a continuity audit, proposed route/convergence/ending conditions, six closing scene blocks with French translations, and an integration acceptance matrix. It separates the current correspondence-round milestone from the future arc ending, preserves refusal/nonattendance paths, and removes mandatory optional-report quotas from the earlier draft. It does not integrate new runtime scenes or complete Arc I. The existing continuation/tree/skill notes now distinguish playable behavior from draft material.

The new closing document stays in the separate manuscript repository; the current import copies only its four required files and does not copy this additional planning file into runtime content. The playable `opening.json` is unchanged. No new trait effect, purchase price, reward, badge or skill rule is introduced by the plan. Next: fully author the next bounded loop and its outcome variants before implementing it.


## Second-loop source integration — 0.7.0

`campaign.stairPassage` supplies localized discovery/direction text, request choices, witnessed-claim/disclosure/correction outcomes, final response variants and journal wording. Its six additional `letters` entries have independent stable IDs and sealed bodies. One added character/conversation and three map nodes accompany the two independently learned connections. Existing playable text is unchanged; additions were compared against the previous private commit. The source now implements this loop, while the closing-plan document and remaining continuation are still authoring material. Keep completed meetings/repairs distinct from communicated intentions.
