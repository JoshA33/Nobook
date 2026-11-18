/*
 * Script to add download buttons for stories, stories highlights and reels on Facebook
 * Original Author: @YeiversonYurgaky
 */

(function() {
  // Configuration
  const CONFIG = {
    buttonZIndex: 999999,
    debug: false
  };

  // Global state
  let isProcessing = false;
  let currentContentContainer = null;
  let lastDownloadedUrl = null;
  const DOWNLOAD_BTN_ID = "nobook-global-downloader";

  // Selectors for finding media content
  const SELECTORS = {
    mediaElements: [
      'div[role="dialog"] video:not([hidden])',
      'div[role="dialog"] img[src*="fbcdn"]:not([width="16"]):not([hidden])',
      'div.x1ey2m1c.x9f619.xds687c.x17qophe.x10l6tqk.x13vifvy[role="presentation"] video',
      'div.x1ey2m1c.x9f619.xds687c.x17qophe.x10l6tqk.x13vifvy[role="presentation"] img[src*="fbcdn"]',
      'div[data-pagelet="Story"] video',
      'div[aria-label*="reel"] video',
      'div[data-pagelet="ProfilePhoto"] img[src*="fbcdn"]'
    ],
    containers: [
      'div[role="dialog"]',
      'div[data-pagelet="Story"]',
      'div[aria-label*="story"]',
      '.story-viewer',
      '.story_viewer',
      'div.x1ey2m1c.x9f619.xds687c.x17qophe.x10l6tqk.x13vifvy[role="presentation"]',
      'div[data-pagelet="ProfilePhoto"]',
      'div[aria-label*="photo"]',
      'div[data-pagelet*="ProfileAppSection"]'
    ],
    storyIndicators: [
      'div[data-sigil="story-viewer"]',
      'div[data-sigil="story-popup-header"]',
      'div[data-sigil="story-tray-item"]',
      ".story_body_container",
      ".story_viewer",
      ".story-container",
      'div[aria-label*="highlight"]',
      'div[aria-label*="Highlight"]',
      'div.x1ey2m1c.x9f619.xds687c.x17qophe.x10l6tqk.x13vifvy[role="presentation"]',
      'div[data-pagelet="ProfilePhoto"]'
    ]
  };

  // Utility functions
  const debugLog = (...args) => CONFIG.debug && console.log("[ContentDownloader]", ...args);

  const visibleArea = element => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return 0;
    return Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)) *
      Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
  };
  const isElementVisible = element => visibleArea(element) > 0;
  const mediaUrl = element => element.currentSrc || element.src || element.querySelector('source[src]')?.src || '';
  const findContentContainer = element => {
    for (const selector of SELECTORS.containers) {
      const container = element?.closest(selector);
      if (container) return container;
    }
    return element?.parentElement;
  };
  const getCurrentMediaElement = () => {
    const videos = Array.from(document.querySelectorAll('video:not([hidden])'))
      .filter(isElementVisible).sort((a, b) => visibleArea(b) - visibleArea(a));
    // Never substitute an avatar or poster when a video is loading/unavailable.
    if (videos.length) return videos[0];
    if (/\/(reel|reels|videos|watch)(\/|$)/.test(location.pathname)) return null;
    return Array.from(document.querySelectorAll('img[src*="fbcdn"]:not([hidden])'))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width >= 150 && rect.height >= 150 && isElementVisible(el);
      }).sort((a, b) => visibleArea(b) - visibleArea(a))[0];
  };

  // Check if we are in a story or reel view
  const isInStoryOrReelView = () => {
    // URL pattern checks
    const url = window.location.href;
    if (
      url.includes("/stories/") ||
      url.includes("/reel/") ||
      url.includes("/videos/") ||
      url.includes("/watch/?") ||
      url.includes("/photo") ||
      url.includes("/photos/") ||
      url.includes("/highlights/")
    ) {
      return true;
    }

    // Element selectors check
    for (const selector of SELECTORS.storyIndicators) {
      if (document.querySelector(selector)) {
        return true;
      }
    }

    return false;
  };

  let downloadInProgress = false;
  const extractAndDownloadMedia = async () => {
    if (downloadInProgress) return;
    const media = getCurrentMediaElement();
    const url = media && mediaUrl(media);
    if (!url) { window.alert('This media is not ready to download. Try playing it first.'); return; }
    downloadInProgress = true;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const blob = await response.blob();
      if (!blob.size) throw new Error('Empty media');
      if (media.tagName === 'VIDEO' && !blob.type.startsWith('video/')) {
        throw new Error('No downloadable video source');
      }
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      if (!window.DownloadBridge?.downloadBase64File) throw new Error('Download bridge unavailable');
      window.DownloadBridge.downloadBase64File(data, blob.type || 'application/octet-stream');
    } catch (error) {
      console.error('Nobook download failed', error);
      window.alert('Unable to download this media. Streaming video may not have a downloadable source.');
    } finally { downloadInProgress = false; }
  };

  // Create and manage download button
  const createDownloadButton = () => {
    // Add CSS for the button
    const css = `
      #${DOWNLOAD_BTN_ID} {
        position: fixed;
        top: 70px;
        right: 15px;
        width: 40px;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 50%;
        z-index: ${CONFIG.buttonZIndex};
        border: none;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        cursor: pointer;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 960 960" fill="white"><path d="M480,640L280,440L336,384L440,488L440,160L520,160L520,488L624,384L680,440L480,640ZM240,800Q207,800 183.5,776.5Q160,753 160,720L160,600L240,600L240,720Q240,720 240,720Q240,720 240,720L720,720Q720,720 720,720Q720,720 720,720L720,600L800,600L800,720Q800,753 776.5,776.5Q753,800 720,800L240,800Z"/></svg>');
        background-repeat: no-repeat;
        background-position: center;
        background-size: 24px;
      }
      #${DOWNLOAD_BTN_ID}.visible {
        display: flex !important;
      }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    // Create button element
    const btn = document.createElement("button");
    btn.id = DOWNLOAD_BTN_ID;
    btn.setAttribute("aria-label", "Download content");

    btn.addEventListener("click", () => {
      // Reset state
      currentContentContainer = null;
      lastDownloadedUrl = null;

      // Find current media and container
      const mediaElement = getCurrentMediaElement();
      if (mediaElement) {
        currentContentContainer = findContentContainer(mediaElement);
      }

      extractAndDownloadMedia();
    });

    document.body.appendChild(btn);

    return btn;
  };

  // Show/hide download button based on context
  const updateButtonVisibility = () => {
    let btn = document.getElementById(DOWNLOAD_BTN_ID);
    if (!btn) btn = createDownloadButton();

    if (isInStoryOrReelView() && !isFeed()) {
      const mediaElement = getCurrentMediaElement();

      // Always hide "Open in App" buttons
      hideOpenAppButtons();

      if (mediaElement) {
        currentContentContainer = findContentContainer(mediaElement);
        btn.classList.add("visible");
        return;
      }

      // Special case for highlighted stories
      const highlightedStoryContainer = document.querySelector(
        'div.x1ey2m1c.x9f619.xds687c.x17qophe.x10l6tqk.x13vifvy[role="presentation"]'
      );

      if (highlightedStoryContainer) {
        const mediaInHighlight = highlightedStoryContainer.querySelector(
          'video, img[src*="fbcdn"]'
        );

        if (mediaInHighlight && isElementVisible(mediaInHighlight)) {
          currentContentContainer = highlightedStoryContainer;
          btn.classList.add("visible");
          return;
        }
      }
    }

    // Hide button if not in relevant view
    btn.classList.remove("visible");
    currentContentContainer = null;
  };

  const hideOpenAppButtons = (root = document) => {
        // Find all div[role="button"] elements
        const buttons = root.querySelectorAll('div[role="button"]');

        buttons.forEach(button => {
          // Check if it contains div.fl.ac with a span containing the 󱥬 symbol
          const flAcDiv = button.querySelector('div.fl.ac');

          if (flAcDiv) {
            const span = flAcDiv.querySelector('span');
            if (span && span.textContent.includes('󱥬')) {
              button.style.display = 'none';
            }
          }
        });
  };

  // Main processing function
  const processPage = () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      updateButtonVisibility();
    } finally {
      isProcessing = false;
    }
  };

  let scheduled = false;
  const scheduleProcess = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; processPage(); });
  };
  window.addEventListener('scroll', scheduleProcess, { passive: true });
  window.addEventListener('resize', scheduleProcess);
  window.addEventListener('popstate', scheduleProcess);

  // Initialize
  const init = () => {
    // Reset state
    currentContentContainer = null;
    lastDownloadedUrl = null;

    // Initial check
    processPage();

    // Set up DOM observer
    const observer = new MutationObserver(mutations => {
      const hasRelevantChanges = mutations.some(
        mutation =>
          (mutation.type === "childList" && mutation.addedNodes.length > 0) ||
          (mutation.type === "attributes" &&
            (mutation.target.tagName === "VIDEO" ||
             mutation.target.tagName === "IMG"))
      );
      if (hasRelevantChanges) scheduleProcess();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "style", "class"]
    });
  };

  // Start when document is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();