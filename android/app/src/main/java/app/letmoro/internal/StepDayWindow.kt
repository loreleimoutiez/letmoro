package app.letmoro.internal

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/** A complete civil day avoids prorating a provider's cumulative day record at read time. */
data class StepDayWindow(val start: Instant, val end: Instant) {
    companion object {
        fun forDate(date: LocalDate, zone: ZoneId) = StepDayWindow(
            date.atStartOfDay(zone).toInstant(), date.plusDays(1).atStartOfDay(zone).toInstant()
        )
    }
}
