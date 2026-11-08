# Account-owned cloud saves

Status: initial migration applied to the verified hosted Letmoro project on 2026-11-06 through the connected Supabase integration. Owner policies, anonymous denial, foreign-owner RPC rejection and invoker privileges were verified remotely without touching player records. The security advisor found no database issue; its separate leaked-password-protection warning remains an Auth configuration task. Local cloud synchronization is enabled in ignored `.env.local`. Real-account cross-device round trips remain to verify.

## Owner setup

Apply [the migration](../supabase/migrations/20261106105934_player_saves.sql) to the existing Supabase project's SQL editor or migration workflow. It creates `player_saves`, authenticated owner-only row policies and the `save_player_progress` function. The initial migration has now been applied; do not re-run its CREATE statements against the deployed table. Never embed a database password or service-role key in the client.

After applying and verifying the migration, set `VITE_CLOUD_SAVES=true` in ignored `.env.local` and rebuild/restart the preview. The checked-in example defaults to false, for unconfigured checkouts; the owner’s ignored local configuration now enables synchronization. Test with two real test accounts before claiming live cross-device persistence. Anonymous reads/writes and cross-account access must fail.

## Data and ownership

Each account has one versioned snapshot. Its payload is the validated event-replay save, including profile, goal, decisions, letter outcomes, legacy synthetic changes when present, currency and delivery history, and daily health aggregate/checkpoint events used to avoid duplicate step credit. The selected language is stored alongside the payload. These daily counts/day keys are health-related data; enabling synchronization uploads them as part of progress. No raw sensor stream, GPS, password, session token or private narrative manuscript is uploaded in a game save. Supabase Auth already owns identity/account information separately.

The snapshot covers currently persisted gameplay and language, including fixed-zone life calendar/day observations and action timestamps when present. Intro playback position, permissions, live sensor readings and temporary UI state are not synchronized. Future campaign archives, rescue rights, export/deletion and retention policies still need their own design and implementation; this single snapshot does not implement those systems.

## Reconciliation

- Local progress remains usable if a read/write fails. An account Settings status reports whether saves are configured, pending, saved, unavailable or conflicting. Retry performs fresh reconciliation.
- On sign-in/reload, a fresh device restores the account snapshot. A clean previously synchronized device can also restore a newer remote snapshot.
- Unsynchronized local progress uploads when the known server revision still matches. Different unlinked or concurrently edited versions require an explicit player choice.
- Writes compare the expected revision atomically. Another device's newer revision is never silently overwritten by an old expected revision. This is startup/write synchronization, not continuous live collaboration across devices.
- Choosing the device version refetches the current revision before attempting a replacement; another intervening update can still reject it. Choosing the account version retains one account-local backup of this device's snapshot before restoring. Recovery of that backup is currently a developer operation, not a player-facing feature.
- Periodic checks batch changed progress approximately every 1.2 seconds while the app is open; continuous walking does not indefinitely postpone writes. Unchanged snapshots do not repeatedly upload. Object key ordering from PostgreSQL JSONB does not change save fingerprints.
- Confirmed full erasure in Settings writes a null-payload tombstone with a new revision before local cleanup when cloud saves are enabled. Failed online writes preserve local progress. Stale devices cannot silently resurrect pre-erasure progress. Legacy local reset markers remain supported for reconciliation; no simulator reset UI is shipped. Archive-preserving production reboot remains deferred.
- Account changes invalidate the previous synchronization session. RPC calls include an expected owner checked against `auth.uid()`, protecting against a session changing while a request is pending.

## Verification

`npm test` covers reconciliation, canonical fingerprints and test-action replay. Browser regression uses synthetic users and intercepted HTTP to cover uploads, restores, offline retry, explicit conflicts, local backup and reset. [SQL tests](../supabase/tests/player_saves.sql) exercise RLS, anonymous denial, owner validation, stale revisions and reset tombstones in an isolated test database; fixtures roll back.

The database policies and function follow [Supabase row security](https://supabase.com/docs/guides/database/postgres/row-level-security) and [database functions](https://supabase.com/docs/guides/database/functions). Applying this migration is necessary before enabling the client; writing these files alone does not create a live backup.


## Hosted deployment verification — 2026-11-06

The owner connected the Supabase integration and authorized the prepared migration. Project identity was checked against the ignored client configuration before execution. The initially empty public schema now contains `player_saves`; the migration is recorded in hosted history.

Verified remotely: RLS enabled; all three policies constrain ownership with `auth.uid()`; anonymous users cannot SELECT or execute the save RPC; the RPC is SECURITY INVOKER with an empty search path; authenticated foreign-owner calls fail. Access tests used transaction-local synthetic claims, performed no player writes, and rolled back. Earlier isolated SQL tests additionally cover stale revisions and tombstones. No personal records, secret keys or live sessions were queried.

The security advisor reports leaked-password protection disabled. This is separate from save isolation and has not been changed automatically. Actual account upload/restore across devices and offline recovery remain device checks before claiming operational cross-device backup.

The checked-in migration filename is aligned to hosted version `20261106105934` returned by migration history. Its SQL is unchanged; this avoids a future CLI push treating the same initial schema as a new migration.


## Explicit full erasure — 0.2.1

Latest user decision: allow a full fresh start, deleting game data including paths, letters, badges, journal, relationships, profile/settings and local conflict backup while retaining Supabase Auth identity/password/session. This explicit Settings action is distinct from the still-deferred archive-preserving narrative reboot. It intentionally keeps no game archive. It requires confirmation and, when cloud saving is enabled, a successful online null-payload revision before local cleanup. Failed network/CAS writes preserve the local game for retry. Other devices with stale revisions cannot silently restore the erased snapshot. No Auth row or physical Health Connect data/permissions is deleted. Language resets to English; setup returns.

A fresh-start replay marker baselines existing daily health steps instead of reconstructing the previous path; only subsequent increments supply new travel. The actual phone's daily health counter is not falsified or erased. The user authorized a temporary LAN-only APK download for their phone on the same Wi-Fi; no public publication or device install is performed by the agent.
