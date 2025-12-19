// app/hooks/usePrivacyScan.ts
import { useState, useEffect } from "react";
import { policyFinder } from "../../logic/policyFinder";

export default function userTab() {
  const [loading, setLoading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Check storage on mount to restore hasScanned state
  useEffect(() => {
    const checkScannedState = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      const currentUrl = tab?.url || "";

      const result = await chrome.storage.local.get([
        "hasScanned",
        "scannedUrl",
        "dataCollectionAnswers",
        "dataCollectionUrl",
        "aiUsageResult",
      ]);

      // Check if URL matches
      const urlMatches = result.scannedUrl === currentUrl;

      // Only set hasScanned if scan was explicitly clicked (hasScanned flag exists) and URL matches
      if (result.hasScanned && urlMatches) {
        setHasScanned(true);
      } else if (result.scannedUrl && result.scannedUrl !== currentUrl) {
        // URL changed, clear old scan state
        chrome.storage.local.remove(["hasScanned", "scannedUrl"]);
      }
    };

    checkScannedState();
  }, []);

  const scan = async () => {
    setHasScanned(true);
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

      const currentUrl = tab.url || "";

      // Store hasScanned state with URL and set loading state
      chrome.storage.local.set({
        hasScanned: true,
        scannedUrl: currentUrl,
        dataCollectionLoading: true,
      });

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

  return { scan, loading, hasScanned };
}
