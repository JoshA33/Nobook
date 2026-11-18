package com.ycngmn.nobook.utils

import com.multiplatform.webview.request.RequestInterceptor
import com.multiplatform.webview.request.WebRequest
import com.multiplatform.webview.request.WebRequestInterceptResult
import com.multiplatform.webview.web.WebViewNavigator

class ExternalRequestInterceptor(
    private val handleExternalUrl: (String) -> Unit
) : RequestInterceptor {

    override fun onInterceptUrlRequest(
        request: WebRequest,
        navigator: WebViewNavigator
    ): WebRequestInterceptResult {

        // Subframe navigations must never launch another app.
        return if (!request.isForMainFrame || isInternalUrl(request.url)) {
            WebRequestInterceptResult.Allow
        } else {
            handleExternalUrl(fbRedirectSanitizer(request.url))
            WebRequestInterceptResult.Reject
        }
    }
}
