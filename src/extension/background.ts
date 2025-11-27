import { extractText } from "../logic/extractText";

console.log("[background] service worker loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "POLICY_RESULT") {
    const { data, tabId } = msg;

    // acknowledge to popup
    try {
      sendResponse({ status: "ok" });
    } catch {}

    (async () => {
      console.log("[background] Received policy data", data);

      let html = "";
      let text = "";

      if (data.url) {
        try {
          const res = await fetch(data.url);
          const rawHTML = await res.text();
          html = rawHTML;
          text = extractText(rawHTML);
        } catch (err) {
          console.error("Could not fetch policy:", err);
        }
      }

      const finalPayload = {
        found: data.found,
        url: data.url,
        linkText: data.text,
        rawHTML: html,
        plainText: text,
      };

      // if message came from popup, send to content script
      if (sender.tab?.id !== undefined) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: "POLICY_SUMMARY_READY",
          data: finalPayload,
        });
      }

      console.log("[background] Final payload ready", finalPayload);
    })();

    return true;
  }
});
