# Gameplay status — 0.2.1

This is an internal playable opening, not the complete public campaign. The source and local ignored manuscript include the easy first job, twenty additional letters, seven small branching conversations, two optional unpaid errands, thirty contextual thoughts, trust/friendship and sixteen badge conditions. No runtime-generated or AI-generated story is used.

## Playable and saved

- Real-step-funded exploration, cardinal movement, reversal, route learning, long trips, cross-connection and optional sender returns. Remaining objective distance follows actual position. Learned routes stay available; rendering reveals only walked segments and visited places.
- Three campaign-letter slots; explicit acceptance/refusal, sealed/opened/destroyed/returned/delivered outcomes. Delivered items cannot be opened or destroyed. Bodies never appear without opening. Collection preserves known text after destruction.
- Recipient trust changes only on witnessed delivery; sender trust changes on returns, reports and witnessed destruction. Lies can produce later contradictory reports, trust loss and a bounded postal deduction. Friendship requires a choice; negative trust can break it. Trust is a small opening system, not a complete romance/political simulation.
- Optional private thank-you gifts are paid only after return/report, once and without postal deductions. Postal gross pay and four-coin total deductions are disclosed for subsequent jobs. First settlement retains its original reveal.
- Refusing employment supports all ten personal requests without paid alternatives. Declining/destroying/returning letters resolves a request and does not freeze unlocks. Closing the round depends on outcomes, not perfect delivery or accepting every task.
- Persistent one-at-a-time thoughts, context filtering, no offline queue, and readable discovered thoughts. Repeats after exhaustion have a larger travel spacing. A pending thought is dismissed explicitly before main arrival controls reappear.
- Configurable rest weekdays and retained historical schedules. No simulator or intro-replay UI; confirmed full erasure is in Settings. No browser-preview captions or zoom buttons.
- Account-local saves plus deployed owner-only Supabase schema and locally enabled cloud client. Save payload includes the new progression through versioned replay. No new table is necessary for each mechanic.

## Pacing evidence and limits

A deterministic full round, delivering each letter separately and returning to report every delivery, costs approximately 113 personal daily goals. This deliberately inefficient route includes optional returns. Three-letter batching, route choices, refusals and skipped reports alter it. This is simulated distance, not a promise of 113 calendar days, a measured multi-week playtest or a completed year-long campaign. No real-time waiting locks were added.

The first round has a closing scene and outcomes for both employment and refusal. The five major arcs, substantial romances, political commitments, home/spending projects, deeper skills and final personalized epilogue are still to author and implement. Sparse content during long journeys must be assessed on a phone before claiming finished pacing.

## Verification

TypeScript and all 61 behavioral tests pass. Tests cover legacy replay, all twenty deliveries and reports, refusal unlocks, privacy/witnessed trust, delayed contradictory reports, optional personal rewards, one pending thought, friendship loss without badge loss, schedule timing/cooldown and corrected daily data. Native compilation, three Kotlin unit tests and Android lint passed; seven existing non-blocking lint suggestions remain. Kotlin used its fallback compiler because its home daemon directory is read-only.

Browser campaign regression uses synthetic Auth and intercepted cloud HTTP, not a real account: startup/restore, replaced dialogue choices, sealed/opened collection, earned badge, rest settings and cooldown, proportional wheel/two-touch zoom, normal HUD, no test/zoom UI, FR and portrait/landscape. Additional browser checks cover the abstract silent-destination squares, sealed-body privacy and one persistent thought through reload without a queue. Screenshots and harness are external under `/tmp/letmoro-qa/`.

Hosted migration is applied. Metadata and transaction-local access tests verify RLS and grants without reading/writing player records. Cross-device real-account restore, email/OAuth callbacks and closed-day history/corrections still require physical checks. Real life penalties stay disabled. A daily count alone does not validate historical import, multi-day offline travel credit or background execution.

Production builds include the ignored local manuscript for owner testing; generic builds without it must also compile. Full replay still has a 50,000-event limit and needs compaction before a year-long release.

Previous 0.2.0 APK built successfully after source/docs commits. Version 0.2.0 / versionCode 5, application ID unchanged. Signature verification passed; packaged web assets match the final production build and include the local manuscript and correct public backend configuration. No device installation was performed. Artifact: `android/app/build/outputs/apk/debug/app-debug.apk`; no distribution or device installation is implied.

Previous 0.2.0 APK SHA-256: `fef2e91329ab9568349875fbcfa7686348cadcef2f818ed3027c5aef2add5335`. Build uses the existing external debug keystore. Both manuscript-included and generic manuscript-free production builds pass. Vite retains a non-blocking approximately 607 kB minified main-chunk warning.


## Explicit full erasure — 0.2.1

Latest user decision: allow a full fresh start, deleting game data including paths, letters, badges, journal, relationships, profile/settings and local conflict backup while retaining Supabase Auth identity/password/session. This explicit Settings action is distinct from the still-deferred archive-preserving narrative reboot. It intentionally keeps no game archive. It requires confirmation and, when cloud saving is enabled, a successful online null-payload revision before local cleanup. Failed network/CAS writes preserve the local game for retry. Other devices with stale revisions cannot silently restore the erased snapshot. No Auth row or physical Health Connect data/permissions is deleted. Language resets to English; setup returns.

A fresh-start replay marker baselines existing daily health steps instead of reconstructing the previous path; only subsequent increments supply new travel. The actual phone's daily health counter is not falsified or erased. The user authorized a temporary LAN-only APK download for their phone on the same Wi-Fi; no public publication or device install is performed by the agent.
