package app.letmoro.internal

import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import android.content.Context
import org.json.JSONObject

@CapacitorPlugin(name = "MoroWidget")
class MoroWidgetPlugin : Plugin() {
    @PluginMethod
    fun update(call: PluginCall) {
        try {
            val raw = call.getString("snapshot")
            val prefs = context.getSharedPreferences("moro-widget", Context.MODE_PRIVATE).edit()
            if (raw == null) prefs.clear() else {
                require(raw.length <= 20000)
                val source = JSONObject(raw)
                val snapshot = JSONObject()
                for (key in listOf("notebook", "locale", "segments", "places", "remaining", "count", "day", "goal", "updatedAt")) snapshot.put(key, source.opt(key))
                prefs.putString("snapshot", snapshot.toString())
            }
            prefs.apply()
            MoroWidgetProvider.refresh(context)
            call.resolve()
        } catch (_: Exception) { call.reject("Widget update unavailable") }
    }
}
