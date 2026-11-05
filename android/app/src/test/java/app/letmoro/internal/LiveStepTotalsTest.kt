package app.letmoro.internal

import org.junit.Assert.*
import org.junit.Test

class LiveStepTotalsTest {
    @Test fun liveAndProviderReadingsDoNotDuplicateSteps() {
        val totals = LiveStepTotals()
        totals.observe(140)
        assertTrue(totals.begin())
        totals.increment(1)
        totals.increment(1)
        assertEquals(142L, totals.total)
        totals.observe(142)
        assertEquals(142L, totals.total)
        totals.observe(139)
        assertEquals(142L, totals.total)
        totals.increment(1)
        assertEquals(143L, totals.total)
    }
    @Test fun resumeUsesTheLastAcceptedEstimateWithoutReplayingEarlierMotion() {
        val totals = LiveStepTotals()
        totals.observe(140)
        totals.begin()
        totals.increment(3)
        totals.stop()
        totals.observe(141)
        totals.begin(143)
        totals.increment(1)
        assertEquals(144L, totals.total)
    }
    @Test fun unavailableAndNewDayReadingsDoNotFabricateZero() {
        val totals = LiveStepTotals()
        assertFalse(totals.begin())
        totals.observe(null)
        assertNull(totals.total)
        totals.observe(10)
        totals.newDay()
        assertNull(totals.total)
        totals.observe(0)
        assertTrue(totals.begin())
        totals.increment(1)
        assertEquals(1L, totals.total)
    }
}
