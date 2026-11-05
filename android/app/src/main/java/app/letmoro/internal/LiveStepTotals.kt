package app.letmoro.internal

// Two observations of overlapping steps must never be added together.
internal class LiveStepTotals {
    var total: Long? = null
        private set
    private var base: Long? = null
    private var steps = 0L
    fun observe(provider: Long?) {
        if (provider != null) total = maxOf(provider, total ?: 0L, (base ?: 0L) + steps)
    }
    fun begin(minimum: Long = 0L): Boolean {
        if (total == null) return false
        total = maxOf(total!!, minimum)
        base = total
        steps = 0L
        return true
    }
    fun increment(amount: Long) {
        require(amount >= 0)
        val anchor = base ?: return
        steps += amount
        total = maxOf(total ?: 0L, anchor + steps)
    }
    fun stop() { base = null; steps = 0L }
    fun newDay() { stop(); total = null }
}
