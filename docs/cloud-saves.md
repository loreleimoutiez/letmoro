# Account-owned cloud saves

Status: migration and opt-in client implemented; not deployed to the actual Supabase project. Local browser tests use intercepted requests. SQL was verified against an isolated PostgreSQL 16 database with synthetic Auth roles/users, not against the production service.

## Owner setup

Apply [the migration](../supabase/migrations/202611060001_player_saves.sql) to the existing Supabase project's SQL editor or migration workflow. It creates `player_saves`, authenticated owner-only row policies and the `save_player_progress` function. This session has no administrative connection to that project and did not execute remote SQL. Never embed a database password or service-role key in the client.

After applying and verifying the migration, set `VITE_CLOUD_SAVES=true` in ignored `.env.local` and rebuild/restart the preview. The checked-in example defaults to false, so the current ordinary configuration still saves locally. Test with two real test accounts before claiming live cross-device persistence. Anonymous reads/writes and cross-account access must fail.

## Data and ownership

Each account has one versioned snapshot. Its payload is the validated event-replay save, including profile, goal, decisions, letter outcomes, test changes, currency and delivery history, and daily health aggregate/checkpoint events used to avoid duplicate step credit. The selected language is stored alongside the payload. These daily counts/day keys are health-related data; enabling synchronization uploads them as part of progress. No raw sensor stream, GPS, password, session token or private narrative manuscript is uploaded in a game save. Supabase Auth already owns identity/account information separately.

The snapshot covers currently persisted gameplay and language. Intro playback position, permissions, live sensor readings and temporary UI state are not synchronized. Future campaign archives, rescue rights, export/deletion and retention policies still need their own design and implementation; this single snapshot does not implement those systems.

## Reconciliation

- Local progress remains usable if a read/write fails. An account Settings status reports whether saves are configured, pending, saved, unavailable or conflicting. Retry performs fresh reconciliation.
- On sign-in/reload, a fresh device restores the account snapshot. A clean previously synchronized device can also restore a newer remote snapshot.
- Unsynchronized local progress uploads when the known server revision still matches. Different unlinked or concurrently edited versions require an explicit player choice.
- Writes compare the expected revision atomically. Another device's newer revision is never silently overwritten by an old expected revision. This is startup/write synchronization, not continuous live collaboration across devices.
- Choosing the device version refetches the current revision before attempting a replacement; another intervening update can still reject it. Choosing the account version retains one account-local backup of this device's snapshot before restoring. Recovery of that backup is currently a developer operation, not a player-facing feature.
- Periodic checks batch changed progress approximately every 1.2 seconds while the app is open; continuous walking does not indefinitely postpone writes. Unchanged snapshots do not repeatedly upload. Object key ordering from PostgreSQL JSONB does not change save fingerprints.
- A test reset writes a null-payload tombstone with a new revision, so an older device cannot silently resurrect pre-reset progress. An unsynchronized local reset is marked locally and may require reconciliation. Temporary reset still clears gameplay; production reboot/archive rules remain separate.
- Account changes invalidate the previous synchronization session. RPC calls include an expected owner checked against `auth.uid()`, protecting against a session changing while a request is pending.

## Verification

`npm test` covers reconciliation, canonical fingerprints and test-action replay. Browser regression uses synthetic users and intercepted HTTP to cover uploads, restores, offline retry, explicit conflicts, local backup and reset. [SQL tests](../supabase/tests/player_saves.sql) exercise RLS, anonymous denial, owner validation, stale revisions and reset tombstones in an isolated test database; fixtures roll back.

The database policies and function follow [Supabase row security](https://supabase.com/docs/guides/database/postgres/row-level-security) and [database functions](https://supabase.com/docs/guides/database/functions). Applying this migration is necessary before enabling the client; writing these files alone does not create a live backup.
