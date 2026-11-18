package com.ycngmn.nobook.utils

import androidx.annotation.RawRes
import org.json.JSONObject

data class Script(
    val isEnabled: Boolean,
    @param:RawRes val resourceId: Int,
    val scriptTitle: String
)

suspend fun fetchScripts(
    scripts: List<Script>,
    fallbackContent: (Int) -> String
): String = buildString {
    // Use scripts tested with this APK, without replacing local fixes from main.
    scripts.filter { it.isEnabled }.forEach { script ->
        val key = JSONObject.quote(script.scriptTitle)
        appendLine(";(function() {")
        appendLine("window.__nobookScripts = window.__nobookScripts || Object.create(null);")
        appendLine("if (window.__nobookScripts[$key]) return;")
        appendLine("try {")
        appendLine(fallbackContent(script.resourceId))
        appendLine("window.__nobookScripts[$key] = true;")
        appendLine("} catch (error) { console.error('Nobook script failed', $key, error); }")
        appendLine("})();")
    }
}
