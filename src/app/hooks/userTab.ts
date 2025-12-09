// app/hooks/usePrivacyScan.ts
import { useState } from "react";
import { policyFinder } from "../../logic/policyFinder";

export default function userTab() {
  const [loading, setLoading] = useState(false);

  const scan = async () => {
    setLoading(true);

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

      if (!tab?.id) {
        console.error("No active tab found.");
        setLoading(false);
        return;
      }

      // Inject policyFinder into the webpage
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: policyFinder,
      });

      // Send result to background service worker
      // POLICY_RESULT => POLICY_PAGE
      await chrome.runtime.sendMessage({
        type: "POLICY_PAGE",
        data: result,
        tabId: tab.id,
      });

      console.log("Sent policy page data to the background worker:", result);
    } catch (err) {
      console.error("Scan error:", err);
    }

    setLoading(false);
  };

  return { scan, loading };
}
