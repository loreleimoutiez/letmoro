# Lives, death, pause, rescue, and reboot

Status: life/rest/recovery accounting and a terminal zero-life guard are implemented in source and drive the HUD for recorded finalized days. The historical Health Connect adapter is implemented but real penalties remain disabled by default pending physical validation (`VITE_LIFE_RULES=false`). The internal toolbar can record fictional days. Emergency pause, account-wide rescue and production reboot are deferred by the latest user decision; the test reset remains separate.

Authoritative rules: [product specification](product.md#modes-and-lives) and [decision ledger](decision-ledger.md). Latest user decisions override proposals. Do not activate health penalties before reliable day finalization and real data validation.

## Agreed behavior

| Mechanic | Agreed rule |
| --- | --- |
| Life display | Up to three red squares; no hearts. |
| Life loss | A confirmed zero-step day consumes an available weekly rest day first, otherwise costs one life. Missing, denied, delayed, or unsynchronized data is not zero. Merely missing the daily goal does not cost a life. |
| Free mode | No life loss. |
| Standard mode | Two automatic zero-step rest days per week, no carryover; emergency pause; one final-life rescue per account. |
| Hard mode | One automatic zero-step rest day per week, no carryover; no emergency pause or rescue; zero lives requires a new run. |
| Life recovery | Three consecutive goal-reaching days restore one life, up to three; the counter then resets. Protected rest suspends the streak. An unprotected below-goal day interrupts it. |
| Emergency pause | Freeze all gameplay and narrative timers until manual resumption. Preserve progress, lives and recovery streak; archives remain readable. |
| Final-life rescue | Standard only, once for the entire account. Reach the lost run's original daily goal during one complete day; restore that run with one life. |
| Mode switching | Allowed in either direction, with no exclusive hard reward. The mode at final life loss determines its resolution; switching afterward cannot bypass it, restore lives or refresh rest allowances. |
| Death and reboot | At the applicable terminal outcome, end the run. A reboot resets gameplay progress, money, skills, relationships, home and cosmetics; player archives remain. New traits can be chosen. No permanent gameplay advantages are approved. Rescue is the exception that restores the existing run. |

One confirmed step protects a day from zero-step life loss but does not itself meet the goal or earn recovery. Do not silently introduce another penalty threshold.

## Calendar decisions confirmed 2026-11-06

- A complete local day becomes eligible 24 actual hours after its ending midnight. The run captures the device time zone at accounting initialization and keeps it fixed. This also applies during travel.
- Rest allowances renew Monday at local midnight in that fixed zone, without carryover.
- The incomplete activation day and days before it are protected; legacy runs begin life accounting now rather than receiving retroactive penalties for pre-feature days.
- Missing, inaccessible or incomplete data never becomes zero and never erases a previously confirmed observation. A literal provider total of zero is distinct from an absent metric.
- Late authoritative corrections rebuild daily outcomes in date order, including rest reassignment, recovery and reversal of an incorrect terminal loss. Story events and purchases are not undone. Repeated reads do not apply outcomes twice.
- Recovery is not banked at three lives. Protected rest preserves the streak. Missing days preserve an explicitly pending earlier streak but cannot prove three consecutive qualifying days; filling the gap can resolve it retroactively. A new independently complete three-day streak can still recover a life.
- Free mode keeps three lives, spends no rest and builds no recovery bank. Mode changes are not exposed yet; their timing/accounting policy remains to settle before implementing them.
- Implement lives/rest first. Define pause, rescue and production reboot separately, as the user explicitly selected.

## Remaining decisions for later milestones

Pause activation/resumption and suspended-step handling; mode-change timing without refreshing rests; rescue acceptance, start, failure/interruption and account-wide consumption; production reboot/archive retention and final-outcome acknowledgements remain pending. No rescue right has been issued or consumed by the test utilities.

## Historical input and verification boundary

`HealthSteps.readClosedDays` aggregates complete fixed-zone ranges after the 24-hour margin, checks a recent 28-day window and rotates through up to seven older recorded days per refresh for corrections. A local account-scoped cursor persists this rotation. Inaccessible old history stays unknown. No extra permission or background tracking is requested. The adapter deliberately does not turn a missing aggregate into zero, unlike examples that use a numeric fallback; see [Android aggregate-data documentation](https://developer.android.com/health-and-fitness/health-connect/aggregate-data).

The controller batches changed observations, rejects premature/invalid day boundaries and keeps previous confirmed totals when access/data disappears. Missing values and duplicate observations do not append endless replay events. Counts used for life accounting do not add travel credits. Real history processing remains opt-in until the new native path is tested on S23/Fit3. Kotlin/Android compilation and physical historical-data tests were not run in this session; no APK was built.

The HUD reflects the deterministic saved life state. At zero, gameplay is blocked and archives remain readable. Standard rescue and production reboot have no player action yet. Internal fictional-day controls can exercise the complete loss/recovery/correction sequence without changing actual health totals.

## Implementation order

1. **Reliable day accounting.** Separate observations from finalized daily totals; keep explicit unknown/incomplete states. Reconcile source corrections and time-zone changes, with idempotent day processing. Validate real S23/Fit3 behavior before punitive outcomes.
2. **Life loss, rest and recovery.** Implement a pure domain reducer with persisted events for rest consumption, loss, streak changes and recovery. Enforce the three-life cap, mode rules and exactly-once application. The HUD now uses this tested reducer; live historical input remains validation-gated.
3. **Emergency pause.** Introduce persisted pause state and guard every gameplay/timer entry point, including navigation-driven actions and health credit. Keep archives available. Implement accepted resume/import boundaries rather than guessing them.
4. **Death and terminal outcomes.** Distinguish an active run, paused run and ended run, plus explicit rescue states once their boundaries are decided. Prevent new gameplay after a terminal outcome; do not erase archives automatically. Preserve the mode at final loss.
5. **Account-wide rescue.** Add server-authoritative, transactionally consumed account usage through Supabase with owner-based authorization. Concurrent devices, reinstall, logout, new local saves and the temporary reset must never renew this right. The client must not embed an administrative key. Implement the complete-day challenge and exact run restoration after the remaining rules are settled.
6. **Production reboot.** Separate account/archive records from replaceable run state. Create a new run through an explicit choice, retain archives and rescue usage, and clear only the agreed gameplay state. Replace/remove the temporary reset before public distribution.
7. **UI and localization.** Add concise FR/EN explanations, accessible life status, pause/resume, death, rescue and reboot screens. Confirm consequential choices and preserve player-known narrative information only.

## Required acceptance tests

- Unknown/missing/late data never becomes a zero-step penalty; a below-goal nonzero day does not lose a life.
- Rest is consumed before loss, does not carry over, and cannot be replenished through mode switching.
- Recovery requires exactly three qualifying days, respects protected rest, resets after recovery and never exceeds three lives.
- Reprocessing, reload, offline/resume and delayed corrections do not duplicate loss, recovery or rescue consumption. Define the correction policy before asserting its outcomes.
- Pause survives restart, freezes all gameplay/timers, keeps archives readable and follows the accepted step-import policy.
- The final-loss mode remains decisive after mode changes. Hard mode cannot obtain Standard rescue afterward.
- Standard rescue is unavailable in Hard, cannot be reused on another run/device, restores the original run with one life on success and obeys the agreed failure rules.
- Reboot clears the specified run state while retaining archives and account-wide rescue consumption. Another account's saves and records are untouched.

Do not describe deferred pause/rescue/reboot or unvalidated physical history import as complete. Account authentication alone does not implement account-wide rescue storage or policy.
