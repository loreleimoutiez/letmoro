package app.letmoro.internal
import org.junit.Assert.*
import org.junit.Test
import java.time.Duration
import java.time.LocalDate
import java.time.ZoneId
class StepDayWindowTest {
    @Test fun civilDaysRespectDaylightSavingAndDoNotEndAtReadTime() {
        val zone = ZoneId.of("Europe/Paris")
        for ((date, hours) in listOf("2026-03-29" to 23L, "2026-10-25" to 25L, "2026-11-07" to 24L)) {
            val window = StepDayWindow.forDate(LocalDate.parse(date), zone)
            assertEquals(hours, Duration.between(window.start, window.end).toHours())
            assertEquals(LocalDate.parse(date).plusDays(1).atStartOfDay(), window.end.atZone(zone).toLocalDateTime())
        }
    }
}
