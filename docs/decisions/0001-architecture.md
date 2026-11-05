# ADR 0001: Shared web interface with an Android health bridge

Status: accepted initial direction; device integration remains to validate.

## Decision

- React and strict TypeScript for the interface and platform-independent domain logic.
- Vite for local development and production web builds.
- Capacitor for an Android application sharing the web interface.
- Kotlin for a small native health integration, isolated behind an interface.
- Prefer Health Connect for authorized aggregate step reads; validate Samsung Health / Fit3 export behavior on the actual devices before committing to coverage or latency claims.
- Local-first progress with versioned saves. Accounts and cross-device synchronization require a separate architecture and privacy decision before implementation.
- Authored, versioned narrative content with localization keys and explicit preconditions/effects. English source; no translated string concatenation.
- Lightweight CSS square pixels for the initial world. Evaluate canvas only if scene complexity demonstrates a need.
- Unit tests for domain behavior; browser validation for interaction and accessibility; real-device tests for health import.

No engine code may import React, browser storage, or Android APIs. Platform adapters supply step observations and persistence. Health corrections require reconciliation: never subtract from or replay story events blindly.

## Rationale

The product prioritizes readable narrative, a deliberately minimal world, and shared desktop/mobile interactions. A conventional web UI suits these requirements without a game engine. Native Android code remains necessary for authorized health access; a browser alone cannot read Health Connect. A future Wear OS companion would be a separate native surface, not a Fit3 app.

## Data and privacy

Request the minimum health permissions needed, initially step reads only. Do not assume GPS, heart rate, sleep, or location access. Never commit imported health records. Decide explicitly what, if anything, leaves the phone before enabling synchronization. Narrative saves, account rescue use, and health data have different trust and retention requirements.

## References

- [Capacitor documentation](https://capacitorjs.com/docs)
- [Capacitor plugins](https://capacitorjs.com/docs/plugins)
- [Health Connect setup](https://developer.android.com/health-and-fitness/health-connect/get-started)
- [Health Connect aggregation and duplicate handling](https://developer.android.com/health-and-fitness/health-connect/aggregate-data)
- [Samsung Health SDK migration and wearable step sources](https://developer.samsung.com/health/data/migration-guide/overview.html)

## Consequences

Android builds need the Android toolchain and device permissions. Background execution and timely bracelet synchronization are not guaranteed. Cadence-based challenges require independent feasibility checks. Web/mobile save conflicts and the account-wide rescue cannot be solved safely by browser storage alone.
