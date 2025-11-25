// Service worker startup log to make it easy to verify the worker loaded
console.log("[background] service worker loaded");

/**
 * Note: message ports can be closed if the sender page/popup is moved into
 * the back/forward cache or the popup closes before we reply. To avoid the
 * "message channel is closed" error we:
 *  - attempt an immediate safe acknowledgement (wrapped in try/catch)
 *  - perform long-running work asynchronously and then deliver the final
 *    result by sending a message to the sender's tab (if available)
 *  - always handle chrome.runtime.lastError on sendMessage calls
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "POLICY_RESULT") {
    // Try to acknowledge immediately. This may fail if the channel is already closed.
    try {
      sendResponse?.({ status: "received" });
    } catch (err) {
      console.warn("[background] immediate sendResponse failed:", err);
    }

    (async () => {
      const payload = message.data as unknown;

      // Basic runtime validation / extraction for expected shape
      const found = Boolean((payload as any)?.found ?? false);
      const url =
        typeof (payload as any)?.url === "string"
          ? (payload as any).url
          : String((payload as any)?.url ?? "");
      const text =
        typeof (payload as any)?.text === "string"
          ? (payload as any).text
          : String((payload as any)?.text ?? "");

      console.log("[background] received payload:", { found, url, text });

      // This function will grab the privacy policy url and make a request to read its page and send it back to us.
      async function fethcingPageData(url: string) {
        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const rawText = await response.text();

          console.log(rawText);

          return rawText;
        } catch (error) {
          console.error(`Failed to fetch the rawText ${error}`);
        }
      }

      const result = {
        status: "Success",
        found,
        url,
        text,
        greeting: `Hello from background, got: ${url} (found=${found})`,
        final: fethcingPageData(url),
      };

      // If we have the sender tab id, send a follow-up message there.
      try {
        if (sender?.tab?.id !== undefined) {
          chrome.tabs.sendMessage(
            sender.tab.id,
            { type: "POLICY_RESPONSE", data: result },
            () => {
              if (chrome.runtime.lastError) {
                console.warn(
                  "[background] sendMessage to tab failed:",
                  chrome.runtime.lastError.message,
                );
              }
            },
          );
        } else {
          // No tab to reply to (e.g., message came from an extension page). Log the result.
          console.log("[background] result (no tab):", result);
        }
      } catch (err) {
        console.warn("[background] error sending follow-up message:", err);
      }
    })();

    // Return true to indicate we might call sendResponse asynchronously (even though we already tried)
    return true;
  }
});
