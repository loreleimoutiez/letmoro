package app.letmoro.internal

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.widget.RemoteViews
import org.json.JSONObject
import java.time.LocalDate
import java.text.DateFormat
import java.util.Date

class MoroWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        for (id in ids) manager.updateAppWidget(id, render(context))
    }
    companion object {
        fun refresh(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, MoroWidgetProvider::class.java))
            for (id in ids) manager.updateAppWidget(id, render(context))
        }
        private fun render(context: Context): RemoteViews {
            val view = RemoteViews(context.packageName, R.layout.moro_widget)
            val raw = context.getSharedPreferences("moro-widget", Context.MODE_PRIVATE).getString("snapshot", null)
            val data = try { raw?.let { JSONObject(it) } } catch (_: Exception) { null }
            val bitmap = Bitmap.createBitmap(400, 160, Bitmap.Config.RGB_565)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.BLACK)
            val paint = Paint().apply { isAntiAlias = false; color = Color.WHITE; strokeWidth = 1f }
            if (data != null) {
                val segments = data.optJSONArray("segments")
                for (index in 0 until minOf(segments?.length() ?: 0, 32)) {
                    val edge = segments!!.getJSONObject(index)
                    fun coordinate(key: String, origin: Float) = origin + edge.optDouble(key, 0.0).coerceIn(-1000000.0, 1000000.0).toFloat() * .5f
                    canvas.drawLine(coordinate("x1", 200f), coordinate("y1", 88f), coordinate("x2", 200f), coordinate("y2", 88f), paint)
                }
                val places = data.optJSONArray("places")
                paint.style = Paint.Style.STROKE
                paint.strokeWidth = 3f
                for (index in 0 until minOf(places?.length() ?: 0, 32)) {
                    val place = places!!.getJSONObject(index)
                    val x = 200 + place.optDouble("x", 0.0).toFloat() * .5f - 22
                    val y = 88 + place.optDouble("y", 0.0).toFloat() * .5f - 18
                    paint.color = try { Color.parseColor(place.optString("color", "#999999")) } catch (_: Exception) { Color.GRAY }
                    canvas.drawRect(x - 7, y - 7, x + 7, y + 7, paint)
                }
                paint.style = Paint.Style.FILL
            }
            paint.color = Color.BLACK
            canvas.drawRect(190f, 65f, 210f, 87f, paint)
            paint.color = Color.WHITE
            canvas.drawRect(193f, 68f, 207f, 82f, paint)
            view.setImageViewBitmap(R.id.widget_scene, bitmap)
            val french = data?.optString("locale") == "fr"
            val remaining = if (data != null && !data.isNull("remaining")) data.optLong("remaining", -1) else -1
            val summary = if (data == null) context.getString(R.string.widget_open)
                else if (remaining >= 0) if (remaining == 0L) { if (french) "Un choix attend" else "A choice is waiting" } else "$remaining " + if (french) "pas jusqu’au prochain choix" else "steps to the next choice"
                else {
                    val today = data.optString("day") == LocalDate.now().toString()
                    val count = if (today && !data.isNull("count")) data.optLong("count").toString() else "—"
                    "$count / ${data.optLong("goal")} " + if (french) "pas du jour" else "steps today"
                }
            view.setTextViewText(R.id.widget_summary, summary)
            view.setTextViewText(R.id.widget_notebook, data?.optString("notebook", "") ?: "")
            val updated = data?.optLong("updatedAt", 0) ?: 0
            view.setTextViewText(R.id.widget_updated, if (updated > 0) (if (french) "Dernière vue : " else "Last seen: ") + DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT).format(Date(updated)) else "")
            val intent = PendingIntent.getActivity(context, 0, Intent(context, MainActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            view.setOnClickPendingIntent(R.id.widget_root, intent)
            return view
        }
    }
}
