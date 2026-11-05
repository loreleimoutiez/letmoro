# Contributing

Use English for identifiers, comments, documentation, commit messages, and source content. Keep game rules separate from UI and platform integrations.

## Commits

Use Conventional Commits, with focused changes:

- `docs: record campaign design`
- `feat: add delivery settlement`
- `fix: preserve pending steps during synchronization`

Do not commit secrets, personal health data, signing keys, generated build output, or local environment files. Commit the package lockfile when dependencies are installed.

## Validation

Run `npm run check`, `npm test`, and `npm run build` before committing implementation changes. Exercise the browser interface when the environment permits it; report blocked checks explicitly. Add meaningful tests for progression, economy, health synchronization, save migrations, and life rules. Do not substitute snapshot coverage for behavior verification.

Narrative changes must check conditions, reachable outcomes, journal knowledge, pronoun neutrality, localization keys, and continuity. Every major route must have a developed resolution.

## Accessibility and visuals

World objects use square pixels only. Use readable text and semantic controls outside the world. Respect reduced motion, support keyboards, and do not communicate essential information through color alone. No AI-generated artwork.
