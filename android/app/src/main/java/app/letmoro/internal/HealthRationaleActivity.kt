package app.letmoro.internal

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.widget.TextView

class HealthRationaleActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(TextView(this).apply {
            text = "Letmoro — step access\n\nLetmoro reads today's step total from Health Connect to display your activity. Only step reading is requested.\n\nIn this internal test, health observations stay in memory on this device. They are not sent to a server or saved in the story journal. They do not change travel, coins, or lives.\n\nYou can revoke access in Health Connect at any time. Missing data never counts as zero steps."
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.BLACK)
            textSize = 18f
            setPadding(32, 64, 32, 32)
        })
    }
}
