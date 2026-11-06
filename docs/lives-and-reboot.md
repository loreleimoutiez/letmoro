# Lives, rests and deferred reboot systems

## Confirmed current rules

Three red square lives, maximum three. Standard grants two zero-step rest weekdays weekly; Hard one; Free never loses life. Nonzero days below the personal goal do not cost a life. Three consecutive confirmed goal-reaching days restore one life, reset recovery and cap at three; full-life days cannot be banked. Protected zero-step rest suspends recovery. Other below-goal days interrupt it. Missing data cannot prove a qualifying streak and never becomes zero; previous pending recovery is retained for later corrections.

The run captures a fixed time zone and start instant. The first incomplete day and earlier health dates are protected. A full day is eligible only after 24 hours beyond its actual local midnight boundary, including DST. Unknown/inaccessible data never replaces an already known total. Late corrections rebuild outcomes in date order, including reversal of an erroneous terminal loss, without undoing narrative choices or purchases. At zero, gameplay stops and records remain readable.

## Configurable rest weekdays

Settings allows exactly two different weekdays in Standard or one in Hard. All changes, including the first selection, take effect the next Monday in the fixed run time zone. Requests must be at least seven full days apart. Requests made on Monday also wait until the following Monday. Retain immutable schedule history; corrected days use the schedule effective then, never the latest selection retroactively.

Before the first selected schedule takes effect, legacy automatic weekly allowances remain valid. Afterward, only designated confirmed-zero weekdays may consume allowance; an unselected confirmed zero costs a life even if some allowance remains. Weekly allowance is never carried over or refreshed by changing weekdays. Nonzero activity on a selected rest day follows ordinary goal/short-day recovery rules. Free has no rest settings or recovery bank. Difficulty switching is not exposed and requires a separate no-abuse timing policy.

## Health validation boundary

The reducer is deterministic and tested; historical processing is behind VITE_LIFE_RULES=false until physical S23/Fit3 verification. `HealthSteps.readClosedDays` reads a recent 28-day window plus up to seven older recorded dates per refresh with a rotating account-local cursor. It requests no additional permission or background tracking. Missing aggregates remain null. History/corrections do not themselves grant travel steps.

Native historical code now compiles, and Kotlin unit tests/lint pass. This is not a real device test of finalized zeros, midnight, late imports or overlapping sources. Today's live total is not sufficient proof. No punitive health rule should be enabled until real data has been checked. The fictional-day input and all internal simulator UI have been removed; synthetic observations remain only in automated tests and legacy replay compatibility.

## Deferred systems and unresolved boundaries

The user explicitly selected life/rest/recovery first. Emergency pause, one account-wide Standard rescue and archive-preserving production reboot are not implemented.

- Pause must freeze gameplay/narrative timers until manual resumption and preserve lives/streaks; archives stay readable. Start/end boundaries, imported steps during pause and reserve behavior remain to settle. Hard has no emergency pause.
- Standard rescue is once per account and requires the original run goal in one complete day, restoring the same run with one life. Decide offer/acceptance, challenge boundaries, failure/interruption and exactly when the right is consumed. Make consumption server-authoritative and idempotent across accounts/devices/concurrent requests; local reset/reinstall must not renew it. Hard has no rescue; final-loss mode remains decisive.
- Production reboot retains archives only and resets gameplay, relationships, home, money and skills. No permanent XP/cosmetic advantage is approved. Preserve consumed rescue rights separately. Archive schema, acknowledgements and reset transaction remain to design. The removed test reset was never a production reboot.
- Goal changes, mode switching and reserve rebalance need explicit non-retroactive policies. Do not guess rules or change the confirmed-zero-only threshold to punish low nonzero days.

## Acceptance coverage

Behavioral tests cover Standard/Hard allowances, Free, known/unknown/incomplete days, 24-hour grace/DST, recovery/no banking, missing gaps, late corrections, replay and zero-life guards. Schedule tests cover exact day count, duplicates, next-Monday timing, seven-day cooldown and historical correction. Pending: physical data acceptance, pause/rescue/reboot and mode/goal switching. See gameplay-status for current checks and packaging.
