package app.letmoro.internal

import android.Manifest
import android.os.Build
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.getcapacitor.PermissionState
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import android.content.Intent
import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.metadata.DataOrigin
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.util.concurrent.CancellationException
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

@CapacitorPlugin(name = "HealthSteps", permissions = [Permission(alias = "motion", strings = [Manifest.permission.ACTIVITY_RECOGNITION])])
class HealthStepsPlugin : Plugin(), SensorEventListener {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val permissions = setOf(HealthPermission.getReadPermission(StepsRecord::class))
    private lateinit var permissionLauncher: ActivityResultLauncher<Set<String>>
    private var pending: PluginCall? = null
    private var manager: SensorManager? = null
    private var listening = false
    private var liveWanted = false
    private var liveBase: Long? = null
    private var liveCount = 0L
    private var counterOrigin: Long? = null
    private val totals = LiveStepTotals()
    private var lastPublished: Long?
        get() = totals.total
        set(value) { if (value == null) totals.newDay() else totals.observe(value) }
    private var publishedDay: String? = null
    private var providerCount: Long? = null
    private var providerCheckedAt: String? = null
    private var samsungShared = false
    private var providerAllCount: Long? = null
    private var providerSamsungCount: Long? = null
    private var providerPartialCount: Long? = null
    private fun dayKey() = "${LocalDate.now()}|${ZoneId.systemDefault().id}"


    override fun load() {
        permissionLauncher = activity.registerForActivityResult(
            PermissionController.createRequestPermissionResultContract()
        ) {
            pending?.let { readToday(it) }
            pending = null
        }
    }

    private fun result(status: String, count: Long? = null): JSObject = JSObject().apply {
        put("status", status)
        put("dayKey", dayKey())
        put("count", count ?: org.json.JSONObject.NULL)
        put("checkedAt", Instant.now().toString())
        put("live", listening)
        put("providerCount", providerCount ?: org.json.JSONObject.NULL)
        put("providerCheckedAt", providerCheckedAt ?: org.json.JSONObject.NULL)
        put("samsungShared", samsungShared)
        put("providerAllCount", providerAllCount ?: org.json.JSONObject.NULL)
        put("providerSamsungCount", providerSamsungCount ?: org.json.JSONObject.NULL)
        put("providerPartialCount", providerPartialCount ?: org.json.JSONObject.NULL)
        put("providerSource", if (providerSamsungCount != null) "samsung" else "health-connect")
    }

    @PluginMethod
    fun readToday(call: PluginCall) {
        scope.launch {
            try {
                if (HealthConnectClient.getSdkStatus(context) != HealthConnectClient.SDK_AVAILABLE) {
                    call.resolve(result("unavailable"))
                    return@launch
                }
                val client = HealthConnectClient.getOrCreate(context)
                if (!client.permissionController.getGrantedPermissions().containsAll(permissions)) {
                    stopListening()
                    lastPublished = null
                    providerCount = null
                    providerAllCount = null
                    providerSamsungCount = null
                    providerPartialCount = null
                    providerCheckedAt = null
                    samsungShared = false
                    call.resolve(result("permission-required"))
                    return@launch
                }
                val date = LocalDate.now()
                val zone = ZoneId.systemDefault()
                val window = StepDayWindow.forDate(date, zone)
                val response = client.aggregate(AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(window.start, window.end)
                ))
                // Filtered aggregation retains Samsung's own deduplication of phone and band.
                // Never sum it with the all-source result or the foreground phone estimate.
                val samsung = try {
                    client.aggregate(AggregateRequest(
                        metrics = setOf(StepsRecord.COUNT_TOTAL),
                        timeRangeFilter = TimeRangeFilter.between(window.start, window.end),
                        dataOriginFilter = setOf(DataOrigin("com.sec.android.app.shealth"))
                    ))[StepsRecord.COUNT_TOTAL]
                } catch (cancel: CancellationException) { throw cancel } catch (_: Exception) { null }
                // Keep the old window visible in diagnostics to validate the correction on hardware.
                providerPartialCount = try {
                    client.aggregate(AggregateRequest(
                        metrics = setOf(StepsRecord.COUNT_TOTAL),
                        timeRangeFilter = TimeRangeFilter.between(window.start, Instant.now())
                    ))[StepsRecord.COUNT_TOTAL]
                } catch (cancel: CancellationException) { throw cancel } catch (_: Exception) { null }
                if (date != LocalDate.now() || zone != ZoneId.systemDefault()) {
                    call.resolve(result("empty"))
                    return@launch
                }
                providerAllCount = response[StepsRecord.COUNT_TOTAL]
                providerSamsungCount = samsung
                val count = samsung ?: providerAllCount
                providerCount = count
                providerCheckedAt = Instant.now().toString()
                samsungShared = samsung != null
                if (publishedDay != dayKey()) {
                    stopListening()
                    publishedDay = dayKey()
                    lastPublished = null
                }
                val observed = count?.let { maxOf(it, lastPublished ?: 0L, (liveBase ?: 0L) + liveCount) }
                if (observed != null) lastPublished = observed
                if (liveWanted && !listening) beginListening()
                call.resolve(result(if (observed == null) "empty" else "ready", observed))
            } catch (_: SecurityException) {
                call.resolve(result("permission-required"))
            } catch (_: Exception) {
                call.resolve(result("error"))
            }
        }
    }

    @PluginMethod
    fun readClosedDays(call: PluginCall) {
        scope.launch {
            try {
                if (HealthConnectClient.getSdkStatus(context) != HealthConnectClient.SDK_AVAILABLE) {
                    call.resolve(JSObject().put("status", "unavailable").put("days", JSArray()))
                    return@launch
                }
                val client = HealthConnectClient.getOrCreate(context)
                if (!client.permissionController.getGrantedPermissions().containsAll(permissions)) {
                    call.resolve(JSObject().put("status", "permission-required").put("days", JSArray()))
                    return@launch
                }
                val zone = ZoneId.of(call.getString("zone") ?: throw IllegalArgumentException())
                val now = Instant.now()
                val first = LocalDate.parse(call.getString("from") ?: throw IllegalArgumentException()).plusDays(1)
                // No additional history permission: only inspect a recent bounded window.
                var day = maxOf(first, LocalDate.now(zone).minusDays(28))
                val requestedDays = linkedSetOf<LocalDate>()
                while (!day.plusDays(1).atStartOfDay(zone).toInstant().plus(Duration.ofHours(24)).isAfter(now)) {
                    requestedDays.add(day)
                    day = day.plusDays(1)
                }
                // Rotate through older recorded days so late corrections have no fixed expiry.
                val recheck = call.getArray("recheck")
                for (index in 0 until minOf(recheck?.length() ?: 0, 7)) {
                    val candidate = LocalDate.parse(recheck!!.getString(index))
                    if (!candidate.isBefore(first) && !candidate.plusDays(1).atStartOfDay(zone).toInstant().plus(Duration.ofHours(24)).isAfter(now)) requestedDays.add(candidate)
                }
                val days = JSArray()
                for (recordDate in requestedDays.sorted()) {
                    val end = recordDate.plusDays(1).atStartOfDay(zone).toInstant()
                    val start = recordDate.atStartOfDay(zone).toInstant()
                    val count = try {
                        client.aggregate(AggregateRequest(
                            metrics = setOf(StepsRecord.COUNT_TOTAL),
                            timeRangeFilter = TimeRangeFilter.between(start, end)
                        ))[StepsRecord.COUNT_TOTAL]
                    } catch (cancel: CancellationException) { throw cancel } catch (_: Exception) { null }
                    // Missing/inaccessible metrics remain unknown, including old history.
                    days.put(JSObject().apply {
                        put("date", recordDate.toString())
                        put("steps", count ?: org.json.JSONObject.NULL)
                        put("complete", count != null)
                        put("closedAt", end.toString())
                        put("observedAt", now.toString())
                    })
                }
                call.resolve(JSObject().put("status", "ready").put("days", days))
            } catch (_: SecurityException) {
                call.resolve(JSObject().put("status", "permission-required").put("days", JSArray()))
            } catch (_: Exception) {
                call.resolve(JSObject().put("status", "error").put("days", JSArray()))
            }
        }
    }

    @PluginMethod
    fun requestAccess(call: PluginCall) {
        activity.runOnUiThread {
            if (pending != null) {
                call.reject("A permission request is already open")
            } else if (HealthConnectClient.getSdkStatus(context) != HealthConnectClient.SDK_AVAILABLE) {
                call.resolve(result("unavailable"))
            } else {
                pending = call
                try { permissionLauncher.launch(permissions) }
                catch (_: Exception) { pending = null; call.resolve(result("error")) }
            }
        }
    }

    @PluginMethod
    fun stopLiveSteps(call: PluginCall) {
        activity.runOnUiThread { liveWanted = false; stopListening(); call.resolve() }
    }

    @PluginMethod
    fun startLiveSteps(call: PluginCall) {
        activity.runOnUiThread {
            if (Build.VERSION.SDK_INT >= 29 && getPermissionState("motion") != PermissionState.GRANTED) {
                if (call.getBoolean("request", false) == true) requestPermissionForAlias("motion", call, "motionPermission")
                else call.resolve(result(if (lastPublished == null) "empty" else "ready", lastPublished))
                return@runOnUiThread
            }
            startGranted(call)
        }
    }

    @PermissionCallback
    private fun motionPermission(call: PluginCall) {
        if (getPermissionState("motion") == PermissionState.GRANTED) startGranted(call)
        else call.resolve(result(if (lastPublished == null) "empty" else "ready", lastPublished))
    }

    private fun startGranted(call: PluginCall) {
        liveWanted = true
        val floor = call.getLong("minimumTotal", 0L) ?: 0L
        if (publishedDay == dayKey() && floor >= 0) lastPublished = maxOf(lastPublished ?: 0L, floor)
        if (!listening) beginListening()
        call.resolve(result(if (lastPublished == null) "empty" else "ready", lastPublished))
    }

    private fun beginListening() {
        if (lastPublished == null || publishedDay != dayKey() || listening) return
        if (Build.VERSION.SDK_INT >= 29 && getPermissionState("motion") != PermissionState.GRANTED) return
        val sensors = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val sensor = sensors.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR) ?: sensors.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) ?: return
        manager = sensors
        totals.begin(lastPublished ?: 0L)
        liveBase = lastPublished
        liveCount = 0L
        counterOrigin = null
        listening = sensors.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL, 0)
    }

    private fun stopListening() {
        manager?.unregisterListener(this)
        listening = false
        totals.stop()
        liveBase = null
        liveCount = 0L
        counterOrigin = null
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (!listening) return
        if (publishedDay != dayKey()) { stopListening(); return }
        val previousSteps = liveCount
        if (event.sensor.type == Sensor.TYPE_STEP_DETECTOR) liveCount += 1
        else {
            val current = event.values[0].toLong()
            if (counterOrigin == null || current < counterOrigin!!) counterOrigin = current
            liveCount = current - counterOrigin!!
        }
        // Never add two overlapping estimates. Provider totals eventually replace live estimates.
        totals.increment(maxOf(0L, liveCount - previousSteps))
        notifyListeners("stepUpdate", result("ready", lastPublished))
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    override fun handleOnPause() { stopListening(); super.handleOnPause() }
    override fun handleOnResume() { super.handleOnResume(); if (liveWanted) beginListening() }

    @PluginMethod
    fun openSamsungHealth(call: PluginCall) {
        val intent = context.packageManager.getLaunchIntentForPackage("com.sec.android.app.shealth")
        if (intent == null) { call.reject("Samsung Health is unavailable"); return }
        try { activity.startActivity(intent); call.resolve() }
        catch (_: Exception) { call.reject("Samsung Health could not be opened") }
    }

    @PluginMethod
    fun openSettings(call: PluginCall) {
        try {
            activity.startActivity(Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS))
            call.resolve()
        } catch (_: Exception) { call.reject("Health Connect settings are unavailable") }
    }

    override fun handleOnDestroy() {
        stopListening()
        scope.cancel()
        pending?.reject("Activity closed")
        pending = null
        super.handleOnDestroy()
    }
}
