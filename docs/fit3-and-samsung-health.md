# Fit3, Samsung Health and Android surfaces

Research checked against official Samsung/Android sources on 2026-11-07. No partner application was submitted and no person/company was contacted. Direct Samsung SDK access and live Fit3 sensor streaming are not implemented.

## Current status and diagnostic approach

The owner initially reported that Samsung Health matched the Fit3 while Letmoro lagged. After the 0.4.0 query correction, the owner confirmed matching totals after synchronization. Midnight, prolonged absence, closed-day history/corrections and repeatability remain to validate; the earlier mismatch must not be presented as the latest unresolved observation. Current Letmoro reads Health Connect, not Google Fit or the Google Health cloud API. Its optional phone sensor is an additional estimate and is not a Fit3 sensor reading.

The native response now separately reports the provider aggregate, provider-read timestamp and whether the contributing data origins include Samsung Health. The connection screen exposes these values without persisting extra diagnostic health records in game saves. No missing aggregate becomes zero. A read timestamp is not the source's ingestion timestamp. These probes identify the boundary; they do not prove the issue fixed.

Samsung documents step sharing through Health Connect and instructs checking permissions from Samsung Health's settings. Reopen Samsung Health after granting permissions, then refresh Letmoro. Check both Samsung Health write-steps and Letmoro read-steps access. See [Samsung Health Connect FAQ](https://developer.samsung.com/health/health-connect-faq.html).

The relevant comparison is Fit3 → Samsung Health → the shared total shown in Letmoro's diagnostic details → combined displayed estimate. If the shared total lags, investigate export/permissions; if the shared total matches but displayed/travel state does not, investigate Letmoro's reconciliation. Never sum overlapping sources to force a match or enable life penalties to test missing data.

## Direct Samsung Health access

Samsung Health Data SDK can query the phone's Samsung Health store, including aggregate steps from connected accessories. This is access through the phone, not a Bluetooth sensor stream from the band. Official requirements include Android 10+ and Samsung Health. Development can use Samsung Health developer mode; distribution without that test setting requires Samsung partner registration matching package name/signature and permission scope. Developer mode must not become a production player requirement. See [SDK FAQ](https://developer.samsung.com/health/data/faq.html), [developer mode](https://developer.samsung.com/health/data/guide/developer-mode.html) and [official step-data sample](https://developer.samsung.com/codelab/health/steps-data.html).

Recommendation: first compare the actual shared aggregate using the new diagnostics. If export is the bottleneck, prototype a separate Samsung-only read adapter with the owner in development mode and compare identical date/zone totals on hardware. Do not promise faster delivery before measurement. Keep Health Connect for other devices and never credit the same day twice when switching adapters. SDK licensing/distribution, package signature registration, permission flow and historical reconciliation need validation before adding the vendor library. No vendor binary or secret has been added.

## Fit3 notifications and further communication

Samsung supports choosing phone apps whose notifications are mirrored on Fit3 through Galaxy Wearable → Band settings → Notifications → App notifications. Thus a normal Android notification from Letmoro can be forwarded by the existing Samsung bridge; a custom direct-band protocol is unnecessary for that minimum. See [Samsung Fit3 notification guide](https://www.samsung.com/ae/support/mobile-devices/how-to-manage-notifications-on-the-galaxy-fit3/).

Letmoro does not yet post game notifications. Implementation needs opt-in channels, Android notification permission where applicable, spoiler-safe pending-choice text, deduplication, account/reset cleanup and a physical mirror test. Opening a notification should open the app; narrative decisions remain explicit there. An inactive app cannot detect new game milestones without an authorized background-computation design. No always-on background service or notification permission was silently added.

No supported public Fit3 application/sensor SDK was established by this research. Do not treat Galaxy Watch/Wear OS APIs as Fit3 support or promise an installable band application. Unofficial firmware tools are not part of this project. Heart-rate/live band sensor access remains unverified rather than promised.

## Implemented home-screen widget

A native RemoteViews widget shows Moro centered on a local view of walked route segments and visited landmarks. The summary uses remaining distance when an objective is active, otherwise the last known daily steps/goal. Tapping opens Letmoro. It never renders unknown places, letter bodies or future choices. Black, white and square geometry match the app.

A bounded bitmap and minimal private snapshot are updated while the app is active, at most once per five seconds. The widget retains a last-seen date/time when the app is closed; it is not a background step reader or live offline progression engine. Android's periodic refresh repaints stored data, with outdated daily counts displayed as unknown. Signing out, erasing or switching accounts clears/replaces the snapshot. No Auth identifier/token or full save enters widget preferences. See [Android widget documentation](https://developer.android.com/develop/ui/views/appwidgets).

Native launcher placement, resizing, account isolation and device refresh need physical acceptance. Source/compilation and pure snapshot tests do not replace that check.

## Historical device diagnostic follow-up — before the 0.4.0 correction

The owner clarified that Google Health is the renamed Fitbit app, not the Health Connect settings screen. Google documents the rename in its [Google Health announcement](https://blog.google/products-and-platforms/products/google-health/google-health-app/). Do not conflate these products or treat the Google Health app display as a direct reading of Letmoro's Health Connect query.

The new diagnostic confirms a recent Health Connect read with Samsung Health contributing, whose aggregate is close to Letmoro's displayed estimate but materially below Samsung Health. No personal totals or exact observation timestamps are stored here. The investigation now concerns data export/source selection/query semantics rather than assuming the HUD subtracts spent travel.

Historical hypothesis before 0.4.0: readToday queried local midnight through Instant.now(). Android aggregation tests demonstrate rescaling when a record overlaps the requested window. If a provider exports a cumulative record spanning a larger interval, that could reduce a partial-day aggregate. Compare the current request with the complete local civil-day window and inspect interval/source metadata using minimal, consented diagnostics. This is not confirmed as the cause on this device and no speculative correction or manual step grant was applied. Preserve deduplication, account baseline and unknown-data protections.

## 0.4.0 query correction and acceptance

The foreground query now uses the entire local civil day instead of clipping at the read time. A separately filtered aggregate for `com.sec.android.app.shealth` is preferred when present; the unfiltered aggregate is a fallback for other devices, not a number added to Samsung's. The foreground phone estimate and persisted travel high-water mark continue to avoid duplicate credit. Null remains unknown; actual zero is preserved. Diagnostics show the selected source, full-day Samsung/all-source totals and the old partial-day result for comparison. No additional permissions, raw record export or diagnostic health storage was added.

The owner subsequently confirmed agreement between the app, Samsung Health and wearable totals after synchronization, as recorded in [handoff](handoff.md). This is positive foreground evidence, not proof of complete export in every condition. Remaining physical acceptance: compare the updated diagnostics with Samsung Health immediately after refresh, after walking and after background/resume; then repeat after local midnight. If the full-day Samsung shared total itself remains materially behind Samsung Health, proceed with a separate Samsung Data SDK development adapter under the documented partner/developer-mode constraints. Galaxy Wearable notification mirroring is not a step-reading API. Do not enable life penalties from this patch alone.

Official aggregation semantics and source priority: [Android Health Connect aggregate data](https://developer.android.com/health-and-fitness/health-connect/aggregate-data). Samsung's direct store alternative and connected-wearable sample: [Samsung steps codelab](https://developer.samsung.com/codelab/health/steps-data.html). These documents establish API behavior/options, not the cause on the owner's hardware.


## Owner observation and provider-choice proposal — 2026-11-09

After uninstalling Google Health, the owner reports that all counters agree and plans to keep Samsung Health. This is evidence of the current device configuration, not proof of a particular export chain or provider defect. Letmoro continues to read Health Connect, preferring Samsung's shared daily aggregate; it does not read Galaxy Wearable or the band directly.

For the Android-first, initially Samsung scope, consider an explicit supported-source preference while retaining an automatic option. No selector or new adapter is implemented by this observation. A future change must align today's and historical source policy, explain availability, preserve unknown observations and baseline source changes without duplicate travel. On a second device, restoring cloud progress does not provide access to the first phone's local Health Connect data; cross-device step overlap needs separate reconciliation.
