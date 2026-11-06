# Private narrative authoring

The intended public repository contains the runtime, content interfaces and behavioral tests. Do not commit new private dialogue, letter bodies, hidden conditions, biographies, campaign trees or endings. Existing tracked prologue drafts predate this separation and remain in history.

## Local opening pack

`src/content/private/` is ignored by Git. The local `opening.json` supplies `en` and `fr` objects matching `OpeningContent` in `src/content/narrative.ts`. English is source; French is translation. Vite includes the optional pack at build time. No remote content service, private repository, update protocol or backup exists yet.

The optional `visits` section now supplies neighborhood dialogue/errand text, and `characters` includes the current four encountered-character identities/colors. Generic tracked stage copy keeps a checkout buildable without these private scenes.

The local `tree.txt` is the vertical authoring view. Label implemented branches separately from planned scenes and mechanics. Keep it synchronized with manuscript and runtime progress. The tree is an authoring artifact, not a player-visible map or an implemented year-long campaign.

Without the pack, the app uses the tracked generic prologue, hides optional questions, uses generic character identities, and disables opening unread letters. Existing opened/destroyed/delivered event histories remain readable. Rebuild after adding or changing a pack. The letter body and identities are never put into game-save events; events store actions and known topic identifiers.

Ignored files are not backed up by Git. Preserve them separately before moving or cleaning this workspace. A separate private repository remains an owner decision. Do not force-add manuscripts to this repository.

## Verification and distribution

Run TypeScript, behavioral tests and a production build, then exercise both locales and letter outcomes in the browser. Also verify a build without the private directory. Check `git check-ignore src/content/private/opening.json` before staging and review staged filenames.

Compiled client assets and Android packages contain any included manuscript. Repository privacy does not prevent extraction from a distributed application. No publication or remote upload has been authorized.

New runtime events extend the existing replay format without changing prior actions. Generation prologue-4 adds stable campaign letter IDs, an item-state map, relationships, thought IDs and schedule events while accepting prologue-1/2/3 saves. Keep these IDs stable; never rewrite the meaning of shipped events. Future content generations and replay compaction still need explicit migration design.

## Expanded local pack contract

`campaign` contains localized letter titles/offers/bodies/delivery/report text, visited-place copy, seven conversation prompts/options/responses, thirty conditional thoughts, earned-badge copy and a closing scene. Runtime mechanics remain separate from prose. Missing manuscript: the generic first delivery works and campaign entry is absent. Only opened bodies are rendered, including after destruction; sealed/delivered-sealed bodies are never shown. A silent destination never reacts as a live recipient. Do not force-add local trees or manuscripts.
