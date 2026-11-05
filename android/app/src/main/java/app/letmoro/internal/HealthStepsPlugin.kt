package app.letmoro.internal

import android.content.Intent
import androidx.activity.result.ActivityResultLauncher
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
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
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

@CapacitorPlugin(name = "HealthSteps")
class HealthStepsPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val permissions = setOf(HealthPermission.getReadPermission(StepsRecord::class))
    private lateinit var permissionLauncher: ActivityResultLauncher<Set<String>>
    private var pending: PluginCall? = null

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
        put("dayKey", "${LocalDate.now()}|${ZoneId.systemDefault().id}")
        put("count", count ?: org.json.JSONObject.NULL)
        put("checkedAt", Instant.now().toString())
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
                    call.resolve(result("permission-required"))
                    return@launch
                }
                val start = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
                val response = client.aggregate(AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(start, Instant.now())
                ))
                // No result is unknown, never a confirmed zero. Let Health Connect deduplicate.
                val count = response[StepsRecord.COUNT_TOTAL]
                call.resolve(result(if (count == null) "empty" else "ready", count))
            } catch (_: SecurityException) {
                call.resolve(result("permission-required"))
            } catch (_: Exception) {
                call.resolve(result("error"))
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
    fun openSettings(call: PluginCall) {
        try {
            activity.startActivity(Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS))
            call.resolve()
        } catch (_: Exception) { call.reject("Health Connect settings are unavailable") }
    }

    override fun handleOnDestroy() {
        scope.cancel()
        pending?.reject("Activity closed")
        pending = null
        super.handleOnDestroy()
    }
}
