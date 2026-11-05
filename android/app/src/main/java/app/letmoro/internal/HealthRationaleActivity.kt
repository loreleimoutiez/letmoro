package app.letmoro.internal

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.widget.TextView
import android.widget.ScrollView

class HealthRationaleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(ScrollView(this).apply { addView(TextView(this@HealthRationaleActivity).apply {
            setText(R.string.health_rationale)
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.BLACK)
            textSize = 18f
            setPadding(32, 64, 32, 32)
        }) })
    }
}
