# Phone-only Health Connect trial

This is an internal Android read-only experiment. No watch, Google sign-in, cloud account, or server is required by Letmoro. Newly observed steps advance trial travel after a session baseline; no life penalties apply. Physical-device import remains to be verified.

## Build and install

Use Node.js 22.12+, JDK 21, Android SDK platform 36 and build tools requested by Gradle. Capacitor core/Android/CLI are pinned to 8.6.0, Health Connect to stable 1.1.0, Kotlin to 2.2.20. The internal application ID is `app.letmoro.internal`, minimum Android 9 (API 28).

```sh
npm ci
npm run android:build
adb devices -l
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Configure `JAVA_HOME` for JDK 21 and `ANDROID_HOME`, or set `sdk.dir` in the ignored `android/local.properties`. Do not commit machine-specific paths. Debug installation requires the user to enable USB debugging and accept the computer on the phone. This does not publish the app.

## Set up the phone

1. Update the phone and Google Play system components. Search Android Settings for Health Connect. It is built into Android 14+; older supported phones require the Health Connect app.
2. On supported Android 14+ devices, Health Connect can collect phone steps after an app receives step-read access. Phone step collection requires the relevant system update; Android documents SDK extension 20+ for this feature. If the phone's step source is unavailable, Samsung Health can serve as a source: enable its step writing in Health Connect and open Samsung Health to synchronize.
3. Open Letmoro → menu → Step connection → Connect Health Connect. Authorize reading steps only. No heart rate, location, write access, background reading, or historical-reading extension is requested.
4. Carry the phone while walking. Return to Letmoro. The bottom-right counter reads today's available aggregate. Foreground refresh runs every 15 seconds and on visibility/focus return; Refresh is also available in Step connection. This is not a guaranteed live sensor stream: upstream recording and synchronization may lag.
5. Use Manage access to inspect or revoke permission in Health Connect.

If the provider needs installation or an update, use Android Settings/Google Play; Letmoro reports unavailable. Refusal or revocation reports permission needed. An empty aggregate, read error, unavailable provider, or browser-only session displays `—`, never a fabricated zero. A genuine returned zero can display `0` but does not establish a finalized zero-step day.

## Implementation and privacy

Kotlin uses Health Connect's `aggregate` with `StepsRecord.COUNT_TOTAL` over local midnight to now, allowing the provider to deduplicate sources. Every read recalculates the current local date and zone. The TypeScript boundary validates nonnegative safe integers, preserves unknown states, and accepts corrected totals that decrease. The UI prevents overlapping reads and skips hidden-page polling. It clears the displayed value on read failure or revoked access.

Raw daily totals and the session cursor stay in memory. Accepted incremental travel credits enter the local narrative save, distinguished from simulated steps. No daily health history, credentials, or imported raw records enter Git, logs, or a server. Android app backup is disabled. Permission rationale is available through Health Connect. Production still needs durable reconciliation and calendar policy before offline crediting, rest, recovery, or life loss.

## Device validation checklist

Verify permission grant, denial, revocation and regrant; phone-only steps; empty provider; delayed synchronization; simultaneous phone/wearable sources; corrected totals; midnight and time-zone changes; background/resume; offline use; and no health data in narrative saves. Compare against Health Connect's own aggregate/source priorities rather than summing raw records. No claim of successful physical import until these checks run on an actual phone.

Moro's current opacity pulse is decorative: 4.8 seconds, opacity 0.48–1.0, disabled by reduced-motion preference. Heart-rate synchronization is only a future idea and requests no additional permission.

## References

- [Android: phone step tracking](https://support.google.com/android/answer/16786157?hl=en)
- [Android: read data and on-device steps](https://developer.android.com/health-and-fitness/health-connect/read-data)
- [Android: setup, permissions, and rationale](https://developer.android.com/health-and-fitness/health-connect/get-started)
- [Health Connect releases](https://developer.android.com/jetpack/androidx/releases/health-connect)
- [Samsung Health integration FAQ](https://developer.samsung.com/health/health-connect-faq.html)
- [Capacitor environment](https://capacitorjs.com/docs/getting-started/environment-setup)

## Current build validation

A debug APK was built successfully with `assembleDebug`; `lintDebug` reports no app errors and five non-blocking warnings about newer dependency versions and generated template resources. TypeScript, fourteen domain/save/profile/map/health tests, production build, and Chrome UI checks pass. Android compilation uses a local SDK 36; no connected phone was detected, so actual health permission and data import are unverified.

The user selected a direct Android app, superseding the PWA proposal. Near-instant step-by-step movement still needs a foreground Android sensor channel with explicit reconciliation. The current Health Connect channel refreshes every 15 seconds and must not be described as instant. No heart-rate access or Google OAuth client is configured. Account authentication is separate future work.

## Session travel crediting (internal trial)

Keep the app session running for this test. The first valid aggregate establishes the baseline without crediting the day's earlier activity. Later positive increases above the greatest already observed total add travel credits. Duplicate reads, errors, empty results, and downward corrections add nothing and never reverse story choices. Date/zone changes and a restarted process establish a new baseline. This trial does not credit steps taken between process termination and its next first reading. Durable background/offline reconciliation remains future work.

Daily raw totals/cursor are not persisted. Accepted increments enter local game progress with source `health`; simulated increments have a separate counter. Health Connect handles upstream aggregation and deduplication. Simulation buttons are development-browser-only and excluded from the Android production build. Finger dragging and manual map return controls are disabled. Pinch changes scale only. The yellow office lies beyond the intersection and appears after crossing.
