# Android step integration

Health Connect reads the daily aggregate; optional foreground sensors provide faster motion feedback. No watch is needed for the first S23 test. No heart-rate, location, write, extended-history or background health permission is requested. No life penalties run.

## Setup

Build with Node.js 22.12+, JDK 21, SDK 36 and `npm run android:build`. The package is `app.letmoro.internal`, minimum Android 9. Current update: 0.2.0 / versionCode 5. See README and account setup for local configuration and installation.

After account login, game setup and introduction, open Step connection and authorize Health Connect step reading. On supported updated Android 14+ devices, the phone can collect steps itself; Samsung Health can also write steps with its own granted permissions. The user confirmed a daily total on S23.

Choose Enable live steps to grant Android physical activity permission. The foreground detector emits step events directly; a counter fallback may have more latency. Provider refresh runs every 3 seconds while visible and on return, not every 15 seconds. No guarantee of universal immediate sensor delivery: actual S23 and multiple-source timing still need tests.

## Quest origin and movement

The first daily total is recorded and may lengthen the starting path, but does not grant the new quest's distance. `start-journey` saves an origin after both introduction and connection. New increases then populate travel reserve. With a chosen goal, trial crossing/delivery cost 2%/10%, rounded up. One accepted step is one world CSS pixel at normal zoom. Quest UI is `current / required steps`. At explicit decisions Moro waits, with extra steps in reserve. Finger dragging cannot move the world; pinch only changes scale.

## Reconciliation and privacy

Kotlin aggregates `StepsRecord.COUNT_TOTAL` from local midnight, using Health Connect deduplication. A native live session anchors to the last known daily estimate and counts foreground sensor events. Provider and live estimates are combined by maximum, not added. The last accepted local checkpoint floors the next sensor baseline. Acquisition stops on pause/sign-out. A missing provider reading is not fabricated as zero.

Validated `health-sync` events atomically reconstruct daily high-water marks and travel credits. Duplicate/lower readings do not grant more steps or reverse story. Zone changes conservatively rebaseline. Legacy undated credits are retained conservatively; multi-day legacy migration can under-credit. The app does not yet finalize production calendar, late corrections, device reboots or all wearable/source overlap cases. The native combiner tests establish expected overlap behavior, not universal hardware accuracy.

Daily checkpoints/estimates and game progress are sensitive local data, saved per authenticated account. They are not sent to Supabase, logs, Git or a server. Native permission rationale describes local persistence. Backup/transfer and native logging are disabled. Account authentication is separate from health access; Google sign-in does not grant Health Connect permission.

## Verification and next device tests

TypeScript, 59 behavioral tests, 3 Kotlin overlap/resume/new-day tests, synthetic browser checks and Android compilation/lint pass. Earlier dependency audit found no known advisories; no dependency version changed in 0.2.0. The user confirmed installation and basic daily count display. Live detector latency and native permission/resume behavior are not yet physically verified.

Test: grant/deny/revoke physical and Health Connect access; foreground walking; provider catch-up; pause/resume; midnight and zone changes; repeated starts; overlapping phone/wearable sources; offline conditions. Keep life rules disabled until data/calendar semantics are validated.

USB was unstable and Wi-Fi debugging did not connect after pairing. The temporary local download directory must contain APKs only; no health files, auth values, device addresses or pairing codes belong in the repository.

References: [Android motion sensors](https://developer.android.com/develop/sensors-and-location/sensors/sensors_motion), [phone step recording](https://support.google.com/android/answer/16786157?hl=en), [Health Connect reads](https://developer.android.com/health-and-fitness/health-connect/read-data), [Samsung integration](https://developer.samsung.com/health/health-connect-faq.html).


## Arrival and completed-day accounting — 2026-11-06

The app now invites a connection before the map/Walk cue when no authorized connection is detected. Permission is requested only after the user presses Connect; already authorized ready/empty states skip the gate. Browser preview can continue without health access. Revoking access never creates zero-step days.

`readClosedDays` is a new native source method. It reads complete date ranges in the run's fixed zone, after 24 actual hours of grace, and preserves absent/inaccessible metrics as unknown. It reads a recent window and rotates through older recorded dates to pick up late corrections without adding a new permission. Read failures cannot erase an already confirmed daily total. The data is used only for day accounting, not duplicate travel credit.

`VITE_LIFE_RULES` defaults false until this new historical method is physically verified. Automated synthetic-day and mocked-native browser checks exercise the reducer and bridge protocol; they do not validate real historical Samsung/Fit3 data. Kotlin/Android compilation and three native unit tests now pass. The internal day controls have been removed from the interface. Existing today's-step hardware confirmation does not establish reliability of this new historical path. See [life accounting](lives-and-reboot.md).

The rationale now explains daily history, local checkpoints and optional account backup. With cloud backup enabled, persisted daily totals/checkpoints and life events are part of the player's snapshot; passwords/tokens are excluded. No actual health observations were added to this repository.
