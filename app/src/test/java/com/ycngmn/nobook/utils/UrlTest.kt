package com.ycngmn.nobook.utils

import org.junit.Assert.*
import org.junit.Test

class UrlTest {
    @Test fun internalHostsRequireDomainBoundaryAndHttps() {
        listOf("https://facebook.com", "https://m.facebook.com/story", "https://www.messenger.com/")
            .forEach { assertTrue(it, isInternalUrl(it)) }
        listOf("https://evilfacebook.com/", "https://facebook.com.evil.test/", "http://facebook.com/",
            "https://facebook.com@evil.test/", "https://l.facebook.com/l.php", "https://lm.facebook.com/l.php",
            "javascript:alert(1)", "not a url")
            .forEach { assertFalse(it, isInternalUrl(it)) }
    }

    @Test fun preservesEncodedQueryAndFragment() {
        assertEquals("https://example.com:8443/a%20b?q=hello%20world&flag#section",
            fbRedirectSanitizer("https://example.com:8443/a%20b?q=hello%20world&fbclid=abc&flag#section"))
    }

    @Test fun unwrapsBothFacebookRedirectHosts() {
        listOf("l", "lm").forEach { host ->
            assertEquals("https://example.com/?q=a%2Bb#part",
                fbRedirectSanitizer("https://$host.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2F%3Fq%3Da%252Bb%26fbclid%3D123%23part&h=123"))
        }
    }

    @Test fun malformedAndNonWebLinksAreUnchanged() {
        listOf("mailto:test@example.com", "https://l.facebook.com/l.php", "%%%", "https://example.com/?q=%xx")
            .forEach { assertEquals(it, fbRedirectSanitizer(it)) }
    }
}
