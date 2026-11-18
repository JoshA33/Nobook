package com.ycngmn.nobook.utils

import java.net.URI
import java.net.URLDecoder

fun isInternalUrl(link: String): Boolean = runCatching {
    val uri = URI(link)
    val host = uri.host?.lowercase() ?: return false
    uri.scheme.equals("https", true) &&
        host !in setOf("l.facebook.com", "lm.facebook.com") &&
        (host == "facebook.com" || host.endsWith(".facebook.com") ||
            host == "messenger.com" || host.endsWith(".messenger.com"))
}.getOrDefault(false)

fun fbRedirectSanitizer(link: String): String = runCatching {
    var uri = URI(link)
    if (uri.host?.lowercase() in setOf("l.facebook.com", "lm.facebook.com") &&
        uri.path == "/l.php") {
        val target = uri.rawQuery.orEmpty().split('&')
            .firstOrNull { it.substringBefore('=') == "u" }
            ?.substringAfter('=', "") ?: return link
        uri = URI(URLDecoder.decode(target, "UTF-8"))
    }
    if (uri.scheme?.lowercase() !in setOf("http", "https") || uri.host == null) return link
    // Keep existing escaping, valueless parameters, ports and fragments intact.
    val query = uri.rawQuery?.split('&')?.filterNot {
        URLDecoder.decode(it.substringBefore('='), "UTF-8") == "fbclid"
    }?.joinToString("&")
    buildString {
        append(uri.scheme).append("://").append(uri.rawAuthority)
        append(uri.rawPath.orEmpty())
        if (!query.isNullOrEmpty()) append('?').append(query)
        uri.rawFragment?.let { append('#').append(it) }
    }
}.getOrDefault(link)
