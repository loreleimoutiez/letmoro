# Lives, death, pause, rescue, and reboot

Implementation plan, not implemented functionality. The current three red squares are a fixed display. Daily life loss/recovery, emergency pause, death, account-wide rescue, and production reboot are not active. The temporary Settings reset is a development utility and must not become the implementation of these rules.

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

## Decisions to resolve when implementation begins

- What establishes a finalized day and confirmed zero? Define time zones, incomplete first days, synchronization grace, denial/revocation, delayed/corrected records and handling of an already-recorded life outcome.
- Set the weekly reset boundary; Monday remains a proposal. Define mode-change timing and shared weekly accounting without restoring used rest days.
- Decide life-recovery behavior at full lives; banking has not been approved. Clarify the Free-mode display and streak behavior.
- Define pause activation/resumption boundaries and whether steps accumulated during pause can enter travel reserve. Do not let narrative timers or choices advance while paused.
- Define rescue acceptance/start, the full rescue-day boundary, consumption of the one account right, failure/denial/interruption, and voluntary reboot interaction. Do not invent an activation window or retroactive rescue credit.
- Define final-outcome presentation and acknowledgement, archive retention across runs, and new-run initialization without confusing account records with run state.

These are open decisions, not permission requests to repeat now. Ask focused questions when the relevant implementation is ready.

## Implementation order

1. **Reliable day accounting.** Separate observations from finalized daily totals; keep explicit unknown/incomplete states. Reconcile source corrections and time-zone changes, with idempotent day processing. Validate real S23/Fit3 behavior before punitive outcomes.
2. **Life loss, rest and recovery.** Implement a pure domain reducer with persisted events for rest consumption, loss, streak changes and recovery. Enforce the three-life cap, mode rules and exactly-once application. Replace the fixed HUD only after behavioral tests pass.
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

No current test or UI description should claim these mechanics already work. Account authentication alone does not implement account-wide rescue storage or policy.
