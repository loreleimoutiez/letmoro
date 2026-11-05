package app.letmoro.internal

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

@CapacitorPlugin(name = "SecureSession")
class SecureSessionPlugin : Plugin() {
    private val alias = "letmoro.auth.v1"
    private fun key(): SecretKey {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (store.getKey(alias, null) as? SecretKey)?.let { return it }
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
        }.generateKey()
    }
    private fun valid(call: PluginCall): String? {
        val name = call.getString("key")
        if (name == null || !name.startsWith("letmoro.auth.") || name.length > 160) { call.reject("Invalid session key"); return null }
        return name
    }
    @PluginMethod
    @Synchronized
    fun get(call: PluginCall) {
        val name = valid(call) ?: return
        try {
            val stored = context.getSharedPreferences(alias, 0).getString(name, null)
            if (stored == null) { call.resolve(JSObject().put("value", org.json.JSONObject.NULL)); return }
            val bytes = Base64.decode(stored, Base64.NO_WRAP)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, bytes.copyOfRange(0, 12)))
            cipher.updateAAD(name.toByteArray(Charsets.UTF_8))
            val value = String(cipher.doFinal(bytes.copyOfRange(12, bytes.size)), Charsets.UTF_8)
            call.resolve(JSObject().put("value", value))
        } catch (_: Exception) { call.reject("Session storage unavailable") }
    }
    @PluginMethod
    @Synchronized
    fun set(call: PluginCall) {
        val name = valid(call) ?: return
        val value = call.getString("value") ?: run { call.reject("Missing session value"); return }
        if (value.length > 131072) { call.reject("Session value too large"); return }
        try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.ENCRYPT_MODE, key())
            cipher.updateAAD(name.toByteArray(Charsets.UTF_8))
            val encoded = Base64.encodeToString(cipher.iv + cipher.doFinal(value.toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)
            if (!context.getSharedPreferences(alias, 0).edit().putString(name, encoded).commit()) throw IllegalStateException()
            call.resolve()
        } catch (_: Exception) { call.reject("Session storage unavailable") }
    }
    @PluginMethod
    @Synchronized
    fun remove(call: PluginCall) {
        val name = valid(call) ?: return
        if (context.getSharedPreferences(alias, 0).edit().remove(name).commit()) call.resolve()
        else call.reject("Session storage unavailable")
    }
}
